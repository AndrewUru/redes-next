import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  Globe2,
  MonitorSmartphone,
  Server,
  ShieldCheck,
  ShoppingCart,
  Wrench
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const primaryActionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const secondaryActionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-center text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export const metadata: Metadata = {
  title: "Recomendaciones web | ElSaltoWeb",
  description:
    "Guía práctica para elegir hosting, dominio y tecnología web: IONOS, WordPress, Astro y Next.js."
};

const hostingReasons = [
  "Dominio, SSL y correo profesional pueden gestionarse en el mismo proveedor.",
  "WordPress gestionado reduce mantenimiento técnico para clientes no técnicos.",
  "Soporte y panel centralizado facilitan resolver DNS, correo y renovaciones.",
  "Es una opción cómoda cuando el proyecto necesita web, dominio y email sin montar demasiadas piezas."
] as const;

const domainChecklist = [
  "El dominio debe estar a nombre del cliente, no del desarrollador.",
  "Prioriza .com si trabajas de forma global y .es si tu mercado principal es España.",
  "Evita guiones, números raros, palabras difíciles de dictar y nombres demasiado largos.",
  "Activa renovación automática y guarda acceso al registrador.",
  "Configura SSL, DNS y correo con calma antes de publicar la web.",
  "Compra variaciones solo si tienen sentido: marca principal, .com/.es o protección básica."
] as const;

const technologyOptions = [
  {
    title: "WordPress",
    ideal: "Negocios que quieren editar contenido sin depender de desarrollo.",
    pros: [
      "Panel conocido y fácil de delegar.",
      "Muy útil para blogs, páginas corporativas y pequeñas tiendas.",
      "Gran ecosistema de temas, plugins y WooCommerce."
    ],
    cons: [
      "Necesita actualizaciones y cuidado de plugins.",
      "Puede volverse lento si se instala demasiado.",
      "La seguridad depende mucho del mantenimiento."
    ],
    icon: Wrench,
    tone: "bg-amber-200 text-amber-950 dark:border-amber-300/30 dark:bg-amber-300/15 dark:text-amber-100"
  },
  {
    title: "Astro",
    ideal:
      "Webs informativas, rápidas, con mucho contenido estático y poca lógica compleja.",
    pros: [
      "Carga muy rápida porque envía poco JavaScript por defecto.",
      "Muy buena opción para landing pages, portfolios y webs de servicio.",
      "Mantenimiento técnico más simple si no hay panel editable complejo."
    ],
    cons: [
      "Para editar contenido suele hacer falta desarrollo o conectar un CMS.",
      "No es la mejor opción si necesitas mucha lógica de aplicación.",
      "Menos familiar para clientes que esperan un panel tipo WordPress."
    ],
    icon: MonitorSmartphone,
    tone: "bg-teal-200 text-teal-950 dark:border-teal-300/30 dark:bg-teal-300/15 dark:text-teal-100"
  },
  {
    title: "Next.js",
    ideal:
      "Proyectos con dashboard, área privada, formularios avanzados o integraciones.",
    pros: [
      "Sirve para webs y aplicaciones completas.",
      "Permite contenido estático, renderizado en servidor y zonas privadas.",
      "Muy buena base para escalar producto digital."
    ],
    cons: [
      "Requiere hosting y mantenimiento más técnico.",
      "No es necesario para una web muy sencilla.",
      "Conviene planificar bien datos, despliegue y costes."
    ],
    icon: Code2,
    tone: "bg-violet-200 text-violet-950 dark:border-violet-300/30 dark:bg-violet-300/15 dark:text-violet-100"
  }
] as const;

const decisionRules = [
  {
    label: "Quiero editar páginas yo mismo",
    recommendation: "WordPress gestionado"
  },
  {
    label: "Quiero una web rápida, limpia y con pocas actualizaciones",
    recommendation: "Astro"
  },
  {
    label: "Necesito login, dashboard, formularios avanzados o datos",
    recommendation: "Next.js"
  },
  {
    label: "Necesito vender online con catálogo sencillo",
    recommendation: "WordPress + WooCommerce o solución ecommerce dedicada"
  }
] as const;

const avoidList = [
  "No compres hosting sin saber si será WordPress, Astro o Next.",
  "No uses emails gratuitos si la web es profesional: mejor hola@tudominio.com.",
  "No instales plugins por impulso en WordPress.",
  "No registres el dominio en una cuenta que no controles.",
  "No elijas una tecnología solo porque está de moda."
] as const;

