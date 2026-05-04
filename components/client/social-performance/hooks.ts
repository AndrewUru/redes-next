"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountInsights, AiSocialSummary } from "./types";

export function useSocialInsights(apiPath: string) {
  const [insights, setInsights] = useState<AccountInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiPath, {
        cache: "no-store"
      });
      const json = (await response.json()) as {
        error?: string;
        insights?: AccountInsights[];
      };

      if (!response.ok) {
        setError(json.error ?? "No se pudo cargar el rendimiento.");
        return;
      }

      setInsights(json.insights ?? []);
    } catch {
      setError("No se pudo cargar el rendimiento.");
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { insights, loading, error, reload };
}

export function useAiSocialSummary(apiPath: string | null) {
  const [summary, setSummary] = useState<AiSocialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!apiPath) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiPath, {
        method: "POST",
        cache: "no-store"
      });
      const json = (await response.json()) as {
        error?: string;
        summary?: AiSocialSummary;
      };

      if (!response.ok || !json.summary) {
        setError(json.error ?? "No se pudo generar la lectura con IA.");
        return;
      }

      setSummary(json.summary);
    } catch {
      setError("No se pudo generar la lectura con IA.");
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  return { summary, loading, error, generate };
}
