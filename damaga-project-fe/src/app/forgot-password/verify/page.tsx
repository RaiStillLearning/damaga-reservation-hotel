// src/app/forgot-password/verify/page.tsx
"use client";

import { Suspense } from "react";
import OTPValidation from "./OTPValidationInner";

export default function OTPValidationWrapper() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <OTPValidation />
    </Suspense>
  );
}
