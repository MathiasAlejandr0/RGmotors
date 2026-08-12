/**
 * Catálogo PDF de RG Motors:
 *  1) Portada de la empresa
 *  2) Una página por vehículo: fotos + especificaciones
 *  3) Siguiente vehículo en la página siguiente, y así sucesivamente
 *
 * Se carga de forma dinámica desde CatalogPdfButton.
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
import { asset } from "@/lib/asset";
import {
  estimateMonthly,
  formatCLP,
  specsOf,
  type Vehicle,
} from "@/lib/vehicles";

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
  // ---- Portada empresa ----
  cover: { backgroundColor: C.bg, color: C.white, padding: 0 },
  coverTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: C.brand,
  },
  coverBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: C.brand,
  },
  coverInner: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
  },
  coverLogo: { width: 220, marginBottom: 28 },
  coverEyebrow: {
    fontSize: 10,
    color: C.brandGlow,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: C.white,
    marginBottom: 10,
    textAlign: "center",
  },
  coverSub: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    maxWidth: 380,
    lineHeight: 1.5,
    marginBottom: 28,
  },
  coverMetaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  coverChip: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 9,
    color: C.soft,
  },
  coverFoot: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: "center",
    color: C.muted,
    fontSize: 9,
  },
  coverTrust: {
    marginTop: 36,
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
  },
  coverTrustItem: { fontSize: 8, color: C.soft },

  // ---- Página de vehículo ----
  page: {
    backgroundColor: C.bg,
    color: C.white,
    paddingTop: 22,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLogo: { width: 88 },
  headerRight: { fontSize: 8, color: C.muted },

  brandLine: {
    fontSize: 9,
    color: C.brandGlow,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  title: { fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 2 },
  version: { fontSize: 10, color: C.muted, marginBottom: 12 },

  hero: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    objectFit: "cover",
    marginBottom: 14,
    backgroundColor: C.panel,
  },

  body: { flexDirection: "row", gap: 12 },
  left: { flex: 1.15 },
  right: { flex: 0.85 },

  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: C.white,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: C.card,
  },
  specCell: {
    width: "50%",
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  specLabel: { fontSize: 7.5, color: C.muted, marginBottom: 2 },
  specValue: { fontSize: 9, color: C.white, fontWeight: 700 },

  priceBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  priceLabel: { fontSize: 8, color: C.muted, marginBottom: 3 },
  price: { fontSize: 18, fontWeight: 700, color: C.brandGlow, marginBottom: 2 },
  monthly: { fontSize: 9, color: C.soft, marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  badge: {
    backgroundColor: "rgba(0,108,255,0.15)",
    color: C.brandGlow,
    fontSize: 7.5,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  badgeFeat: {
    backgroundColor: C.brand,
    color: C.white,
    fontSize: 7.5,
    fontWeight: 700,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },

  highlights: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 10,
  },
  hlItem: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 5,
    alignItems: "flex-start",
  },
  hlDot: { color: C.green, fontSize: 9 },
  hlText: { color: C.soft, fontSize: 8, flex: 1, lineHeight: 1.35 },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 24,
    right: 24,
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

function abs(origin: string | undefined, path: string) {
  const resolved = asset(path);
  return origin ? `${origin}${resolved}` : resolved;
}

function VehiclePage({
  v,
  meta,
  index,
  total,
  logo,
}: {
  v: Vehicle;
  meta: Meta;
  index: number;
  total: number;
  logo: string;
}) {
  // El 360° no funciona en PDF (es interactivo en la web). Solo foto de catálogo.
  const hero = abs(meta.origin, v.image);
  const specs = specsOf(v);
  const monthly = estimateMonthly(v.price);

  return (
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={s.headerLogo} src={logo} />
        <Text style={s.headerRight}>
          Vehículo {index + 1} de {total} · {meta.generatedAt}
        </Text>
      </View>

      <Text style={s.brandLine}>{v.brand}</Text>
      <Text style={s.title}>
        {v.model} {v.year}
      </Text>
      <Text style={s.version}>
        {v.version} · {v.location}
      </Text>

      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image style={s.hero} src={hero} />

      <View style={s.body}>
        <View style={s.left}>
          <Text style={s.sectionTitle}>Ficha técnica</Text>
          <View style={s.specGrid}>
            {specs.map((sp) => (
              <View key={sp.label} style={s.specCell}>
                <Text style={s.specLabel}>{sp.label}</Text>
                <Text style={s.specValue}>{sp.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.right}>
          <View style={s.priceBox}>
            <Text style={s.priceLabel}>Precio</Text>
            <Text style={s.price}>{formatCLP(v.price)}</Text>
            <Text style={s.monthly}>o {formatCLP(monthly)}/mes (pie 20% · 48 cuotas)</Text>
            <View style={s.badgeRow}>
              {v.featured ? <Text style={s.badgeFeat}>Destacado</Text> : null}
              <Text style={s.badge}>Garantía 6 meses</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>Destacados</Text>
          <View style={s.highlights}>
            {v.highlights.map((h) => (
              <View key={h} style={s.hlItem}>
                <Text style={s.hlDot}>✓</Text>
                <Text style={s.hlText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <Text>RG Motors — autos usados certificados · www.rgmotors.cl</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}

export function CatalogPdfDoc({
  vehicles,
  meta,
}: {
  vehicles: Vehicle[];
  meta: Meta;
}) {
  const logo = abs(meta.origin, "/logo.png");

  return (
    <Document title="Catálogo RG Motors" author="RG Motors">
      {/* 1. Portada de la empresa */}
      <Page size="A4" style={s.cover}>
        <View style={s.coverTopBar} />
        <View style={s.coverInner}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.coverLogo} src={logo} />
          <Text style={s.coverEyebrow}>RG Motors</Text>
          <Text style={s.coverTitle}>Catálogo de vehículos</Text>
          <Text style={s.coverSub}>
            Autos usados certificados con inspección de 150 puntos, historial
            verificado, garantía y financiamiento en línea. Cada página siguiente
            presenta un vehículo con sus fotos y especificaciones.
          </Text>
          <View style={s.coverMetaRow}>
            <Text style={s.coverChip}>{meta.count} vehículos</Text>
            <Text style={s.coverChip}>{meta.filterSummary}</Text>
            <Text style={s.coverChip}>{meta.generatedAt}</Text>
          </View>
          <View style={s.coverTrust}>
            <Text style={s.coverTrustItem}>✓ Inspección 150 puntos</Text>
            <Text style={s.coverTrustItem}>✓ Garantía 6 meses</Text>
            <Text style={s.coverTrustItem}>✓ Crédito en línea</Text>
          </View>
        </View>
        <Text style={s.coverFoot}>
          RG Motors · Santiago, Chile · www.rgmotors.cl
        </Text>
        <View style={s.coverBottomBar} />
      </Page>

      {/* 2. Una página por vehículo */}
      {vehicles.map((v, i) => (
        <VehiclePage
          key={v.slug}
          v={v}
          meta={meta}
          index={i}
          total={vehicles.length}
          logo={logo}
        />
      ))}
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
