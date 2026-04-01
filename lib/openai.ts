// LLM calls stubbed out — swap in a real AI client when ready

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

const STUB_RESPONSES = [
  "Thank you for sharing that. How would you rate your pain on a scale of 0 to 10?",
  "I understand. Are you taking your medications as prescribed?",
  "Good to hear. Have you experienced any unusual symptoms like fever, swelling, or difficulty breathing?",
  "Thank you for letting me know. Your care team will review this information. Is there anything else you'd like to mention?",
  "Thank you for taking the time to speak with me. Your care team will review this information. Take care!",
];

export async function runSimulatedCall(
  transcript: TranscriptMessage[],
  _procedureType: string,
  _questions: ProcedureQuestion[],
  _redFlagRules: RedFlagRule[],
  _patientMessage: string
): Promise<{ agentResponse: string; isComplete: boolean; analysis: CallAnalysis | null }> {
  const index = Math.min(Math.floor(transcript.length / 2), STUB_RESPONSES.length - 1);
  const agentResponse = STUB_RESPONSES[index];
  const isComplete = index >= STUB_RESPONSES.length - 1 || transcript.length >= 14;

  const analysis: CallAnalysis | null = isComplete
    ? {
        painScore: 3,
        medAdherence: true,
        flagStatus: "NONE",
        flagReason: null,
        summary: "Patient reported manageable pain and good medication adherence. No red flags detected.",
      }
    : null;

  return { agentResponse, isComplete, analysis };
}

export async function getInitialGreeting(_procedureType: string, patientName: string): Promise<string> {
  const firstName = patientName.split(" ")[0];
  return `Hello ${firstName}! This is an automated follow-up call from AfterCall on behalf of your care team. I'm checking in on your recovery. This will take just a few minutes — is now a good time to chat?`;
}
