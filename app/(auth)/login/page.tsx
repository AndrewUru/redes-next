import { CheckCircle2, FileText, FolderOpen, LineChart } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

const accessHighlights = [
  {
    title: "Briefing",
    description: "Completa la información clave del proyecto.",
    icon: FileText
  },
  {
    title: "Materiales",
    description: "Comparte archivos y referencias en un solo lugar.",
    icon: FolderOpen
  },
  {
    title: "Avance",
    description: "Consulta métricas, guías y próximos pasos.",
    icon: LineChart
  }
] as const;

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-11rem)] w-full max-w-6xl items-center py-8 sm:py-12">
      <section className="grid w-full gap-10 lg:grid-cols-[0.9fr_0.72fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Espacio privado para clientes
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                Accede a tu espacio de trabajo.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Entra para completar tu onboarding, subir materiales y revisar
                el estado del proyecto desde un panel claro.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {accessHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <Icon
                    className="mb-4 h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <LoginForm />
      </section>
    </div>
  );
}
