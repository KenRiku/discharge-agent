import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptMessage {
  role: "agent" | "patient";
  content: string;
}

export interface ProcedureQuestion {
  id: string;
  text: string;
  type: string;
}

export interface RedFlagRule {
  trigger: string;
  severity: "YELLOW" | "RED";
  reason: string;
}

export interface CallAnalysis {
  painScore: number | null;
  medAdherence: boolean | null;
  flagStatus: "NONE" | "YELLOW" | "RED";
  flagReason: string | null;
  summary: string;
}

export async function runSimulatedCall(
  transcript: TranscriptMessage[],
  procedureType: string,
  questions: ProcedureQuestion[],
  redFlagRules: RedFlagRule[],
  patientMessage: string
): Promise<{ agentResponse: string; isComplete: boolean; analysis: CallAnalysis | null }> {
  const systemPrompt = `You are AfterCall, an AI post-discharge clinical check-in agent for a hospital. You are conducting a structured follow-up call with a patient who had a ${procedureType}. Your role is to:

1. Ask procedure-specific clinical questions in a warm, professional, and empathetic manner
2. Collect structured data: pain scores (0-10), medication adherence, and symptom information
3. Detect red flag symptoms that require immediate human follow-up
4. Keep the conversation focused and efficient (aim to complete in 5-8 exchanges)

Questions to cover (in order, but adapt conversationally):
${questions.map((q, i) => `${i + 1}. ${q.text} [type: ${q.type}]`).join("\n")}

Red flag rules:
${redFlagRules.map((r) => `- If ${r.trigger}: Severity ${r.severity} — ${r.reason}`).join("\n")}

IMPORTANT RULES:
- Be warm, empathetic, and professional — not robotic
- If pain score is ≥8 or critical symptoms are reported, express concern and tell the patient a nurse will call them back soon
- Complete the call naturally after covering all key questions
- When the conversation is complete, end with something like "Thank you for taking the time to speak with me. Your care team will review this information. Take care!"
- Do NOT diagnose or provide medical advice — only triage and escalate

Response format: Just respond as the agent would in the call. Do not add meta-commentary.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...transcript.map((m) => ({
      role: m.role === "agent" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
    { role: "user", content: patientMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  const agentResponse = response.choices[0]?.message?.content || "Thank you for your response.";

  // Check if call is complete
  const isComplete =
    agentResponse.toLowerCase().includes("take care") ||
    agentResponse.toLowerCase().includes("care team will review") ||
    agentResponse.toLowerCase().includes("thank you for your time") ||
    transcript.length >= 14;

  let analysis: CallAnalysis | null = null;

  if (isComplete) {
    analysis = await analyzeCallTranscript(
      [...transcript, { role: "patient", content: patientMessage }, { role: "agent", content: agentResponse }],
      procedureType,
      redFlagRules
    );
  }

  return { agentResponse, isComplete, analysis };
}

async function analyzeCallTranscript(
  transcript: TranscriptMessage[],
  procedureType: string,
  redFlagRules: RedFlagRule[]
): Promise<CallAnalysis> {
  const fullTranscript = transcript.map((m) => `${m.role === "agent" ? "Agent" : "Patient"}: ${m.content}`).join("\n");

  const analysisPrompt = `Analyze this post-discharge follow-up call transcript for a ${procedureType} patient and extract structured data.

TRANSCRIPT:
${fullTranscript}

Extract:
1. Pain score (0-10, or null if not mentioned)
2. Medication adherence (true if taking as prescribed, false if not, null if unclear)
3. Flag status based on these rules:
${redFlagRules.map((r) => `- ${r.trigger}: ${r.severity} — ${r.reason}`).join("\n")}
4. Flag reason (if any flags triggered)
5. A brief clinical summary (2-3 sentences)

Respond in this EXACT JSON format:
{
  "painScore": <number or null>,
  "medAdherence": <true/false/null>,
  "flagStatus": "<NONE|YELLOW|RED>",
  "flagReason": "<string or null>",
  "summary": "<string>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      painScore: result.painScore ?? null,
      medAdherence: result.medAdherence ?? null,
      flagStatus: result.flagStatus || "NONE",
      flagReason: result.flagReason || null,
      summary: result.summary || "Call completed.",
    };
  } catch {
    return {
      painScore: null,
      medAdherence: null,
      flagStatus: "NONE",
      flagReason: null,
      summary: "Call completed. Manual review may be needed.",
    };
  }
}

export async function getInitialGreeting(procedureType: string, patientName: string): Promise<string> {
  const firstName = patientName.split(" ")[0];
  return `Hello ${firstName}! This is an automated follow-up call from AfterCall on behalf of your care team at the hospital. I'm checking in on your recovery after your ${procedureType}. This will take just a few minutes — is now a good time to chat?`;
}
