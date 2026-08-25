"use client";

import { useEffect } from "react";
import { captureTrafficSource } from "@/lib/trafficTracking";

export default function TrafficTracker() {
  useEffect(() => {
    captureTrafficSource();
  }, []);

  return null;
}
