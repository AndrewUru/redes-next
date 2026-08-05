import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

const primaryActionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const secondaryActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

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
    ]
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
    ]
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
    ]
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
    recommendation: "WordPress + WooCommerce o ecommerce dedicado"
  }
] as const;

const avoidList = [
  "No compres hosting sin saber si será WordPress, Astro o Next.",
  "No uses emails gratuitos si la web es profesional: mejor hola@tudominio.com.",
  "No instales plugins por impulso en WordPress.",
  "No registres el dominio en una cuenta que no controles.",
  "No elijas una tecnología solo porque está de moda."
] as const;

const operationalBasics = [
  {
    title: "Copias y mantenimiento",
    description:
      "Pide copias de seguridad, acceso al panel, renovación clara y una forma sencilla de restaurar si algo falla."
  },
  {
    title: "Seguridad básica",
    description:
      "SSL activo, contraseñas seguras, roles separados, plugins mínimos y actualizaciones controladas si usas WordPress."
  },
  {
    title: "Propiedad del proyecto",
    description:
      "El cliente debe tener dominio, hosting, repositorio o accesos principales. El desarrollador puede gestionar, pero no bloquear."
  }
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
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <header className="max-w-3xl pb-16 sm:pb-20">
          <p className="text-sm font-semibold text-primary">Guía práctica</p>
          <h1 className="mt-4 text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            Cómo elegir hosting, dominio y tecnología para tu web
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Mi recomendación general es mantener las decisiones simples: dominio
            claro, hosting fiable, correo profesional y una tecnología que
            encaje con lo que realmente necesitas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
              Comparar tecnologías
            </a>
          </div>
        </header>

        <section
          aria-labelledby="hosting-title"
          className="grid gap-8 border-t border-border py-14 sm:py-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16"
        >
          <div>
            <p className="text-sm font-semibold text-muted-foreground">01</p>
            <h2 id="hosting-title" className="mt-3 text-3xl">
              Hosting sin complicaciones
            </h2>
          </div>
          <div>
            <h3 className="text-xl">Mi punto de partida: IONOS</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Lo recomiendo especialmente cuando el cliente quiere dominio,
              hosting, SSL y correo profesional gestionados desde un mismo
              lugar.
            </p>
            <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {hostingReasons.map((reason) => (
                <li
                  key={reason}
                  className="border-t border-border pt-4 text-sm leading-6"
                >
                  {reason}
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-8 border-l-2 border-primary pl-5 sm:grid-cols-2 sm:pl-7">
              <div>
                <h3 className="text-base">Qué contratar normalmente</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Dominio, certificado SSL, correo profesional y un hosting
                  adecuado al tipo de web. Para WordPress, un plan gestionado
                  reduce tareas técnicas.
                </p>
              </div>
              <div>
                <h3 className="text-base">Qué revisar antes de pagar</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Precio de renovación, correos incluidos, copias de seguridad,
                  soporte, límites del plan y compatibilidad con la tecnología
                  elegida.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="comparativa"
          aria-labelledby="technology-title"
          className="scroll-mt-24 border-t border-border py-14 sm:py-16"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-muted-foreground">02</p>
            <h2 id="technology-title" className="mt-3 text-3xl">
              WordPress, Astro o Next.js
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              La mejor opción depende de quién editará la web, cuánta
              interacción necesita y cuánto mantenimiento quieres asumir.
            </p>
          </div>

          <div className="mt-10">
            {technologyOptions.map((option) => (
              <article
                key={option.title}
                className="grid gap-6 border-t border-border py-8 first:border-t-0 first:pt-0 lg:grid-cols-[0.65fr_1.35fr] lg:gap-12"
              >
                <div>
                  <h3 className="text-2xl">{option.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {option.ideal}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Ventajas
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-muted-foreground marker:text-primary">
                      {option.pros.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      A tener en cuenta
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-muted-foreground marker:text-border-strong">
                      {option.cons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="domain-title"
          className="grid gap-14 border-t border-border py-14 sm:py-16 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <p className="text-sm font-semibold text-muted-foreground">03</p>
            <h2 id="domain-title" className="mt-3 text-3xl">
              El dominio es del cliente
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Debe ser fácil de recordar, fácil de escribir y estar siempre bajo
              el control del propietario del negocio.
            </p>
            <ol className="mt-8 space-y-4">
              {domainChecklist.map((item, index) => (
                <li key={item} className="flex gap-4 text-sm leading-6">
                  <span className="shrink-0 text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Regla rápida de decisión
            </p>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {decisionRules.map((rule) => (
                <div key={rule.label} className="py-5">
                  <dt className="text-sm leading-6 text-muted-foreground">
                    {rule.label}
                  </dt>
                  <dd className="mt-1 font-semibold">{rule.recommendation}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          aria-labelledby="avoid-title"
          className="rounded-xl bg-muted px-5 py-8 sm:px-8 sm:py-10"
        >
          <div className="grid gap-7 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <h2 id="avoid-title" className="text-2xl">
              Qué evitar al contratar
            </h2>
            <ul className="space-y-3">
              {avoidList.map((item) => (
                <li key={item} className="text-sm leading-6">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="basics-title"
          className="border-b border-border py-14 sm:py-16"
        >
          <h2 id="basics-title" className="sr-only">
            Aspectos básicos del proyecto
          </h2>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
            {operationalBasics.map((item) => (
              <div key={item.title}>
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-10">
          <h2 className="text-base">Fuentes revisadas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Referencias oficiales sobre requisitos y capacidades de cada opción.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {sourceLinks.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 py-2 text-sm font-semibold underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary"
                >
                  {source.label}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </main>
  );
}
