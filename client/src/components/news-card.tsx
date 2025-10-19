import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import type { Article } from "@shared/schema";

interface NewsCardProps {
  article: Article;
  onClick?: () => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: (articleId: string) => void;
}

export function NewsCard({ article, onClick, isBookmarked = false, onBookmarkToggle }: NewsCardProps) {
  const { t, i18n } = useTranslation();
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: i18n.language === 'ko' ? ko : enUS,
  });

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(article.id);
    }
  };

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
        {/* Bookmark Button Overlay */}
        {onBookmarkToggle && (
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant={isBookmarked ? "default" : "secondary"}
              className="h-8 w-8"
              onClick={handleBookmarkClick}
              data-testid={`button-bookmark-${article.id}`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
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
          {t('article.readMore')}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}
