import { format } from "date-fns";
import { Heart, BookOpen } from "lucide-react";
import type { MoodProgressDetail } from "@/hooks/useProgressData";
import { useTranslation } from "react-i18next";

interface Props {
  data: MoodProgressDetail;
}

const MOOD_EMOJI: Record<string, string> = {
  great: "😊",
  good: "🙂",
  okay: "😐",
  struggling: "😔",
  difficult: "😣",
};

const MOOD_COLORS: Record<string, string> = {
  great: "#22c55e",      // green
  good: "#86efac",       // light green
  okay: "#facc15",       // yellow
  struggling: "#f97316", // orange
  difficult: "#ef4444",  // red
};

export function MoodProgressSection({ data }: Props) {
  const getMoodLabel = (mood: string) => t(`day_detail_modal.mood.${mood}`, mood);

  if (data.dailyData.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center animate-fade-in">
        <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{"Inizia a tracciare il tuo umore per vedere approfondimenti"}</p>
      </div>
    );
  }

  const moodLine = data.dailyData;
  const maxScore = 5;
  const chartWidth = Math.max(moodLine.length * 50, 200);
  const chartHeight = 152;
  const padX = 24;
  const padY = 16;
  const innerW = chartWidth - padX * 2;
  const innerH = chartHeight - padY * 2;

  const points = moodLine.map((d, i) => {
    const x = padX + (moodLine.length > 1 ? (i / (moodLine.length - 1)) * innerW : innerW / 2);
    const y = padY + innerH - ((d.moodScore - 1) / (maxScore - 1)) * innerH;
    return { x, y, ...d };
  });

  // Build SVG path for smooth line
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Daylio-style mood chart */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-3">{"Umore nel tempo"}</p>
        <div className="overflow-x-auto -mx-2 px-2">
          <svg
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="block"
          >
            {/* Subtle horizontal grid lines */}
            {[1, 2, 3, 4, 5].map(level => {
              const y = padY + innerH - ((level - 1) / (maxScore - 1)) * innerH;
              return (
                <line
                  key={level}
                  x1={padX}
                  x2={chartWidth - padX}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeOpacity={0.15}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Connecting line */}
            <path
              d={linePath}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.3"
            />

            {/* Colored dots */}
            {points.map((p, i) => {
              const color = MOOD_COLORS[p.mood] || "#a3a3a3";
              return (
                <g key={p.date}>
                  {/* Glow */}
                  <circle cx={p.x} cy={p.y} r="10" fill={color} opacity="0.15" />
                  {/* Dot */}
                  <circle cx={p.x} cy={p.y} r="6" fill={color} stroke="hsl(var(--background))" strokeWidth="2" />
                  {/* Emoji label below */}
                  <text
                    x={p.x}
                    y={Math.min(p.y + 18, chartHeight - 8)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    className="select-none"
                  >
                    {MOOD_EMOJI[p.mood] || "😐"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Date labels */}
        <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
          {moodLine.length > 0 && (
            <>
              <span>{format(new Date(moodLine[0].date), "MMM d")}</span>
              <span>{format(new Date(moodLine[moodLine.length - 1].date), "MMM d")}</span>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {Object.entries(MOOD_COLORS).map(([mood, color]) => (
            <div key={mood} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground capitalize">{getMoodLabel(mood)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top emotions */}
      {data.topEmotions.length > 0 && (
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2">{"Umore più frequente"}</p>
          <div className="flex gap-2">
            {data.topEmotions.map(e => (
              <div key={e} className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
                <span>{MOOD_EMOJI[e] || "😐"}</span>
                <span className="text-xs font-medium">{getMoodLabel(e)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection count */}
      <div className="flex gap-3">
        <div className="flex-1 glass rounded-xl p-3 text-center">
          <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{data.reflectionCount}</p>
          <p className="text-[10px] text-muted-foreground">{"Riflessioni completate"}</p>
        </div>
        <div className="flex-1 glass rounded-xl p-3 flex items-center justify-center">
          <p className="text-xs text-center text-muted-foreground italic leading-relaxed">
            {"Sono una persona consapevole di sé"}
          </p>
        </div>
      </div>
    </div>
  );
}
