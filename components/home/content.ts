import { FolderOpen, LineChart, Target } from "lucide-react";

export const metrics = [
  { label: "Plan activo", value: "74%" },
  { label: "Ideas listas", value: "28" },
  { label: "Materiales", value: "16" }
] as const;

export const modules = [
  {
    title: "Estrategia",
    description: "Mensaje, pilares y posicionamiento en una sola vista.",
    icon: Target
  },
  {
    title: "Materiales",
    description: "Archivos, referencias y notas organizadas por proyecto.",
    icon: FolderOpen
  },
  {
    title: "Seguimiento",
    description: "Próximos pasos, avances y decisiones siempre visibles.",
    icon: LineChart
  }
] as const;

export const timeline = [
  "Diagnóstico inicial",
  "Dirección estratégica",
  "Materiales y briefing",
  "Plan de contenido",
  "Medición y ajustes"
] as const;

export const recentActivity = [
  "Brief actualizado",
  "Material visual recibido",
  "Próximo bloque definido"
] as const;
