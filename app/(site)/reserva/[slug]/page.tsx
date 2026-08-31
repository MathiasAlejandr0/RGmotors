import { redirect } from "next/navigation";
import { getVehicle, vehicles } from "@/lib/vehicles";

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export default async function ReservaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) {
    redirect("/catalogo");
  }
  redirect(`/vehiculo/${v.slug}`);
}
