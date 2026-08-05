import type { AccountInsights, HistoryPoint, MetricKey } from "./types";
import { formatDelta, formatMetric, getMetricValue } from "./utils";

export function getComparison(
  history: HistoryPoint[],
  key: MetricKey
): {
  latest: number | null;
  previous: number | null;
  delta: number | null;
  trend: "up" | "down" | "flat";
} {
  const values = history
    .map((point) => getMetricValue(point, key))
    .filter((value): value is number => typeof value === "number");

  const latest = values.at(-1) ?? null;
  const previous = values.length > 1 ? (values.at(-2) ?? null) : null;
  const delta =
    latest !== null && previous !== null
      ? Number((latest - previous).toFixed(2))
      : null;
  const trend =
    delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down";

  return { latest, previous, delta, trend };
}

export function analyzeAccount(account: AccountInsights) {
  const history = [...account.history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const followerComparison = getComparison(history, "followers");
  const engagementComparison = getComparison(history, "engagementRate");
  const reachComparison = getComparison(history, "reach7d");
  const impressionsComparison = getComparison(history, "impressions7d");
  const profileViewsComparison = getComparison(history, "profileViews7d");

  const topPost =
    [...account.posts].sort((a, b) => b.interactions - a.interactions)[0] ??
    null;
  const averageInteractions =
    account.posts.length > 0
      ? Math.round(
          account.posts.reduce((total, post) => total + post.interactions, 0) /
            account.posts.length
        )
      : null;

  let headline = "Sigue construyendo historico para afinar el analisis.";
  if (followerComparison.delta !== null && followerComparison.delta > 0) {
    headline = `La comunidad crece: ${formatDelta(followerComparison.delta)} seguidores frente al ultimo snapshot.`;
  } else if (
    engagementComparison.delta !== null &&
    engagementComparison.delta > 0
  ) {
    headline = `La interaccion mejora: ${formatDelta(engagementComparison.delta, true)} en engagement frente al ultimo snapshot.`;
  } else if (reachComparison.delta !== null && reachComparison.delta < 0) {
    headline = `El alcance ha caido ${formatDelta(reachComparison.delta)} y conviene revisar formatos y frecuencia.`;
  }

  const strengths: string[] = [];
  const risks: string[] = [];

  if (followerComparison.delta !== null && followerComparison.delta > 0) {
    strengths.push(
      "La base de seguidores esta creciendo con respecto al ultimo corte."
    );
  }
  if (engagementComparison.delta !== null && engagementComparison.delta > 0) {
    strengths.push(
      "El engagement mejora, senal de mejor respuesta del contenido reciente."
    );
  }
  if (topPost) {
    strengths.push(
      `El mejor post reciente suma ${formatMetric(topPost.interactions)} interacciones y puede servir como referencia creativa.`
    );
  }

  if (reachComparison.delta !== null && reachComparison.delta < 0) {
    risks.push("El alcance va a la baja frente al snapshot anterior.");
  }
  if (impressionsComparison.delta !== null && impressionsComparison.delta < 0) {
    risks.push(
      "Las impresiones estan perdiendo traccion y conviene reforzar distribucion."
    );
  }
  if (
    profileViewsComparison.delta !== null &&
    profileViewsComparison.delta < 0
  ) {
    risks.push(
      "Las visitas al perfil caen, asi que el contenido esta convirtiendo menos curiosidad en intencion."
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      "Todavia no hay suficiente senal historica para detectar patrones fuertes."
    );
  }
  if (risks.length === 0) {
    risks.push(
      "No se detectan caidas fuertes en el ultimo tramo del historico."
    );
  }

  return {
    history,
    headline,
    strengths,
    risks,
    topPost,
    averageInteractions,
    comparisons: {
      followers: followerComparison,
      engagement: engagementComparison,
      reach: reachComparison,
      impressions: impressionsComparison,
      profileViews: profileViewsComparison
    }
  };
}
