"use client";

import { useMemo } from "react";
import type { PostInsights } from "./types";
import { formatDate, formatMetric } from "./utils";

export function PostPerformanceList({ posts }: { posts: PostInsights[] }) {
  const topPosts = useMemo(
    () =>
      [...posts].sort((a, b) => b.interactions - a.interactions).slice(0, 5),
    [posts]
  );

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-bold">Top publicaciones recientes</p>
        <p className="text-xs font-medium text-muted-foreground">
          Ranking por interacciones para detectar formatos que mejor responden.
        </p>
      </div>

      {topPosts.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No hay publicaciones recientes disponibles.
        </p>
      ) : (
        <ul className="space-y-2">
          {topPosts.map((post, index) => (
            <li
              key={post.id}
              className="rounded-xl border border-border bg-surface/95 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Top {index + 1}
                  </p>
                  <p className="line-clamp-2 text-sm font-bold text-foreground">
                    {post.caption || `Publicacion ${post.id.slice(0, 8)}`}
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-800">
                  {formatMetric(post.interactions)}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
                <span>{post.mediaType}</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span>{formatMetric(post.likeCount)} likes</span>
                <span>{formatMetric(post.commentCount)} comentarios</span>
              </div>

              {post.permalink ? (
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-8 items-center text-xs font-bold underline underline-offset-4"
                >
                  Ver publicacion
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
