import { Card } from "@/components/ui/card";

export function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-muted animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-6 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse w-full" />
          <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
        </div>

        {/* Metadata */}
        <div className="flex gap-2 pt-2">
          <div className="h-3 bg-muted rounded animate-pulse w-16" />
          <div className="h-3 bg-muted rounded animate-pulse w-20" />
        </div>

        {/* Link */}
        <div className="h-4 bg-muted rounded animate-pulse w-24 mt-4" />
      </div>
    </Card>
  );
}
