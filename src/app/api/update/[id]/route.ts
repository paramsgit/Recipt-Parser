import { NextRequest, NextResponse } from "next/server";
import { updateReceiptParse } from "@/lib/db/receipt-store";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const modelResponse = await req.json();

    const updated = await updateReceiptParse({
      id,
      modelResponse,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 },
    );
  }
}

