import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import type { Article } from "@shared/schema";

interface NewsCardProps {
  article: Article;
  onClick?: () => void;
}

export function NewsCard({ article, onClick }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      onClick={onClick}
      data-testid={`card-article-${article.id}`}
    >
      {/* Article Image */}
      <div className="relative w-full h-48 bg-muted">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-muted-foreground text-sm font-medium">
              {article.source}
            </span>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="p-6">
        {/* Headline */}
        <h3 className="text-lg font-semibold leading-snug line-clamp-2 mb-2" data-testid="text-article-title">
          {article.title}
        </h3>

        {/* Summary */}
        {article.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-2">
            {article.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span className="font-medium" data-testid="text-article-source">
            {article.source}
          </span>
          <span>•</span>
          <time dateTime={article.publishedAt.toString()} data-testid="text-article-time">
            {timeAgo}
          </time>
          {article.category && (
            <>
              <span>•</span>
              <span className="capitalize">{article.category}</span>
            </>
          )}
        </div>

        {/* Read More Link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
          onClick={(e) => e.stopPropagation()}
          data-testid="link-article-external"
        >
          원문 보기
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}
