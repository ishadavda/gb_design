import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * Shape a caller must send. Defined now, even though nothing reads a receipt
 * yet, so the contract is the thing that changes last when a provider lands -
 * apps/web can be written against this today.
 */
const OcrRequestSchema = z.object({
  // Storage key of an already-uploaded receipt. Deliberately not the image
  // bytes: a serverless function is the wrong place to stream an upload
  // through, and it keeps the payload small enough to log safely.
  receiptPath: z.string().min(1),
});

export type OcrRequest = z.infer<typeof OcrRequestSchema>;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }

  const parsed = OcrRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // 501, not a stubbed success. A fake "extracted" total would flow into points
  // math and be indistinguishable from a real one downstream.
  return NextResponse.json(
    {
      error: "OCR is not implemented yet.",
      receiptPath: parsed.data.receiptPath,
    },
    { status: 501 },
  );
}
