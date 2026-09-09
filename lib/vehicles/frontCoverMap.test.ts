import { describe, expect, it } from "vitest";
import { withFrontCover } from "@/lib/vehicles/frontCoverMap";

describe("withFrontCover", () => {
  it("no inventa ruta local si la galería solo tiene URLs Blob nuevas", () => {
    const blob =
      "https://abc123.public.blob.vercel-storage.com/cars/uploads/ford-raptor-f150-2020-lrjy32/cover_123_foto.webp";
    const v = withFrontCover({
      slug: "ford-raptor-f150-2020-lrjy32",
      image: blob,
      gallery: [blob],
      hasRealPhotos: true,
    });
    expect(v.image).toBe(blob);
    expect(v.gallery).toEqual([blob]);
    expect(v.gallery.some((g) => g.endsWith("photo-02.jpg"))).toBe(false);
  });

  it("reordena usando la URL real de galería cuando existe photo-XX.jpg", () => {
    const cover =
      "https://abc123.public.blob.vercel-storage.com/cars/uploads/ford-raptor-f150-2020-lrjy32/photo-02.jpg";
    const other =
      "https://abc123.public.blob.vercel-storage.com/cars/uploads/ford-raptor-f150-2020-lrjy32/photo-05.jpg";
    const v = withFrontCover({
      slug: "ford-raptor-f150-2020-lrjy32",
      image: other,
      gallery: [other, cover],
      hasRealPhotos: true,
    });
    expect(v.image).toBe(cover);
    expect(v.gallery[0]).toBe(cover);
  });
});
