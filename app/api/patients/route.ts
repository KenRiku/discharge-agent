import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPatientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(7, "Phone number is required"),
  procedureType: z.string().min(1, "Procedure type is required"),
  dischargeDate: z.string().min(1, "Discharge date is required"),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { procedureType: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      enrolledBy: { select: { name: true } },
      callSchedules: { orderBy: { scheduledDay: "asc" } },
      escalations: { where: { resolvedAt: null } },
      _count: { select: { calls: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ patients });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = createPatientSchema.parse(body);

    const dischargeDate = new Date(validated.dischargeDate);
    const dob = new Date(validated.dob);

    const patient = await prisma.patient.create({
      data: {
        name: validated.name,
        dob,
        phone: validated.phone,
        procedureType: validated.procedureType,
        dischargeDate,
        notes: validated.notes,
        enrolledById: (session.user as any).id,
      },
    });

    // Auto-generate call schedules for day 1, 3, 7
    for (const day of [1, 3, 7]) {
      const scheduledDate = new Date(dischargeDate);
      scheduledDate.setDate(scheduledDate.getDate() + day);

      await prisma.callSchedule.create({
        data: {
          patientId: patient.id,
          scheduledDay: day,
          scheduledDate,
        },
      });
    }

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
