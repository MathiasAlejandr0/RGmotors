import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile, readdir, unlink, stat } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { getVehicleBySlug, getVehicles, saveVehicle } from "@/lib/server/vehiclesStore";

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

  const uploadDir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "uploads", slug);
  const spinDir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "spin", slug);

  let gallery: Array<{ name: string; url: string; size: number; isCover?: boolean }> = [];
  let spinCount = 0;

  const vehicle = await getVehicleBySlug(slug);
  const currentCover = vehicle?.image || "";

  // 1. Fotos en carpeta de uploads
  if (existsSync(uploadDir)) {
    try {
      const files = await readdir(uploadDir);
      for (const file of files) {
        if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
          const filePath = join(uploadDir, file);
          const st = await stat(filePath);
          const rawUrl = `/cars/uploads/${slug}/${file}`;
          gallery.push({
            name: file,
            url: `${rawUrl}?v=${st.mtimeMs}`,
            size: st.size,
            isCover: currentCover.includes(file) || file.startsWith("cover_"),
          });
        }
      }
    } catch {
      /* noop */
    }
  }

  // Ordenar fotos respetando el orden guardado en vehicle.gallery si existe
  if (vehicle && vehicle.gallery && vehicle.gallery.length > 0) {
    const orderMap = new Map<string, number>();
    vehicle.gallery.forEach((url, idx) => {
      const baseName = url.split("?")[0].split("/").pop() || "";
      orderMap.set(baseName, idx);
    });

    gallery.sort((a, b) => {
      const idxA = orderMap.has(a.name) ? orderMap.get(a.name)! : 999;
      const idxB = orderMap.has(b.name) ? orderMap.get(b.name)! : 999;
      return idxA - idxB;
    });
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
    coverImage: currentCover,
    orderedGalleryUrls: vehicle?.gallery || gallery.map(g => `/cars/uploads/${slug}/${g.name}`),
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
      const spinDir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "spin", slug);
      await mkdir(spinDir, { recursive: true });

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

      const manifest = {
        slug,
        count: sorted.length,
        updatedAt: new Date().toISOString(),
        manualUpload: true,
      };
      await writeFile(join(spinDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

      // Actualizar vehículo con spin
      const v = await getVehicleBySlug(slug);
      if (v) {
        await saveVehicle({
          ...v,
          spin: { count: sorted.length, pattern: `/cars/spin/${slug}/{index}.jpg`, ext: "jpg" }
        });
      }

    } else {
      // Subida de fotos de galería o portada
      const uploadDir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "uploads", slug);
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

      // Sincronizar automáticamente con la base de datos de vehículos
      const v = await getVehicleBySlug(slug);
      if (v) {
        const currentGallery = v.gallery ? [...v.gallery] : [];
        const newPaths = savedFiles.map(f => `/cars/uploads/${slug}/${f}`);
        const updatedGallery = [...currentGallery, ...newPaths];

        let updatedImage = v.image;
        if (type === "cover" || !updatedImage || updatedImage.includes("placeholder")) {
          updatedImage = newPaths[0] || `/cars/uploads/${slug}/${savedFiles[0]}`;
        }

        await saveVehicle({
          ...v,
          image: updatedImage,
          gallery: updatedGallery,
          hasRealPhotos: true,
        });
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
 * Modifica el orden de la galería o la foto de portada de un vehículo.
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, action, coverUrl, gallery } = body;

    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      return NextResponse.json({ error: "Slug no válido." }, { status: 400 });
    }

    const v = await getVehicleBySlug(slug);
    if (!v) {
      return NextResponse.json({ error: "Vehículo no encontrado." }, { status: 404 });
    }

    if (action === "set_cover" && coverUrl) {
      // Limpiar query params en la URL guardada
      const cleanUrl = coverUrl.split("?")[0];
      
      // Asegurar que la portada esté al inicio de la galería
      let currentGallery = v.gallery ? [...v.gallery] : [];
      if (!currentGallery.includes(cleanUrl)) {
        currentGallery.unshift(cleanUrl);
      } else {
        currentGallery = [cleanUrl, ...currentGallery.filter(u => u !== cleanUrl)];
      }

      await saveVehicle({
        ...v,
        image: cleanUrl,
        gallery: currentGallery,
        hasRealPhotos: true,
      });

      return NextResponse.json({
        success: true,
        message: "Foto de portada actualizada correctamente.",
        coverImage: cleanUrl,
      });
    }

    if (action === "reorder" && Array.isArray(gallery)) {
      const cleanGallery = gallery.map((u: string) => u.split("?")[0]);
      const newCover = cleanGallery.length > 0 ? cleanGallery[0] : v.image;

      await saveVehicle({
        ...v,
        image: newCover,
        gallery: cleanGallery,
        hasRealPhotos: cleanGallery.length > 0,
      });

      return NextResponse.json({
        success: true,
        message: "Orden de la galería actualizado correctamente.",
        gallery: cleanGallery,
      });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al actualizar multimedia." },
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
    const isSpin = type === "spin";
    const targetDir = isSpin 
      ? join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "spin", slug)
      : join(/*turbopackIgnore: true*/ process.cwd(), "public", "cars", "uploads", slug);

    const targetFile = join(targetDir, safeFilename);

    if (existsSync(targetFile)) {
      await unlink(targetFile);
    }

    // Actualizar vehículo en base de datos
    const v = await getVehicleBySlug(slug);
    if (v && !isSpin) {
      const currentGallery = v.gallery || [];
      const updatedGallery = currentGallery.filter(u => !u.includes(safeFilename));

      let updatedImage = v.image;
      if (updatedImage.includes(safeFilename)) {
        updatedImage = updatedGallery.length > 0 
          ? updatedGallery[0] 
          : "/images/placeholder-pending-car.svg";
      }

      await saveVehicle({
        ...v,
        image: updatedImage,
        gallery: updatedGallery,
        hasRealPhotos: updatedGallery.length > 0,
      });
    }

    return NextResponse.json({ success: true, message: "Foto eliminada correctamente." });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al eliminar la foto." },
      { status: 500 }
    );
  }
}
