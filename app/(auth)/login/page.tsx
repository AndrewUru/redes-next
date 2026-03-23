import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border-2 border-border bg-[#fff3b0] px-4 py-1 text-xs font-black uppercase tracking-[0.18em]">
            Bienvenida de nuevo
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-black leading-[0.9] text-foreground sm:text-5xl">
              Vuelve a tu espacio y sigue moviendo la marca hacia delante.
            </h1>
            <p className="max-w-lg text-base font-medium leading-relaxed text-foreground/75">
              Desde aqui puedes retomar tu onboarding, revisar tus recursos y entrar al panel de
              metricas con una vision mas clara de lo que esta funcionando.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-border bg-white/70 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Onboarding
              </p>
              <p className="mt-2 text-sm font-black">Retoma tu estrategia</p>
            </div>
            <div className="rounded-2xl border-2 border-border bg-white/70 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Assets
              </p>
              <p className="mt-2 text-sm font-black">Ordena tu sistema visual</p>
            </div>
            <div className="rounded-2xl border-2 border-border bg-white/70 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Metricas
              </p>
              <p className="mt-2 text-sm font-black">Sigue tu evolucion</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#f7c948]/50 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-[#f08cb6]/45 blur-2xl"
          />
          <div className="relative rounded-[32px] border-2 border-border bg-white/78 p-3 shadow-[10px_10px_0_0_rgba(0,0,0,1)] backdrop-blur-md">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
