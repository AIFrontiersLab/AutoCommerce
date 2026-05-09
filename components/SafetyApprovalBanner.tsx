"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export function SafetyApprovalBanner() {
  return (
    <Alert className="border-amber-200 bg-amber-50/90 text-amber-950 backdrop-blur-md">
      <ShieldAlert className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Human approval required before checkout</AlertTitle>
      <AlertDescription className="text-amber-900/85">
        This demo never completes a purchase. Autonomous checkout stays disabled until you explicitly
        confirm payment, shipping, and seller details in the real retailer flow.
      </AlertDescription>
    </Alert>
  );
}
