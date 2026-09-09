/**
 * Google Apps Script — pegar en Extensiones → Apps Script de la planilla RG Motors.
 *
 * SOLO LECTURA desde el sitio: este script AVISA a la web cuando cambia la hoja.
 * No recibe ni aplica cambios desde el sitio hacia el Excel.
 *
 * 1. Reemplazá WEBHOOK_URL y WEBHOOK_SECRET.
 * 2. Implementar → Implementar como aplicación web (opcional) O solo guardar + trigger.
 * 3. Activadores → Añadir activador → Al modificar (On change) → función onSheetChange.
 *
 * Secret = el mismo CRON_SECRET o INVENTORY_SYNC_SECRET de Vercel.
 */

var WEBHOOK_URL = "https://www.rgmotorschile.cl/api/webhooks/inventory-sync";
var WEBHOOK_SECRET = "PEGAR_AQUI_EL_MISMO_CRON_SECRET_DE_VERCEL";

/** Evita spamear el webhook si editás muchas celdas seguidas (ms). */
var DEBOUNCE_MS = 15000;
var CACHE_KEY = "rgmotors_last_inventory_sync_ms";

function onSheetChange(e) {
  notifyInventorySync_("onChange");
}

function onEdit(e) {
  notifyInventorySync_("onEdit");
}

/** Podés programar también un timer cada 10–15 min como respaldo. */
function scheduledInventoryPing() {
  notifyInventorySync_("timer");
}

function notifyInventorySync_(source) {
  var cache = CacheService.getScriptCache();
  var last = Number(cache.get(CACHE_KEY) || "0");
  var now = Date.now();
  if (now - last < DEBOUNCE_MS) {
    return;
  }
  cache.put(CACHE_KEY, String(now), 300);

  var payload = {
    source: "google-apps-script:" + source,
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + WEBHOOK_SECRET,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    console.error("Inventory sync falló: " + code + " " + response.getContentText());
  }
}
