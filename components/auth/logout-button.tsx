"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground hover:text-danger"
      onClick={async () => {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      Cerrar sesión
    </Button>
  );
}
