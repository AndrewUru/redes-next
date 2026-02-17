import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:px-6 sm:py-10">
      <section className="w-full space-y-4">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Brand system access
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
