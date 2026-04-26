import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

export const brandSnapshotSchema = z.object({
  brandName: z.string(),
  stageLabel: z.string(),
  onboardingPct: z.number().min(0).max(100),
  assetsCount: z.number().int().min(0),
  brandbookStatus: z.string(),
  headline: z.string(),
  focus: z.array(z.string()).min(1).max(4),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string()
      })
    )
    .min(1)
    .max(3)
});

export type BrandSnapshotProps = z.infer<typeof brandSnapshotSchema>;

export const brandSnapshotDefaultProps: BrandSnapshotProps = {
  brandName: "ElSaltoWeb",
  stageLabel: "Onboarding",
  onboardingPct: 72,
  assetsCount: 8,
  brandbookStatus: "Brandbook v1",
  headline: "Tu sistema de marca ya tiene una base clara para crecer con orden.",
  focus: [
    "Completar los puntos pendientes del onboarding.",
    "Subir referencias visuales y materiales de campaña.",
    "Revisar métricas antes de decidir el siguiente bloque de contenido."
  ],
  metrics: [
    { label: "Onboarding", value: "72%", detail: "Base estratégica" },
    { label: "Assets", value: "8", detail: "Materiales listos" },
    { label: "Brandbook", value: "v1", detail: "Documento activo" }
  ]
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp"
} as const;

const colors = {
  ink: "#111111",
  pink: "#f08cb6",
  yellow: "#f2d048",
  lilac: "#c7a5dd",
  blue: "#dff2ff",
  green: "#d9f99d",
  paper: "#fffdf7"
};

function enter(frame: number, delay: number, fps: number) {
  return spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 18,
      mass: 0.85,
      stiffness: 130
    }
  });
}

function fade(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], clamp);
}

function Card({
  children,
  style
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        border: `6px solid ${colors.ink}`,
        borderRadius: 28,
        boxShadow: `18px 22px 0 ${colors.ink}`,
        background: "rgba(255, 253, 247, 0.96)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  index
}: {
  label: string;
  value: string;
  detail: string;
  index: number;
}) {
  const palette = [colors.blue, colors.green, "#ffe4ef"];

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        border: `5px solid ${colors.ink}`,
        borderRadius: 22,
        background: palette[index % palette.length],
        padding: "24px 22px",
        boxShadow: `10px 12px 0 ${colors.ink}`
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: 1,
          textTransform: "uppercase"
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 18, fontSize: 74, fontWeight: 950 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700 }}>
        {detail}
      </div>
    </div>
  );
}

export function BrandSnapshotVideo({
  brandName,
  stageLabel,
  onboardingPct,
  assetsCount,
  brandbookStatus,
  headline,
  focus,
  metrics
}: BrandSnapshotProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hero = enter(frame, 4, fps);
  const content = enter(frame, 28, fps);
  const progressWidth = interpolate(frame, [45, 105], [0, onboardingPct], clamp);
  const ribbonX = interpolate(frame, [0, 180], [-120, 120], clamp);
  const pulse = interpolate(frame % 60, [0, 30, 60], [0, 1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          `linear-gradient(140deg, ${colors.lilac} 0%, #f6c5df 46%, #ffeeba 100%)`,
        color: colors.ink,
        fontFamily:
          "Public Sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(17,17,17,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(17,17,17,0.08) 2px, transparent 2px)",
          backgroundSize: "64px 64px"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -120,
          right: -120,
          top: 230,
          height: 190,
          transform: `rotate(-7deg) translateX(${ribbonX}px)`,
          background: colors.yellow,
          borderTop: `7px solid ${colors.ink}`,
          borderBottom: `7px solid ${colors.ink}`
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -120,
          top: 88,
          width: 340,
          height: 340,
          borderRadius: 64,
          border: `8px solid ${colors.ink}`,
          background: colors.pink,
          transform: `rotate(${12 + pulse * 7}deg)`
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -82,
          bottom: 180,
          width: 280,
          height: 280,
          borderRadius: 44,
          border: `8px solid ${colors.ink}`,
          background: colors.blue,
          transform: `rotate(${-13 - pulse * 5}deg)`
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          flexDirection: "column",
          padding: "96px 72px 86px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: fade(frame, 0, 16),
            transform: `translateY(${(1 - hero) * 34}px)`
          }}
        >
          <div
            style={{
              border: `5px solid ${colors.ink}`,
              borderRadius: 999,
              background: colors.paper,
              padding: "16px 26px",
              fontSize: 30,
              fontWeight: 950,
              textTransform: "uppercase",
              boxShadow: `8px 9px 0 ${colors.ink}`
            }}
          >
            Snapshot De Marca
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{stageLabel}</div>
        </div>

        <Card
          style={{
            marginTop: 84,
            padding: "52px 48px",
            opacity: fade(frame, 8, 25),
            transform: `scale(${0.94 + hero * 0.06}) translateY(${(1 - hero) * 22}px)`
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase"
            }}
          >
            {brandName}
          </div>
          <div
            style={{
              marginTop: 18,
              maxWidth: 840,
              fontSize: 72,
              fontWeight: 950,
              lineHeight: 0.96,
              letterSpacing: -1
            }}
          >
            {headline}
          </div>
        </Card>

        <div
          style={{
            marginTop: 58,
            display: "flex",
            gap: 24,
            opacity: fade(frame, 30, 48),
            transform: `translateY(${(1 - content) * 32}px)`
          }}
        >
          {metrics.map((metric, index) => (
            <Metric
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
              index={index}
            />
          ))}
        </div>

        <Card
          style={{
            marginTop: 62,
            padding: 34,
            opacity: fade(frame, 54, 72)
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 950 }}>
                Progreso de onboarding
              </div>
              <div
                style={{
                  marginTop: 18,
                  height: 42,
                  overflow: "hidden",
                  border: `5px solid ${colors.ink}`,
                  borderRadius: 999,
                  background: "#ffffff"
                }}
              >
                <div
                  style={{
                    width: `${progressWidth}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${colors.pink}, ${colors.yellow})`,
                    borderRight: `4px solid ${colors.ink}`
                  }}
                />
              </div>
            </div>
            <div style={{ fontSize: 74, fontWeight: 950 }}>
              {Math.round(progressWidth)}%
            </div>
          </div>
        </Card>

        <div
          style={{
            marginTop: 62,
            display: "grid",
            gap: 20,
            opacity: fade(frame, 80, 98)
          }}
        >
          {focus.slice(0, 3).map((item, index) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                border: `5px solid ${colors.ink}`,
                borderRadius: 24,
                background: index % 2 === 0 ? colors.paper : "#fff1a8",
                padding: "24px 26px",
                boxShadow: `9px 10px 0 ${colors.ink}`,
                transform: `translateX(${interpolate(frame, [88 + index * 7, 104 + index * 7], [40, 0], clamp)}px)`
              }}
            >
              <div
                style={{
                  display: "grid",
                  flex: "0 0 auto",
                  width: 54,
                  height: 54,
                  placeItems: "center",
                  border: `4px solid ${colors.ink}`,
                  borderRadius: 999,
                  background: colors.pink,
                  fontSize: 28,
                  fontWeight: 950
                }}
              >
                {index + 1}
              </div>
              <div style={{ fontSize: 34, fontWeight: 850, lineHeight: 1.08 }}>
                {item}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
            fontWeight: 900,
            opacity: fade(frame, 112, 135)
          }}
        >
          <span>{brandbookStatus}</span>
          <span>{assetsCount} assets preparados</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
