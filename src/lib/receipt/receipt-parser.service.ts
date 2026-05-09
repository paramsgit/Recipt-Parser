import { createAIProvider } from "../ai/factory";
import promptString from "./prompt";

export async function parseReceipt(imageBase64: string) {
  const provider = createAIProvider();

  const raw = await provider.parseReceipt(imageBase64, promptString);

  try {
    return JSON.parse(cleanResponse(raw));
  } catch {
    throw new Error("Invalid AI response");
  }
}

function cleanResponse(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}
