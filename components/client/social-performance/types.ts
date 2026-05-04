export type PostInsights = {
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

export type HistoryPoint = {
  date: string;
  followers: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number | null;
  engagementRate: number | null;
};

export type AccountInsights = {
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

export type AiSocialSummary = {
  headline: string;
  executiveSummary: string;
  opportunities: string[];
  risks: string[];
  nextActions: Array<{
    title: string;
    reason: string;
    priority: "alta" | "media" | "baja";
  }>;
  contentIdeas: Array<{
    format: string;
    angle: string;
    hook: string;
  }>;
};

export type MetricKey =
  | "followers"
  | "reach7d"
  | "impressions7d"
  | "profileViews7d"
  | "interactionsRecentPosts"
  | "engagementRate";

export type ChartPoint = {
  label: string;
  value: number | null;
};

export type SocialOverview = {
  connectedAccounts: number;
  totalFollowers: number;
  totalInteractions: number;
  averageEngagement: number | null;
  accountsWithHistory: number;
};

export type HistoryRange = "6m" | "12m" | "all";
