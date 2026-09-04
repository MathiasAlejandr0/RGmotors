import { COMPANY } from "@/lib/company";
import { readJson, writeJson } from "@/lib/server/db";

export type NotificationEvent = {
  id: string;
  type: string;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  channel: "log" | "email-pending";
};

const FILENAME = "notifications.json";

/**
 * Registra notificación interna para el equipo comercial.
 * En producción se puede conectar Resend/SMTP; hoy persiste + log.
 */
export async function notifyTeam(event: {
  type: string;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
}): Promise<NotificationEvent> {
  const entry: NotificationEvent = {
    id: `ntf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    type: event.type,
    title: event.title,
    body: event.body,
    meta: event.meta,
    createdAt: new Date().toISOString(),
    channel: "email-pending",
  };

  console.info("[RG NOTIFY]", {
    to: COMPANY.email,
    type: entry.type,
    title: entry.title,
    body: entry.body,
    meta: entry.meta,
  });

  const list = await readJson<NotificationEvent[]>(FILENAME, []);
  list.unshift(entry);
  await writeJson(FILENAME, list.slice(0, 500));
  return entry;
}
