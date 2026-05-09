export interface ReceiptAIProvider {
  parseReceipt(imageBase64: string, prompt: string): Promise<unknown>;
}
