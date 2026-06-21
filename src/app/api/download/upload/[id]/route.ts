import { getRepo } from "@/lib/data";
import { MIME } from "@/lib/render/types";

const MIMES: Record<string, string> = {
  docx: MIME.docx,
  xlsx: MIME.xlsx,
  pptx: MIME.pptx,
  pdf: "application/pdf",
};

// Serves an uploaded client document from its stored bytes.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepo();
  const doc = await repo.getDocument(id);
  const blob = await repo.getBlob(id);
  if (!doc || !blob) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(blob), {
    headers: {
      "Content-Type": MIMES[doc.format] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.filename}"`,
    },
  });
}
