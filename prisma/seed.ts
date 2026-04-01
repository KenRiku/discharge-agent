import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const procedureTemplates = [
  {
    procedureType: "Knee Replacement",
    questions: [
      { id: "q1", text: "On a scale of 0 to 10, what is your current pain level?", type: "pain_score" },
      { id: "q2", text: "Are you taking your prescribed pain medications as directed?", type: "med_adherence" },
      { id: "q3", text: "Have you been doing your physical therapy exercises today?", type: "yesno" },
      { id: "q4", text: "Is there any new swelling, redness, or warmth around your knee?", type: "yesno_redFlag" },
      { id: "q5", text: "Are you able to walk with your assistive device as instructed?", type: "yesno" },
      { id: "q6", text: "Have you noticed any signs of infection such as fever above 101°F?", type: "yesno_redFlag" },
      { id: "q7", text: "Do you have any questions or concerns about your recovery?", type: "open" },
    ],
    redFlagRules: [
      { trigger: "pain_score >= 8", severity: "RED", reason: "Severe pain score (8+)" },
      { trigger: "pain_score >= 6", severity: "YELLOW", reason: "Moderate-high pain score (6-7)" },
      { trigger: "q4 == yes", severity: "RED", reason: "Possible wound complications or DVT" },
      { trigger: "q6 == yes", severity: "RED", reason: "Signs of infection reported" },
      { trigger: "med_adherence == no", severity: "YELLOW", reason: "Not taking medications as prescribed" },
    ],
  },
  {
    procedureType: "Cardiac Surgery",
    questions: [
      { id: "q1", text: "On a scale of 0 to 10, what is your current pain or chest discomfort level?", type: "pain_score" },
      { id: "q2", text: "Are you taking all your heart medications as prescribed, including blood thinners?", type: "med_adherence" },
      { id: "q3", text: "Have you experienced any shortness of breath at rest or with minimal activity?", type: "yesno_redFlag" },
      { id: "q4", text: "Any chest tightness, palpitations, or irregular heartbeat sensations?", type: "yesno_redFlag" },
      { id: "q5", text: "Have you noticed any swelling in your legs or ankles?", type: "yesno_redFlag" },
      { id: "q6", text: "Are you monitoring your weight daily as instructed?", type: "yesno" },
      { id: "q7", text: "Have you gained more than 2 pounds in the last 24 hours?", type: "yesno_redFlag" },
      { id: "q8", text: "Any concerns about your incision site?", type: "open" },
    ],
    redFlagRules: [
      { trigger: "pain_score >= 7", severity: "RED", reason: "Chest pain/discomfort score 7+" },
      { trigger: "pain_score >= 5", severity: "YELLOW", reason: "Moderate chest discomfort" },
      { trigger: "q3 == yes", severity: "RED", reason: "Shortness of breath at rest" },
      { trigger: "q4 == yes", severity: "RED", reason: "Chest tightness or palpitations" },
      { trigger: "q5 == yes", severity: "YELLOW", reason: "Edema in extremities" },
      { trigger: "q7 == yes", severity: "RED", reason: "Rapid weight gain (fluid retention)" },
      { trigger: "med_adherence == no", severity: "RED", reason: "Not taking cardiac medications" },
    ],
  },
  {
    procedureType: "Appendectomy",
    questions: [
      { id: "q1", text: "On a scale of 0 to 10, what is your current pain level around the incision?", type: "pain_score" },
      { id: "q2", text: "Are you taking your prescribed antibiotics and pain medications as directed?", type: "med_adherence" },
      { id: "q3", text: "Have you been able to eat and drink without nausea or vomiting?", type: "yesno" },
      { id: "q4", text: "Is there any redness, swelling, or discharge from your incision site?", type: "yesno_redFlag" },
      { id: "q5", text: "Have you had a fever above 100.4°F in the last 24 hours?", type: "yesno_redFlag" },
      { id: "q6", text: "Are you passing gas or having normal bowel movements?", type: "yesno" },
      { id: "q7", text: "Any new or worsening abdominal pain since discharge?", type: "yesno_redFlag" },
    ],
    redFlagRules: [
      { trigger: "pain_score >= 7", severity: "RED", reason: "High post-operative pain (7+)" },
      { trigger: "pain_score >= 5", severity: "YELLOW", reason: "Moderate pain score (5-6)" },
      { trigger: "q4 == yes", severity: "RED", reason: "Wound infection signs" },
      { trigger: "q5 == yes", severity: "RED", reason: "Post-op fever" },
      { trigger: "q7 == yes", severity: "RED", reason: "New/worsening abdominal pain" },
      { trigger: "med_adherence == no", severity: "YELLOW", reason: "Not completing antibiotic course" },
    ],
  },
  {
    procedureType: "Hip Replacement",
    questions: [
      { id: "q1", text: "On a scale of 0 to 10, what is your current pain level?", type: "pain_score" },
      { id: "q2", text: "Are you taking your blood clot prevention medication as prescribed?", type: "med_adherence" },
      { id: "q3", text: "Are you following hip precautions — not crossing your legs or bending past 90 degrees?", type: "yesno" },
      { id: "q4", text: "Any calf pain, swelling, or leg redness that could indicate a blood clot?", type: "yesno_redFlag" },
      { id: "q5", text: "Have you experienced any sudden sharp hip pain or inability to bear weight?", type: "yesno_redFlag" },
      { id: "q6", text: "Are you attending your physical therapy sessions?", type: "yesno" },
      { id: "q7", text: "Any concerns about your mobility or daily activities?", type: "open" },
    ],
    redFlagRules: [
      { trigger: "pain_score >= 8", severity: "RED", reason: "Severe pain (8+) — possible dislocation" },
      { trigger: "pain_score >= 6", severity: "YELLOW", reason: "Moderate-high pain score" },
      { trigger: "q4 == yes", severity: "RED", reason: "DVT symptoms" },
      { trigger: "q5 == yes", severity: "RED", reason: "Possible hip dislocation" },
      { trigger: "med_adherence == no", severity: "RED", reason: "Missing blood clot prevention medication" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Seed procedure templates
  for (const template of procedureTemplates) {
    await prisma.procedureTemplate.upsert({
      where: { procedureType: template.procedureType },
      update: { questions: template.questions, redFlagRules: template.redFlagRules },
      create: template,
    });
  }
  console.log("✅ Procedure templates seeded");

  // Create demo admin user
  const passwordHash = await bcrypt.hash("Demo@AfterCall2024", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aftercall.app" },
    update: {},
    create: {
      email: "admin@aftercall.app",
      passwordHash,
      name: "Dr. Sarah Chen",
      role: "ADMIN",
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: "nurse@aftercall.app" },
    update: {},
    create: {
      email: "nurse@aftercall.app",
      passwordHash: await bcrypt.hash("Demo@AfterCall2024", 10),
      name: "James Rivera, RN",
      role: "NURSE",
    },
  });

  console.log("✅ Demo users seeded");

  // Create demo patients with various statuses
  const today = new Date();
  const demoPatients = [
    {
      name: "Margaret Thompson",
      dob: new Date("1948-03-15"),
      phone: "555-0101",
      procedureType: "Knee Replacement",
      dischargeDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      status: "COMPLETED" as const,
    },
    {
      name: "Robert Kim",
      dob: new Date("1962-11-08"),
      phone: "555-0102",
      procedureType: "Cardiac Surgery",
      dischargeDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: "ESCALATED" as const,
    },
    {
      name: "Patricia Santos",
      dob: new Date("1975-06-22"),
      phone: "555-0103",
      procedureType: "Appendectomy",
      dischargeDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS" as const,
    },
    {
      name: "William Foster",
      dob: new Date("1955-09-30"),
      phone: "555-0104",
      procedureType: "Hip Replacement",
      dischargeDate: new Date(today),
      status: "ENROLLED" as const,
    },
    {
      name: "Helen Nguyen",
      dob: new Date("1968-04-12"),
      phone: "555-0105",
      procedureType: "Knee Replacement",
      dischargeDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: "IN_PROGRESS" as const,
    },
  ];

  for (const patientData of demoPatients) {
    // Check if patient already exists
    const existingPatient = await prisma.patient.findFirst({
      where: { name: patientData.name },
    });
    if (existingPatient) continue;

    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        enrolledById: admin.id,
      },
    });

    // Create call schedules
    for (const day of [1, 3, 7]) {
      const scheduledDate = new Date(patientData.dischargeDate.getTime() + day * 24 * 60 * 60 * 1000);
      const isPast = scheduledDate < today;

      await prisma.callSchedule.create({
        data: {
          patientId: patient.id,
          scheduledDay: day,
          scheduledDate,
          status: isPast && patientData.status !== "ENROLLED" ? "COMPLETED" : "PENDING",
        },
      });
    }

    // Add completed calls for certain patients
    if (patientData.status === "ESCALATED") {
      const call = await prisma.call.create({
        data: {
          patientId: patient.id,
          startedAt: new Date(today.getTime() - 2 * 60 * 60 * 1000),
          completedAt: new Date(today.getTime() - 1.5 * 60 * 60 * 1000),
          transcript: [
            { role: "agent", content: "Hello! I'm calling from AfterCall on behalf of your care team. How are you feeling today?" },
            { role: "patient", content: "Not great. I've been having some chest tightness and feel really short of breath." },
            { role: "agent", content: "I'm sorry to hear that. On a scale of 0 to 10, how would you rate your pain or discomfort?" },
            { role: "patient", content: "About an 8 or 9. It's quite bad." },
            { role: "agent", content: "Are you taking all your heart medications as prescribed, including your blood thinners?" },
            { role: "patient", content: "Yes I've been taking everything." },
            { role: "agent", content: "Have you experienced any shortness of breath at rest?" },
            { role: "patient", content: "Yes, even just sitting I'm short of breath. I'm worried." },
          ],
          painScore: 8,
          medAdherence: true,
          flagStatus: "RED",
          flagReason: "Chest pain (8/10), shortness of breath at rest — possible cardiac event",
          summary: "Patient reports severe chest pain (8/10) and shortness of breath at rest following cardiac surgery. HIGH PRIORITY: Immediate physician callback required.",
        },
      });

      await prisma.escalation.create({
        data: {
          callId: call.id,
          patientId: patient.id,
          severity: "RED",
          reason: "Chest pain 8/10 + shortness of breath at rest post-cardiac surgery",
        },
      });

      // Update patient status
      await prisma.patient.update({
        where: { id: patient.id },
        data: { status: "ESCALATED" },
      });
    }

    if (patientData.status === "COMPLETED") {
      await prisma.call.create({
        data: {
          patientId: patient.id,
          startedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
          completedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
          transcript: [
            { role: "agent", content: "Hello! This is an automated follow-up call from AfterCall. How are you feeling since your knee replacement?" },
            { role: "patient", content: "Much better, thank you! The pain is manageable." },
            { role: "agent", content: "That's great to hear. On a scale of 0 to 10, what would you rate your pain level?" },
            { role: "patient", content: "About a 3 or 4. Much better than before." },
            { role: "agent", content: "Are you taking your medications as prescribed?" },
            { role: "patient", content: "Yes, every day without fail." },
          ],
          painScore: 3,
          medAdherence: true,
          flagStatus: "NONE",
          summary: "Patient recovering well. Pain level 3/10, medications taken as directed, no concerns reported.",
        },
      });
    }
  }

  console.log("✅ Demo patients seeded");
  console.log("\n🎉 Seed complete!");
  console.log("Demo credentials:");
  console.log("  Admin: admin@aftercall.app / Demo@AfterCall2024");
  console.log("  Nurse: nurse@aftercall.app / Demo@AfterCall2024");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
