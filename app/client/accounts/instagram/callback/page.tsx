"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

function getReasonFromHash(hashParams: URLSearchParams) {
  return (
    hashParams.get("error_reason") ??
    hashParams.get("error") ??
    hashParams.get("error_description") ??
    "unknown_oauth_error"
  );
}

export default function InstagramBusinessCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Procesando autorizacion de Instagram...");

  useEffect(() => {
    async function finalize() {
      const rawHash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

      const hashParams = new URLSearchParams(rawHash);
      const state = hashParams.get("state");
      const accessToken = hashParams.get("access_token");
      const longLivedToken = hashParams.get("long_lived_token");

      if (hashParams.get("error") || hashParams.get("error_reason") || hashParams.get("error_description")) {
        const reason = encodeURIComponent(getReasonFromHash(hashParams));
        router.replace(`/client/accounts?oauth=error&reason=${reason}`);
        return;
      }

      if (!state || (!accessToken && !longLivedToken)) {
        router.replace("/client/accounts?oauth=error&reason=missing_oauth_fragment");
        return;
      }

      setMessage("Validando permisos y vinculando cuenta...");

      const res = await fetch("/api/client/social-accounts/instagram/business-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          accessToken: accessToken ?? undefined,
          longLivedToken: longLivedToken ?? undefined
        })
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        const reason = encodeURIComponent(json.error ?? "business_complete_failed");
        router.replace(`/client/accounts?oauth=error&reason=${reason}`);
        return;
      }

      router.replace("/client/accounts?oauth=success");
    }

    void finalize();
  }, [router]);

  return (
    <main className="space-y-4">
      <Card className="space-y-2">
        <CardTitle>Conectando Instagram</CardTitle>
        <CardDescription>{message}</CardDescription>
      </Card>
    </main>
  );
}
