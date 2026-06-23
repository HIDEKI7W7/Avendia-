"use client";

import React from "react";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  const handleOnboardingFinish = (data: any) => {
    // Aquí se puede guardar la información recolectada del onboarding en el backend
    // en una base de datos o en localStorage. Para la simulación, el OnboardingWizard
    // redirige automáticamente a /dashboard.
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_completed", "true");
      localStorage.setItem("onboarding_data", JSON.stringify(data));
      
      // Simular que el docente recibe sus 7 créditos iniciales
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.credits = 7;
          user.credits_total = 7;
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.error("Error al actualizar créditos del usuario:", e);
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFBFC]">
      <OnboardingWizard onFinish={handleOnboardingFinish} />
    </main>
  );
}
