import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReceiptAIProvider } from "./types";

export class GeminiProvider implements ReceiptAIProvider {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    this.model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
    });
  }

  async parseReceipt(imageBase64: string, prompt: string) {
    const result = await this.model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    return result.response.text();
  }
}
