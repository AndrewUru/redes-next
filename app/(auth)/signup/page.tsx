import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-md items-center px-4 py-8 sm:px-6 sm:py-10">
      <section className="w-full space-y-4">
        <p className="text-center text-sm font-semibold uppercase text-muted-foreground">
          Crea tu portal de proyecto
        </p>
        <SignupForm />
      </section>
    </div>
  );
}
