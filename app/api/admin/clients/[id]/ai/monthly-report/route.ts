import { NextResponse } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { aiModel, getOpenAIClient } from "@/lib/ai/openai";
import { getClientSummary } from "@/lib/db/server";
import type { IntakeData } from "@/lib/intake/schema";
import {
  fetchInstagramInsights,
  type AccountInsights
} from "@/lib/instagram/insights";
import type { SocialAccountRow } from "@/lib/db/types";

export const runtime = "nodejs";

const adminMonthlyReportSchema = z.object({
  headline: z.string(),
  executiveSummary: z.string(),
  clientContext: z.string(),
  performanceRead: z.string(),
  opportunities: z.array(z.string()).min(3).max(6),
  risks: z.array(z.string()).min(2).max(5),
  nextActions: z
    .array(
      z.object({
        title: z.string(),
        owner: z.string(),
        priority: z.enum(["alta", "media", "baja"]),
        rationale: z.string()
      })
    )
    .min(3)
    .max(6),
  contentRecommendations: z
    .array(
      z.object({
        pillar: z.string(),
        format: z.string(),
        idea: z.string(),
        hook: z.string()
      })
    )
    .min(3)
    .max(6),
  clientMessageDraft: z.string()
});

function compactIntake(intake: Partial<IntakeData> | null) {
  if (!intake) return null;

  return {
    identity: intake.identity,
    goals: intake.goals,
    audience: intake.audience,
    tone: intake.tone,
    pillars: intake.pillars,
    messaging: intake.messaging,
    ctas: intake.ctas,
    logistics: intake.logistics
  };
}

function compactSocialAccount(account: SocialAccountRow) {
  return {
    platform: account.platform,
    name: account.account_name,
    handle: account.account_handle,
    status: account.status,
    connectedAt: account.connected_at,
    updatedAt: account.updated_at
  };
}

function compactInsights(account: AccountInsights) {
  return {
    accountName: account.accountName,
    accountHandle: account.accountHandle,
    followers: account.followers,
    mediaCount: account.mediaCount,
    reach7d: account.reach7d,
    impressions7d: account.impressions7d,
    profileViews7d: account.profileViews7d,
    interactionsRecentPosts: account.interactionsRecentPosts,
    engagementRate: account.engagementRate,
    insightsStatus: account.insightsStatus,
    insightsMessage: account.insightsMessage,
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

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("admin");
  const { id } = await params;

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY no esta configurada." },
      { status: 500 }
    );
  }

  const summary = await getClientSummary(id);
  if (!summary.client) {
    return NextResponse.json(
      { error: "Cliente no encontrado." },
      { status: 404 }
    );
  }

  const connectedInstagram = summary.socialAccounts.filter(
    (account) => account.platform === "instagram" && account.status === "connected"
  );
  const socialInsights = await Promise.all(
    connectedInstagram.map((account) => fetchInstagramInsights(account))
  );

  const intakeData = (summary.intake?.data ?? null) as Partial<IntakeData> | null;
  const openai = getOpenAIClient();

  try {
    const response = await openai.responses.parse({
      model: aiModel,
      input: [
        {
          role: "system",
          content:
            "Eres un director estrategico de marketing y social media. Generas informes mensuales para administradores/agencia. Escribe en espanol claro, accionable y profesional. No inventes metricas ni resultados; si faltan datos, dilo y propone la siguiente accion para obtenerlos."
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generar informe mensual accionable para la gestion de redes sociales y marca.",
            client: {
              id: summary.client.id,
              name: summary.client.display_name,
              status: summary.client.status,
              notes: summary.client.notes,
              createdAt: summary.client.created_at
            },
            intake: compactIntake(intakeData),
            assets: {
              total: summary.assetsCount,
              recent: summary.assets.slice(0, 8).map((asset) => ({
                type: asset.type,
                createdAt: asset.created_at,
                metadata: asset.metadata
              }))
            },
            brandbooks: {
              total: summary.brandbooks.length,
              latest: summary.latestBrandbook
                ? {
                    version: summary.latestBrandbook.version,
                    createdAt: summary.latestBrandbook.created_at
                  }
                : null
            },
            socialAccounts: summary.socialAccounts.map(compactSocialAccount),
            socialInsights: socialInsights.map(compactInsights)
          })
        }
      ],
      max_output_tokens: 1800,
      text: {
        format: zodTextFormat(adminMonthlyReportSchema, "admin_monthly_report")
      }
    });

    const report = response.output_parsed;
    if (!report) {
      return NextResponse.json(
        { error: "La IA no devolvio un informe valido." },
        { status: 502 }
      );
    }

    return NextResponse.json({ report, generatedAt: new Date().toISOString() });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar el informe con IA.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
