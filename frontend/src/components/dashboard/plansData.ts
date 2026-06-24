export interface SubscriptionPlan {
  key: string;
  name: string;
  price: string;
  currency: string;
  frequency: string;
  features: string[];
  buttonText: string;
  isPopular: boolean;
  description: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    key: "basico",
    name: "Plan Básico",
    price: "0",
    currency: "S/",
    frequency: "al mes",
    description: "Para docentes que desean explorar y probar la plataforma sin compromisos.",
    features: [
      "7 créditos mensuales de IA",
      "Acceso a plantillas curriculares estándar del Minedu",
      "Descargas en formato PDF con marca de agua"
    ],
    buttonText: "Tu Plan Actual",
    isPopular: false
  },
  {
    key: "premium",
    name: "Docente Premium",
    price: "29",
    currency: "S/",
    frequency: "al mes",
    description: "La herramienta definitiva para potenciar tu planificación pedagógica con IA.",
    features: [
      "Créditos de IA ilimitados para sesiones y unidades",
      "Exportación directa a Word editable sin marca de agua",
      "Soporte prioritario con EduAsesor RAG"
    ],
    buttonText: "Adquirir Premium",
    isPopular: true
  },
  {
    key: "institucional",
    name: "Plan Institucional",
    price: "Cotizar",
    currency: "",
    frequency: "Consultar",
    description: "Soluciones completas e integradas para colegios y redes educativas.",
    features: [
      "Cuentas integradas para toda la plana docente de la I.E.",
      "Personalización absoluta de formatos escolares por colegio",
      "Paneles de auditoría directiva y reportes de progreso"
    ],
    buttonText: "Contactar Ventas",
    isPopular: false
  }
];
