"use client";

/**
 * Auth is handled by middleware + /admin/login.
 * Kept as a passthrough so existing imports continue to work.
 */
export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
