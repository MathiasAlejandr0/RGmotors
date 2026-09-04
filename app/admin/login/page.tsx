import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
          Cargando…
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
