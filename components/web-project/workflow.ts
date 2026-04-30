import {
  CheckCircle2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MonitorSmartphone,
  Palette,
  Route,
  Send
} from "lucide-react";

export const webProjectLinks = [
  {
    href: "/client/web",
    label: "Resumen web",
    helper: "Estado del proyecto",
    icon: LayoutDashboard
  },
  {
    href: "/client/web/brief",
    label: "Brief web",
    helper: "Objetivos y estructura",
    icon: FileText
  },
  {
    href: "/client/web/materiales",
    label: "Materiales web",
    helper: "Logo, fotos e ideas",
    icon: FolderOpen
  },
  {
    href: "/client/web/avances",
    label: "Avances",
    helper: "Progreso y entregas",
    icon: MonitorSmartphone
  }
] as const;

export const webProjectSteps = [
  {
    title: "Brief y objetivos",
    description:
      "Definimos que debe conseguir la web, para quien es y que accion principal buscamos.",
    icon: FileText
  },
  {
    title: "Mapa de la web",
    description:
      "Ordenamos paginas, secciones, mensajes clave y recorrido del usuario.",
    icon: Route
  },
  {
    title: "Direccion visual",
    description:
      "Aplicamos marca, referencias, fotos y estilo para que la web se sienta coherente.",
    icon: Palette
  },
  {
    title: "Construccion",
    description:
      "Diseno responsive, desarrollo, revision y preparacion para publicar.",
    icon: MonitorSmartphone
  }
] as const;

export const webProjectDeliverables = [
  "Objetivo principal de la web",
  "Mapa de paginas y secciones",
  "Textos base y llamadas a la accion",
  "Material visual organizado",
  "Prototipo responsive",
  "Revision, ajustes y publicacion"
] as const;

export const webProjectMilestones = [
  {
    title: "Entrada del proyecto",
    status: "Por completar",
    detail: "Brief web, materiales y objetivos."
  },
  {
    title: "Direccion y estructura",
    status: "Pendiente",
    detail: "Mapa, secciones y mensajes clave."
  },
  {
    title: "Diseno y construccion",
    status: "Pendiente",
    detail: "Interfaz responsive y desarrollo."
  },
  {
    title: "Revision y entrega",
    status: "Pendiente",
    detail: "Ajustes finales y publicacion."
  }
] as const;

export const webBriefQuestions = [
  "Que debe conseguir la web: reservas, ventas, contactos, portfolio o autoridad?",
  "Que servicios, productos o secciones deben aparecer si o si?",
  "Que accion quieres que haga una persona al terminar de verla?",
  "Tienes referencias de webs que te gusten o que quieras evitar?",
  "Que materiales tienes ya: logo, fotos, textos, testimonios, casos?"
] as const;

export const webProgressSignals = [
  {
    label: "Brief",
    value: "Base del proyecto",
    icon: CheckCircle2
  },
  {
    label: "Materiales",
    value: "Fotos, logo e ideas",
    icon: FolderOpen
  },
  {
    label: "Entrega",
    value: "Web responsive",
    icon: Send
  }
] as const;
