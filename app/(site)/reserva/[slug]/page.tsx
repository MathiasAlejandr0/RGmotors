import { redirect } from "next/navigation";
import { getVehicleBySlug } from "@/lib/server/vehiclesStore";
import { getVehicle } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export default async function ReservaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = (await getVehicleBySlug(slug)) || getVehicle(slug);
  if (!v) {
    redirect("/catalogo");
  }
  redirect(`/vehiculo/${v.slug}`);
}
