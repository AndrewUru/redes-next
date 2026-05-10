import { describe, expect, it } from "vitest";
import {
  analyzeAccount,
  getComparison
} from "@/components/client/social-performance/analysis";
import type { AccountInsights } from "@/components/client/social-performance/types";
import {
  averageMetric,
  buildOverview,
  formatDelta,
  formatPercent
} from "@/components/client/social-performance/utils";

const baseAccount: AccountInsights = {
  accountId: "account-1",
  accountName: "Acme Instagram",
  accountHandle: "acme",
  platform: "instagram",
  followers: 1200,
  following: 250,
  mediaCount: 42,
  reach7d: 800,
  impressions7d: 1400,
  profileViews7d: 90,
  interactionsRecentPosts: 170,
  engagementRate: 5.25,
  insightsStatus: "ok",
  posts: [
    {
      id: "post-1",
      caption: "Launch",
      mediaType: "IMAGE",
      permalink: null,
      publishedAt: "2026-05-01",
      likeCount: 40,
      commentCount: 5,
      interactions: 45,
      previewUrl: null
    },
    {
      id: "post-2",
      caption: "Behind the scenes",
      mediaType: "REEL",
      permalink: null,
      publishedAt: "2026-05-02",
      likeCount: 90,
      commentCount: 10,
      interactions: 100,
      previewUrl: null
    }
  ],
  history: [
    {
      date: "2026-05-02",
      followers: 1200,
      reach7d: 800,
      impressions7d: 1400,
      profileViews7d: 90,
      interactionsRecentPosts: 170,
      engagementRate: 5.25
    },
    {
      date: "2026-05-01",
      followers: 1150,
      reach7d: 850,
      impressions7d: 1500,
      profileViews7d: 110,
      interactionsRecentPosts: 145,
      engagementRate: 4.5
    }
  ]
};

describe("social performance utilities", () => {
  it("formats missing percentages and deltas for display", () => {
    expect(formatPercent(null)).toBe("N/D");
    expect(formatPercent(4.567)).toBe("4.57%");
    expect(formatDelta(null)).toBe("Sin referencia");
    expect(formatDelta(0, true)).toBe("Sin cambio (0.00 pp)");
    expect(formatDelta(-2.5, true)).toBe("-2.50 pp");
  });

  it("averages only numeric metric values", () => {
    expect(averageMetric([1, null, 2.335, Number.NaN])).toBe(1.67);
    expect(averageMetric([null, null])).toBeNull();
  });

  it("builds a cross-account overview", () => {
    const overview = buildOverview([
      baseAccount,
      {
        ...baseAccount,
        accountId: "account-2",
        followers: null,
        interactionsRecentPosts: 30,
        engagementRate: null,
        history: [baseAccount.history[0]]
      }
    ]);

    expect(overview).toEqual({
      connectedAccounts: 2,
      totalFollowers: 1200,
      totalInteractions: 200,
      averageEngagement: 5.25,
      accountsWithHistory: 1
    });
  });
});

describe("social performance analysis", () => {
  it("compares the latest two numeric history values", () => {
    expect(getComparison(baseAccount.history, "followers")).toEqual({
      latest: 1150,
      previous: 1200,
      delta: -50,
      trend: "down"
    });
  });

  it("sorts account history, finds the top post, and highlights growth", () => {
    const analysis = analyzeAccount(baseAccount);

    expect(analysis.history.map((point) => point.date)).toEqual([
      "2026-05-01",
      "2026-05-02"
    ]);
    expect(analysis.topPost?.id).toBe("post-2");
    expect(analysis.averageInteractions).toBe(73);
    expect(analysis.comparisons.followers).toMatchObject({
      latest: 1200,
      previous: 1150,
      delta: 50,
      trend: "up"
    });
    expect(analysis.headline).toContain("La comunidad crece");
  });
});
