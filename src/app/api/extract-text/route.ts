import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    let text = "";

    if (mimeType === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      text = result.text;
      await parser.destroy();
    } else if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      text = extractPlainText(buffer);
    } else {
      return Response.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return Response.json(
        {
          error:
            "Could not extract text from file. The file may be image-based or empty.",
        },
        { status: 400 }
      );
    }

    const trimmed = text.slice(0, 30000);

    return Response.json({ text: trimmed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

function extractPlainText(buffer: Buffer): string {
  const str = buffer.toString("utf-8");
  const xmlMatches = str.match(/<[^>]*>[^<]+<\/[^>]*>/g);
  if (xmlMatches) {
    return xmlMatches
      .map((m) => m.replace(/<[^>]*>/g, ""))
      .filter((t) => t.trim().length > 0)
      .join(" ");
  }
  const readable = str.replace(/[^\x20-\x7E\n\r\t]/g, " ");
  return readable
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .join(" ");
}
