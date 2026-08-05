import { NextResponse } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { aiModel, getOpenAIClient } from "@/lib/ai/openai";
import type { SocialAccountRow } from "@/lib/db/types";
import {
  fetchInstagramInsights,
  type AccountInsights,
  type HistoryPoint
} from "@/lib/instagram/insights";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SnapshotRecord = Record<string, unknown>;

const prioritySchema = z.enum(["alta", "media", "baja"]);

const aiSocialSummarySchema = z.object({
  headline: z.string(),
  executiveSummary: z.string(),
  opportunities: z.array(z.string()).min(3).max(5),
  risks: z.array(z.string()).min(2).max(4),
  nextActions: z
    .array(
      z.object({
        title: z.string(),
        reason: z.string(),
        priority: prioritySchema
      })
    )
    .min(3)
    .max(5),
  contentIdeas: z
    .array(
      z.object({
        format: z.string(),
        angle: z.string(),
        hook: z.string()
      })
    )
    .min(3)
    .max(5)
});

async function getClientContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const { data: link } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!link?.client_id) {
    return {
      error: NextResponse.json({ error: "No client" }, { status: 400 })
    };
  }

  return { supabase, clientId: link.client_id };
}

function mapHistoryRow(row: SnapshotRecord): HistoryPoint {
  return {
    date: String(row.snapshot_date ?? ""),
    followers: (row.followers as number | null) ?? null,
    reach7d: (row.reach_7d as number | null) ?? null,
    impressions7d: (row.impressions_7d as number | null) ?? null,
    profileViews7d: (row.profile_views_7d as number | null) ?? null,
    interactionsRecentPosts:
      (row.interactions_recent_posts as number | null) ?? null,
    engagementRate: (row.engagement_rate as number | null) ?? null
  };
}

function compactAccount(account: AccountInsights) {
  return {
    accountName: account.accountName,
    accountHandle: account.accountHandle,
    followers: account.followers,
    following: account.following,
    mediaCount: account.mediaCount,
    reach7d: account.reach7d,
    impressions7d: account.impressions7d,
    profileViews7d: account.profileViews7d,
    interactionsRecentPosts: account.interactionsRecentPosts,
    engagementRate: account.engagementRate,
    insightsStatus: account.insightsStatus,
    insightsMessage: account.insightsMessage,
    history: account.history.slice(-14),
    topPosts: [...account.posts]
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5)
      .map((post) => ({
        caption: post.caption.slice(0, 280),
        mediaType: post.mediaType,
        publishedAt: post.publishedAt,
        likes: post.likeCount,
        comments: post.commentCount,
        interactions: post.interactions
      })),
    error: account.error
  };
}

export async function POST() {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY no esta configurada." },
      { status: 500 }
    );
  }

  const { data, error } = await ctx.supabase
    .from("social_accounts")
    .select("*")
    .eq("client_id", ctx.clientId)
    .eq("platform", "instagram")
    .eq("status", "connected");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const accounts = (data ?? []) as SocialAccountRow[];
  if (accounts.length === 0) {
    return NextResponse.json(
      { error: "No hay cuentas de Instagram conectadas." },
      { status: 400 }
    );
  }

  const insights = await Promise.all(
    accounts.map((account) => fetchInstagramInsights(account))
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: historyRows, error: historyError } = await ctx.supabase
    .from("social_account_daily_snapshots")
    .select(
      "social_account_id,snapshot_date,followers,reach_7d,impressions_7d,profile_views_7d,interactions_recent_posts,engagement_rate"
    )
    .eq("client_id", ctx.clientId)
    .in(
      "social_account_id",
      accounts.map((account) => account.id)
    )
    .gte("snapshot_date", thirtyDaysAgo.toISOString().slice(0, 10))
    .order("snapshot_date", { ascending: true });

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 400 });
  }

  const historyByAccount = new Map<string, HistoryPoint[]>();
  for (const row of (historyRows ?? []) as SnapshotRecord[]) {
    const accountId = String(row.social_account_id ?? "");
    if (!accountId) continue;
    const history = historyByAccount.get(accountId) ?? [];
    history.push(mapHistoryRow(row));
    historyByAccount.set(accountId, history);
  }

  const enrichedInsights = insights.map((account) => ({
    ...account,
    history: historyByAccount.get(account.accountId) ?? []
  }));

  try {
    const openai = getOpenAIClient();
    const response = await openai.responses.parse({
      model: aiModel,
      input: [
        {
          role: "system",
          content:
            "Eres un estratega senior de social media. Analiza datos reales de Instagram y devuelve recomendaciones concretas, prudentes y accionables en espanol. No inventes metricas ni promesas resultados."
        },
        {
          role: "user",
          content: JSON.stringify({
            goal: "Generar una lectura ejecutiva para el dashboard del cliente.",
            accounts: enrichedInsights.map(compactAccount)
          })
        }
      ],
      max_output_tokens: 1400,
      text: {
        format: zodTextFormat(aiSocialSummarySchema, "social_ai_summary")
      }
    });

    const summary = response.output_parsed;
    if (!summary) {
      return NextResponse.json(
        { error: "La IA no devolvio una lectura valida." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      summary,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar la lectura con IA.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
