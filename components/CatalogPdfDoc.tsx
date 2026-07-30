/**
 * Documento PDF del catálogo de RG Motors con la misma identidad visual de la
 * web (oscuro premium, azul de marca, logo y fichas de autos).
 *
 * Se carga de forma DINÁMICA desde el botón de descarga, para que
 * @react-pdf/renderer no engorde el bundle principal del sitio.
 */
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { estimateMonthly, formatCLP, type Vehicle } from "@/lib/vehicles";

const C = {
  bg: "#090909",
  panel: "#111315",
  card: "#181A1F",
  border: "#323842",
  brand: "#006CFF",
  brandLight: "#2D8CFF",
  brandGlow: "#49A7FF",
  white: "#F8F9FB",
  muted: "#8A9099",
  soft: "#B8BDC7",
  green: "#22C55E",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.white,
    paddingTop: 28,
    paddingBottom: 44,
    paddingHorizontal: 26,
    fontSize: 9,
  },

  // Portada
  cover: { backgroundColor: C.bg, color: C.white, padding: 0 },
  coverBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: C.brand,
  },
  coverInner: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
  },
  logo: { width: 190, marginBottom: 26 },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 8,
    color: C.white,
  },
  coverSub: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    marginBottom: 22,
    maxWidth: 380,
    lineHeight: 1.45,
  },
  coverMetaRow: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap", justifyContent: "center" },
  coverChip: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 11,
    fontSize: 9,
    color: C.soft,
  },
  coverFoot: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    textAlign: "center",
    color: C.muted,
    fontSize: 9,
  },

  // Cabecera de páginas de contenido
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLogo: { width: 96 },
  headerRight: { fontSize: 8, color: C.muted },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48.5%",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  imgWrap: { position: "relative", width: "100%", height: 108, backgroundColor: C.panel },
  img: { width: "100%", height: 108, objectFit: "cover" },
  badge360: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    color: C.white,
    fontSize: 7,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  badgeFeat: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: C.brand,
    color: C.white,
    fontSize: 7,
    fontWeight: 700,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  cardBody: { padding: 10 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  name: { fontSize: 11, fontWeight: 700, color: C.white, maxWidth: "80%" },
  year: { fontSize: 8, color: C.muted },
  version: { fontSize: 8, color: C.muted, marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  chip: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 7,
    color: C.soft,
  },
  price: { fontSize: 13, fontWeight: 700, color: C.brandGlow, marginBottom: 1 },
  monthly: { fontSize: 7.5, color: C.muted, marginBottom: 7 },
  tag: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 2 },
  tagDot: { color: C.green, fontSize: 8 },
  tagText: { color: C.soft, fontSize: 7.5 },
  cta: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    paddingVertical: 5,
    textAlign: "center",
    fontSize: 8,
    color: C.soft,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    left: 26,
    right: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
    fontSize: 8,
    color: C.muted,
  },
});

type Meta = {
  generatedAt: string;
  count: number;
  filterSummary: string;
  origin?: string;
};

function Card({ v, origin }: { v: Vehicle; origin?: string }) {
  const src = origin ? `${origin}${v.image}` : v.image;
  const monthly = estimateMonthly(v.price);
  return (
    <View style={s.card} wrap={false}>
      <View style={s.imgWrap}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={s.img} src={src} />
        <Text style={s.badge360}>360° disponible</Text>
        {v.featured ? <Text style={s.badgeFeat}>Destacado</Text> : null}
      </View>
      <View style={s.cardBody}>
        <View style={s.titleRow}>
          <Text style={s.name}>
            {v.brand} {v.model}
          </Text>
          <Text style={s.year}>{v.year}</Text>
        </View>
        <Text style={s.version}>
          {v.version} · {v.location}
        </Text>
        <View style={s.chips}>
          <Text style={s.chip}>{v.km.toLocaleString("es-CL")} km</Text>
          <Text style={s.chip}>{v.fuel}</Text>
          <Text style={s.chip}>{v.transmission}</Text>
          <Text style={s.chip}>{v.bodyType}</Text>
        </View>
        <Text style={s.price}>{formatCLP(v.price)}</Text>
        <Text style={s.monthly}>o {formatCLP(monthly)}/mes</Text>
        {v.highlights.slice(0, 2).map((h) => (
          <View key={h} style={s.tag}>
            <Text style={s.tagDot}>✓</Text>
            <Text style={s.tagText}>{h}</Text>
          </View>
        ))}
        <Text style={s.cta}>Ver detalle en rgmotors.cl</Text>
      </View>
    </View>
  );
}

export function CatalogPdfDoc({
  vehicles,
  meta,
}: {
  vehicles: Vehicle[];
  meta: Meta;
}) {
  const logo = meta.origin ? `${meta.origin}/logo.png` : "/logo.png";
  return (
    <Document title="Catálogo RG Motors" author="RG Motors">
      <Page size="A4" style={s.cover}>
        <View style={s.coverBar} />
        <View style={s.coverInner}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.logo} src={logo} />
          <Text style={s.coverTitle}>Catálogo de vehículos</Text>
          <Text style={s.coverSub}>
            Autos usados certificados con inspección de 150 puntos, garantía y
            financiamiento en línea. Misma selección y estética del sitio web
            de RG Motors.
          </Text>
          <View style={s.coverMetaRow}>
            <Text style={s.coverChip}>{meta.count} vehículos</Text>
            <Text style={s.coverChip}>{meta.filterSummary}</Text>
            <Text style={s.coverChip}>{meta.generatedAt}</Text>
          </View>
        </View>
        <Text style={s.coverFoot}>RG Motors · Santiago, Chile · www.rgmotors.cl</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.headerLogo} src={logo} />
          <Text style={s.headerRight}>Catálogo · {meta.generatedAt}</Text>
        </View>

        <View style={s.grid}>
          {vehicles.map((v) => (
            <Card key={v.slug} v={v} origin={meta.origin} />
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text>RG Motors — autos usados certificados</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/** Genera el PDF y devuelve un Blob descargable. */
export async function generateCatalogPdf(
  vehicles: Vehicle[],
  meta: Meta
): Promise<Blob> {
  return pdf(<CatalogPdfDoc vehicles={vehicles} meta={meta} />).toBlob();
}
