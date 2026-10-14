import { isAdmin } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, uploadToR2 } from "@/lib/r2";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") || "misc").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "misc";

  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return Response.json({ error: "Images only (PNG, JPG, WebP, AVIF, SVG, GIF)" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Max 8 MB per image" }, { status: 400 });

  try {
    const url = await uploadToR2(new Uint8Array(await file.arrayBuffer()), file.type, folder);
    return Response.json({ url });
  } catch (e) {
    console.error("R2 upload failed", e);
    return Response.json({ error: "Upload failed. Check the R2 credentials." }, { status: 500 });
  }
}
