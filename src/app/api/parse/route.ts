import { NextRequest, NextResponse } from "next/server";
import { parseReceipt } from "@/lib/receipt/receipt-parser.service";
import { storeReceiptParse } from "@/lib/db/receipt-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const data = await parseReceipt(base64Image);

    const entry = await storeReceiptParse({
      id: crypto.randomUUID(),
      filename: file.name || "unknown",
      modelResponse: data,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to parse receipt" },
      { status: 500 },
    );
  }
}
