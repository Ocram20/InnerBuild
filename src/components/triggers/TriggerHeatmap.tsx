import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapData } from "@/hooks/useTriggerTracking";
interface TriggerHeatmapProps {
  data: HeatmapData[];
}

const hours = [
  "00", "01", "02", "03", "04", "05",
  "06", "07", "08", "09", "10", "11",
  "12", "13", "14", "15", "16", "17",
  "18", "19", "20", "21", "22", "23",
];

export default function TriggerHeatmap({ data }: TriggerHeatmapProps) {
  const days = [
    "Dom", "Lun", "Mar",
    "Mer", "Gio", "Ven",
    "Sab",
  ];

  const hourGroups = [
    { label: "Notte", hours: [0, 1, 2, 3, 4, 5] },
    { label: "Mattina", hours: [6, 7, 8, 9, 10, 11] },
    { label: "Pomeriggio", hours: [12, 13, 14, 15, 16, 17] },
    { label: "Sera", hours: [18, 19, 20, 21, 22, 23] },
  ];

  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  const getCell = (day: number, hour: number) => {
    const cell = data.find(d => d.day === day && d.hour === hour);
    return cell || { count: 0, avgIntensity: 0 };
  };

  const getGroupedCell = (day: number, hourGroup: number[]) => {
    const cells = hourGroup.map(h => getCell(day, h));
    const totalCount = cells.reduce((a, b) => a + b.count, 0);
    const avgIntensity = totalCount > 0
      ? cells.reduce((a, b) => a + (b.avgIntensity * b.count), 0) / totalCount
      : 0;
    return { count: totalCount, avgIntensity };
  };

  const getCellStyle = (count: number, avgIntensity: number) => {
    if (count === 0) return { backgroundColor: "hsl(var(--muted) / 0.3)" };
    const opacity = Math.min(0.3 + (count / maxCount) * 0.7, 1);
    if (avgIntensity >= 7) return { backgroundColor: `rgba(239, 68, 68, ${opacity})` };
    if (avgIntensity >= 4) return { backgroundColor: `rgba(249, 115, 22, ${opacity})` };
    return { backgroundColor: `rgba(234, 179, 8, ${opacity})` };
  };

  if (data.length === 0) {
    return (
      <Card className="glass rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{"Heatmap Trigger"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {"Registra dei trigger per vedere la mappa dei pattern"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{"Heatmap Trigger"}</span>
          <span className="text-xs font-normal text-muted-foreground">{"Ultimi 30 giorni"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: Simplified grouped view */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-5 gap-1">
            <div className="text-[10px] text-muted-foreground"></div>
            {hourGroups.map((group) => (
              <div key={group.label} className="text-[10px] text-muted-foreground text-center">
                {group.label}
              </div>
            ))}
            {days.map((day, dayIndex) => (
              <>
                <div key={`day-${dayIndex}`} className="text-[10px] text-muted-foreground flex items-center">
                  {day}
                </div>
                {hourGroups.map((group) => {
                  const cell = getGroupedCell(dayIndex, group.hours);
                  return (
                    <div
                      key={`${dayIndex}-${group.label}`}
                      className="aspect-square rounded-md relative group cursor-pointer"
                      style={getCellStyle(cell.count, cell.avgIntensity)}
                      title={`${day} ${group.label}: ${cell.count} trigger${cell.count !== 1 ? 's' : ''}`}
                    >
                      {cell.count > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow-sm">
                          {cell.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Desktop: Full hourly view */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 mb-1">
              <div></div>
              {hours.map((hour) => (
                <div key={hour} className="text-[8px] text-muted-foreground text-center">
                  {parseInt(hour) % 3 === 0 ? hour : ""}
                </div>
              ))}
            </div>
            {days.map((day, dayIndex) => (
              <div key={day} className="grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 mb-0.5">
                <div className="text-[10px] text-muted-foreground flex items-center">
                  {day}
                </div>
                {hours.map((_, hourIndex) => {
                  const cell = getCell(dayIndex, hourIndex);
                  return (
                    <div
                      key={`${dayIndex}-${hourIndex}`}
                      className="aspect-square rounded-sm relative group cursor-pointer transition-transform hover:scale-150 hover:z-10"
                      style={getCellStyle(cell.count, cell.avgIntensity)}
                      title={`${day} ${hourIndex}:00 - ${cell.count} trigger(s), intensity: ${cell.avgIntensity.toFixed(1)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-yellow-500/70"></div>
            <span>{"Lieve (1-3)"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-orange-500/70"></div>
            <span>{"Medio (4-6)"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500/70"></div>
            <span>{"Forte (7-10)"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
