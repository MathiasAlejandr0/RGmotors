import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicle, vehicles } from "@/lib/vehicles";
import TestDriveForm from "@/components/TestDriveForm";

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export default async function PruebaManejoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-white/40">
        <Link href={`/vehiculo/${v.slug}`} className="hover:text-white">
          ← Volver al vehículo
        </Link>
      </nav>
      <h1 className="mb-6 text-3xl font-bold">Agenda tu prueba de manejo</h1>
      <TestDriveForm vehicle={v} />
    </main>
  );
}