const sourceLinks = [
  {
    label: "IONOS: hosting WordPress gestionado",
    href: "https://www.ionos.es/alojamiento/hosting-wordpress-gestionado"
  },
  {
    label: "IONOS: dominios, DNS y SSL",
    href: "https://www.ionos.com.es/dominios/dominios"
  },
  {
    label: "WordPress: requisitos recomendados",
    href: "https://wordpress.org/about/requirements/"
  },
  {
    label: "Astro: Islands Architecture",
    href: "https://v4.docs.astro.build/en/concepts/islands/"
  },
  {
    label: "Next.js: Static Generation",
    href: "https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation"
  }
] as const;

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <Badge className="w-fit bg-surface/90">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Recomendaciones para clientes
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
                Cómo elegir hosting, dominio y tecnología para tu web
              </h1>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                Mi recomendación general es mantener las decisiones simples:
                dominio claro, hosting fiable, correo profesional y una
                tecnología que encaje con lo que realmente necesitas.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/webs"
                className={`${primaryActionClass} w-full sm:w-auto`}
              >
                Solicitar web
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#comparativa"
                className={`${secondaryActionClass} w-full sm:w-auto`}
              >
                Ver comparativa
              </a>
            </div>
          </div>

          <div className="neo-box bg-surface/90">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-foreground p-4 text-background">
                <p className="text-xs font-bold uppercase text-white/60">
                  Mi punto de partida
                </p>
                <h2 className="mt-1 text-3xl text-white">IONOS</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                  Lo recomiendo especialmente cuando el cliente quiere una
                  solución sencilla para dominio, hosting, SSL y correo
                  profesional en un mismo lugar.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {hostingReasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-lg border border-border bg-background p-3 text-sm font-semibold"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 bg-surface/90">
            <Server className="h-7 w-7" aria-hidden />
            <CardTitle>Qué contratar normalmente</CardTitle>
            <CardDescription>
              Para la mayoría de negocios pequeños, empezaría por dominio,
              certificado SSL, correo profesional y hosting adecuado al tipo de
              web. Si la web será WordPress, el hosting WordPress gestionado
              tiene sentido porque reduce tareas técnicas.
            </CardDescription>
          </Card>

          <Card className="space-y-4 bg-surface/90">
            <AlertTriangle className="h-7 w-7" aria-hidden />
            <CardTitle>Qué revisar antes de pagar</CardTitle>
            <CardDescription>
              Comprueba precio de renovación, número de correos incluidos,
              copias de seguridad, soporte, límites del plan y si el hosting
              encaja con WordPress o con una web hecha a código.
            </CardDescription>
          </Card>
        </section>

        <section id="comparativa" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="text-3xl sm:text-4xl">WordPress, Astro o Next.js</h2>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              No hay una opción universal. La mejor tecnología depende de quién
              editará la web, cuánta interacción necesita y cuánto mantenimiento
              quieres asumir.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {technologyOptions.map((option) => {
              const Icon = option.icon;

              return (
                <Card key={option.title} className="space-y-4 bg-surface/90">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg border border-border ${option.tone}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {option.ideal}
                    </CardDescription>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      Ventajas
                    </p>
                    <ul className="mt-2 space-y-2 text-sm font-medium">
                      {option.pros.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      Desventajas
                    </p>
                    <ul className="mt-2 space-y-2 text-sm font-medium text-muted-foreground">
                      {option.cons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl">Elección de dominio</h2>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              El dominio es un activo de marca. Debe ser fácil de recordar,
              fácil de escribir y estar bajo el control del propietario del
              negocio.
            </p>
          </div>
          <Card className="bg-surface/90">
            <div className="grid gap-2 sm:grid-cols-2">
              {domainChecklist.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <p className="text-sm font-bold">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="space-y-4 bg-surface/90">
            <CardTitle>Regla rápida de decisión</CardTitle>
            <div className="grid gap-3">
              {decisionRules.map((rule) => (
                <div
                  key={rule.label}
                  className="grid gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-[1fr_0.8fr]"
                >
                  <p className="text-sm font-bold">{rule.label}</p>
                  <Badge className="w-fit bg-amber-200 text-amber-950 dark:border-amber-300/30 dark:bg-amber-300/15 dark:text-amber-100">
                    {rule.recommendation}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 bg-foreground text-background">
            <ShoppingCart className="h-7 w-7" aria-hidden />
            <CardTitle className="text-white">
              Qué evitar al contratar
            </CardTitle>
            <ul className="space-y-2 text-sm font-medium text-white/75">
              {avoidList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="space-y-3 bg-surface/90">
            <Database className="h-7 w-7" aria-hidden />
            <CardTitle>Copias y mantenimiento</CardTitle>
            <CardDescription>
              Pide copias de seguridad, acceso al panel, renovación clara y una
              forma sencilla de restaurar si algo falla.
            </CardDescription>
          </Card>
          <Card className="space-y-3 bg-surface/90">
            <ShieldCheck className="h-7 w-7" aria-hidden />
            <CardTitle>Seguridad básica</CardTitle>
            <CardDescription>
              SSL activo, contraseñas seguras, roles separados, plugins mínimos
              y actualizaciones controladas si usas WordPress.
            </CardDescription>
          </Card>
          <Card className="space-y-3 bg-surface/90">
            <Code2 className="h-7 w-7" aria-hidden />
            <CardTitle>Propiedad del proyecto</CardTitle>
            <CardDescription>
              El cliente debe tener dominio, hosting, repositorio o accesos
              principales. El desarrollador puede gestionar, pero no bloquear.
            </CardDescription>
          </Card>
        </section>

        <Card className="space-y-4 bg-surface/90">
          <CardTitle>Fuentes revisadas</CardTitle>
          <CardDescription>
            Referencias oficiales usadas para mantener esta recomendación
            alineada con requisitos y capacidades actuales.
          </CardDescription>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceLinks.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold underline"
              >
                {source.label}
              </a>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
