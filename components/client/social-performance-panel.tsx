"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PostInsights = {
  id: string;
  caption: string;
  mediaType: string;
  permalink: string | null;
  publishedAt: string | null;
  likeCount: number;
  commentCount: number;
  interactions: number;
  previewUrl: string | null;
};

type HistoryPoint = {
  date: string;
  followers: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number | null;
  engagementRate: number | null;
};

type AccountInsights = {
  accountId: string;
  accountName: string;
  accountHandle: string | null;
  platform: "instagram";
  followers: number | null;
  following: number | null;
  mediaCount: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number;
  engagementRate: number | null;
  insightsStatus: "ok" | "limited" | "unavailable";
  insightsMessage?: string;
  posts: PostInsights[];
  history: HistoryPoint[];
  error?: string;
};

function formatMetric(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/D";
  return new Intl.NumberFormat("es-ES").format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function HistoryBars({ history }: { history: HistoryPoint[] }) {
  const points = useMemo(() => history.slice(-14), [history]);
  const maxReach = useMemo(
    () => Math.max(...points.map((point) => point.reach7d ?? 0), 0),
    [points]
  );

  if (points.length === 0) {
    return <p className="text-xs text-muted-foreground">Todavia no hay snapshots historicos.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex h-20 items-end gap-1 rounded-lg border border-border bg-white/70 p-2">
        {points.map((point) => {
          const reach = point.reach7d ?? 0;
          const height = maxReach > 0 ? Math.max(8, Math.round((reach / maxReach) * 100)) : 8;
          return (
            <div key={point.date} className="group relative flex-1">
              <div className="w-full rounded-sm bg-primary" style={{ height: `${height}%` }} />
              <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded border border-border bg-white px-2 py-1 text-[10px] shadow group-hover:block">
                <p>{formatDate(point.date)}</p>
                <p>Alcance: {formatMetric(point.reach7d)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Historico de alcance 7d (ultimos 14 snapshots).</p>
    </div>
  );
}

export function SocialPerformancePanel() {
  const [insights, setInsights] = useState<AccountInsights[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInsights() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/client/social-accounts/insights", { cache: "no-store" });
    const json = (await response.json()) as { error?: string; insights?: AccountInsights[] };
    setLoading(false);
    if (!response.ok) {
      setError(json.error ?? "No se pudo cargar el rendimiento.");
      return;
    }
    setInsights(json.insights ?? []);
  }

  useEffect(() => {
    void loadInsights();
  }, []);

  return (
    <Card className="space-y-4 bg-white/90">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Rendimiento de cuentas</CardTitle>
          <CardDescription>
            Metricas de Instagram de los ultimos 7 dias, posts recientes e historico diario.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => void loadInsights()} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar metricas"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay cuentas de Instagram conectadas con OAuth para mostrar rendimiento.
        </p>
      ) : null}

      <div className="space-y-4">
        {insights.map((account) => (
          <article key={account.accountId} className="rounded-xl border-2 border-border bg-background/70 p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-base font-bold">
                  {account.accountName} {account.accountHandle ? `(${account.accountHandle})` : ""}
                </p>
                <p className="text-xs text-muted-foreground">Instagram</p>
              </div>
              <Badge>7d</Badge>
            </div>

            {account.error ? <p className="mb-3 text-sm text-red-600">{account.error}</p> : null}

            {account.insightsStatus !== "ok" && !account.error ? (
              <p className="mb-3 rounded-lg border border-amber-400 bg-amber-50 p-2 text-sm text-amber-900">
                {account.insightsMessage ??
                  "Meta no devolvio insights avanzados para esta cuenta. Revisa permisos y estado de revision de la app."}
              </p>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-white/80 p-2 text-sm">
                <p className="text-xs text-muted-foreground">Seguidores</p>
                <p className="text-lg font-bold">{formatMetric(account.followers)}</p>
              </div>
              <div className="rounded-lg border border-border bg-white/80 p-2 text-sm">
                <p className="text-xs text-muted-foreground">Alcance 7d</p>
                <p className="text-lg font-bold">{formatMetric(account.reach7d)}</p>
              </div>
              <div className="rounded-lg border border-border bg-white/80 p-2 text-sm">
                <p className="text-xs text-muted-foreground">Impresiones 7d</p>
                <p className="text-lg font-bold">{formatMetric(account.impressions7d)}</p>
              </div>
              <div className="rounded-lg border border-border bg-white/80 p-2 text-sm">
                <p className="text-xs text-muted-foreground">Engagement</p>
                <p className="text-lg font-bold">
                  {account.engagementRate === null ? "N/D" : `${account.engagementRate}%`}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">Historico diario</p>
              <HistoryBars history={account.history} />
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">Publicaciones recientes</p>
              {account.posts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No hay publicaciones para mostrar.</p>
              ) : (
                <ul className="space-y-2">
                  {account.posts.slice(0, 6).map((post) => (
                    <li key={post.id} className="rounded-lg border border-border bg-white/70 p-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="line-clamp-1 text-sm font-medium">
                          {post.caption || `Publicacion ${post.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {post.mediaType} | {post.likeCount} likes | {post.commentCount} comentarios
                      </p>
                      {post.permalink ? (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold underline"
                        >
                          Ver publicacion
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
