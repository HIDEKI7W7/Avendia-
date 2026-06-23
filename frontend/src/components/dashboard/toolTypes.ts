import React from "react";

export interface ToolItem {
  id: string;
  title: string;
  category: "Planificación" | "Asistente";
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  path: string;
}
