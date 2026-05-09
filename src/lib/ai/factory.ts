import { GeminiProvider } from "./gemini.provider";

export function createAIProvider() {
  const provider = process.env.AI_PROVIDER || "gemini";

  switch (provider) {
    case "gemini":
      return new GeminiProvider();

    default:
      throw new Error("Unsupported AI provider");
  }
}
