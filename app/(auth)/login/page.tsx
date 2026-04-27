import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border-2 border-border bg-[#fff3b0] px-4 py-1 text-xs font-black uppercase">
            Espacio privado para colaboradores
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-black leading-[0.9] text-foreground sm:text-5xl">
              Accede a tu espacio de trabajo
            </h1>
            <p className="max-w-lg text-base font-medium leading-relaxed text-foreground/75">
              Desde aquí podrás completar tu información, compartir materiales,
              revisar avances y seguir el proceso de trabajo en un solo lugar.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[8px] border-2 border-border bg-white/70 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Información
              </p>
              <p className="mt-2 text-sm font-black">Completa tu proceso</p>
            </div>
            <div className="rounded-[8px] border-2 border-border bg-white/70 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Materiales
              </p>
              <p className="mt-2 text-sm font-black">Comparte lo necesario</p>
            </div>
            <div className="rounded-[8px] border-2 border-border bg-white/70 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Seguimiento
              </p>
              <p className="mt-2 text-sm font-black">Revisa avances</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
