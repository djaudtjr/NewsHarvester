import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrendData } from "@shared/schema";

interface TrendingDashboardProps {
  trends: TrendData[];
}

export function TrendingDashboard({ trends }: TrendingDashboardProps) {
  const getTrendIcon = (direction: TrendData["trendDirection"]) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-3 w-3" />;
      case "down":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = (direction: TrendData["trendDirection"]) => {
    switch (direction) {
      case "up":
        return "text-chart-3";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (!trends || trends.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
          실시간 인기 카테고리
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {trends.map((trend, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-2 whitespace-nowrap hover-elevate cursor-pointer"
              data-testid={`badge-trend-${trend.category}`}
            >
              <span className="font-medium capitalize">{trend.category}</span>
              <span className={`flex items-center gap-1 text-xs ${getTrendColor(trend.trendDirection)}`}>
                {getTrendIcon(trend.trendDirection)}
                {Math.abs(trend.changePercent)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.articleCount}건
              </span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrendingDashboardSkeleton() {
  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-4 bg-muted rounded w-32 mb-4 animate-pulse" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 bg-muted rounded-full w-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
