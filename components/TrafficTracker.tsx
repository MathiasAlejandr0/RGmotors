"use client";

import { useEffect } from "react";
import { captureTrafficSource } from "@/lib/trafficTracking";

const CONSENT_KEY = "rg_cookie_consent_v1";

function maybeCapture() {
  try {
    if (localStorage.getItem(CONSENT_KEY) === "accepted") {
      captureTrafficSource();
    }
  } catch {
    /* ignore */
  }
}

export default function TrafficTracker() {
  useEffect(() => {
    maybeCapture();
    const onConsent = () => maybeCapture();
    window.addEventListener("rg-cookie-consent", onConsent);
    return () => window.removeEventListener("rg-cookie-consent", onConsent);
  }, []);

  return null;
}
