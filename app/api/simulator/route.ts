import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSimulatedCall, getInitialGreeting } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { patientId, transcript, patientMessage, scheduleId } = body;

    // Get patient and procedure template
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, procedureType: true },
    });

    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const template = await prisma.procedureTemplate.findUnique({
      where: { procedureType: patient.procedureType },
    });

    if (!template) {
      return NextResponse.json({ error: "No template found for procedure type" }, { status: 404 });
    }

    // Initial greeting (empty transcript + no patient message)
    if (!patientMessage && (!transcript || transcript.length === 0)) {
      const greeting = await getInitialGreeting(patient.procedureType, patient.name);
      return NextResponse.json({
        agentResponse: greeting,
        isComplete: false,
        analysis: null,
      });
    }

    const { agentResponse, isComplete, analysis } = await runSimulatedCall(
      transcript || [],
      patient.procedureType,
      template.questions as any[],
      template.redFlagRules as any[],
      patientMessage
    );

    // If call is complete, save to database
    if (isComplete && analysis) {
      const fullTranscript = [
        ...(transcript || []),
        { role: "patient", content: patientMessage },
        { role: "agent", content: agentResponse },
      ];

      const call = await prisma.call.create({
        data: {
          patientId: patient.id,
          scheduleId: scheduleId || null,
          completedAt: new Date(),
          transcript: fullTranscript,
          painScore: analysis.painScore,
          medAdherence: analysis.medAdherence,
          flagStatus: analysis.flagStatus,
          flagReason: analysis.flagReason,
          summary: analysis.summary,
        },
      });

      // Update schedule if provided
      if (scheduleId) {
        await prisma.callSchedule.update({
          where: { id: scheduleId },
          data: { status: "COMPLETED", callId: call.id },
        });
      }

      // Create escalation if red flag
      if (analysis.flagStatus === "RED" || analysis.flagStatus === "YELLOW") {
        await prisma.escalation.create({
          data: {
            callId: call.id,
            patientId: patient.id,
            severity: analysis.flagStatus as "RED" | "YELLOW",
            reason: analysis.flagReason || "Symptoms require follow-up",
          },
        });

        // Update patient status
        await prisma.patient.update({
          where: { id: patient.id },
          data: { status: analysis.flagStatus === "RED" ? "ESCALATED" : "IN_PROGRESS" },
        });
      } else {
        // Check if all schedules are complete
        const pendingSchedules = await prisma.callSchedule.count({
          where: { patientId: patient.id, status: "PENDING" },
        });
        if (pendingSchedules === 0) {
          await prisma.patient.update({
            where: { id: patient.id },
            data: { status: "COMPLETED" },
          });
        } else {
          await prisma.patient.update({
            where: { id: patient.id },
            data: { status: "IN_PROGRESS" },
          });
        }
      }

      return NextResponse.json({
        agentResponse,
        isComplete: true,
        analysis,
        callId: call.id,
        patientStatus: analysis.flagStatus,
      });
    }

    return NextResponse.json({ agentResponse, isComplete: false, analysis: null });
  } catch (error) {
    console.error("Simulator error:", error);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
