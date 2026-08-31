import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, readdir, unlink, stat } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Obtiene las fotos subidas y recursos multimedia de un vehículo.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: "Slug inválido o no especificado." }, { status: 400 });
  }

  const uploadDir = process.cwd() + "/public/cars/uploads/" + slug;
  const spinDir = process.cwd() + "/public/cars/spin/" + slug;

  let gallery: Array<{ name: string; url: string; size: number; isCover?: boolean }> = [];
  let spinCount = 0;

  // 1. Fotos en carpeta de uploads
  if (existsSync(uploadDir)) {
    try {
      const files = await readdir(uploadDir);
      for (const file of files) {
        if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
          const filePath = join(uploadDir, file);
          const st = await stat(filePath);
          gallery.push({
            name: file,
            url: `/cars/uploads/${slug}/${file}?v=${st.mtimeMs}`,
            size: st.size,
            isCover: file.startsWith("cover_"),
          });
        }
      }
    } catch {
      /* noop */
    }
  }

  // 2. Fotogramas 360°
  if (existsSync(spinDir)) {
    try {
      const files = (await readdir(spinDir)).filter((f) => /^\d+\.jpg$/i.test(f));
      spinCount = files.length;
    } catch {
      /* noop */
    }
  }

  return NextResponse.json({
    slug,
    gallery,
    spinCount,
  });
}

/**
 * Sube una o múltiples fotos para un vehículo (galería, portada o fotogramas 360°).
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer el formulario." }, { status: 400 });
  }

  const slug = String(form.get("slug") || "").trim();
  const type = String(form.get("type") || "gallery").trim(); // 'gallery' | 'cover' | 'spin'

  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: "Slug de vehículo no válido." }, { status: 400 });
  }

  const files = form.getAll("files") as File[];
  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No se seleccionaron archivos para subir." }, { status: 400 });
  }

  const savedFiles: string[] = [];

  try {
    if (type === "spin") {
      // Subida de fotogramas 360°
      const spinDir = process.cwd() + "/public/cars/spin/" + slug;
      await mkdir(spinDir, { recursive: true });

      // Ordenar por nombre si vienen numerados
      const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      for (let i = 0; i < sorted.length; i++) {
        const file = sorted[i];
        const num = String(i + 1).padStart(3, "0");
        const ext = file.name.split(".").pop() || "jpg";
        const dest = join(spinDir, `${num}.${ext}`);
        
        const bytes = await file.arrayBuffer();
        await writeFile(dest, Buffer.from(bytes));
        savedFiles.push(`/cars/spin/${slug}/${num}.${ext}`);
      }

      // Crear o actualizar manifest.json
      const manifest = {
        slug,
        count: sorted.length,
        updatedAt: new Date().toISOString(),
        manualUpload: true,
      };
      await writeFile(join(spinDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

    } else {
      // Subida de fotos de galería o portada
      const uploadDir = process.cwd() + "/public/cars/uploads/" + slug;
      await mkdir(uploadDir, { recursive: true });

      for (const file of files) {
        if (!(file instanceof File)) continue;
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/gi, "");
        const baseName = file.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "_")
          .slice(0, 30);

        const prefix = type === "cover" ? "cover_" : "";
        const filename = `${prefix}${Date.now()}_${baseName}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(join(uploadDir, filename), buffer);
        savedFiles.push(filename);
      }
    }

    return NextResponse.json({
      success: true,
      count: savedFiles.length,
      saved: savedFiles,
      message: `Se ${savedFiles.length === 1 ? "subió 1 foto" : `subieron ${savedFiles.length} fotos`} con éxito.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al guardar archivos en el servidor." },
      { status: 500 }
    );
  }
}

/**
 * Elimina una foto de la galería del vehículo.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, filename, type = "gallery" } = body;

    if (!slug || !filename || !/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
    const baseDir = body.type === "spin"
      ? process.cwd() + "/public/cars/spin/" + slug
      : process.cwd() + "/public/cars/uploads/" + slug;

    const targetFile = join(baseDir, safeFilename);

    if (existsSync(targetFile)) {
      await unlink(targetFile);
      return NextResponse.json({ success: true, message: "Foto eliminada correctamente." });
    } else {
      return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al eliminar la foto." },
      { status: 500 }
    );
  }
}
