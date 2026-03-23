import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.24),transparent_28%),linear-gradient(180deg,#fffdf8_0%,#fde7f3_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex min-h-screen w-full max-w-md items-center">
        <div className="w-full space-y-5">
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bienvenida de nuevo
            </p>
            <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
              Entra y sigue construyendo tu marca con claridad.
            </h1>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              Accede a tu onboarding, tus recursos y el panel donde revisas la evolucion de tu
              contenido.
            </p>
          </div>
          <div className="rounded-[28px] border-2 border-border bg-white/55 p-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
