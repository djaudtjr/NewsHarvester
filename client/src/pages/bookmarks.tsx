import { useQuery } from "@tanstack/react-query";
import { Bookmark as BookmarkIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/news-card";
import { NewsCardSkeleton } from "@/components/news-card-skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import type { Bookmark, Article } from "@shared/schema";

export default function Bookmarks() {
  const [, setLocation] = useLocation();

  // Fetch bookmarked articles
  const { data: bookmarks, isLoading } = useQuery<(Bookmark & { article: Article })[]>({
    queryKey: ["/api/bookmarks"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로 가기
            </Button>
            <div className="flex items-center gap-3">
              <BookmarkIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">저장된 기사</h1>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const articles: Article[] = bookmarks?.map((b: Bookmark & { article: Article }) => b.article) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
          <div className="flex items-center gap-3">
            <BookmarkIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">저장된 기사</h1>
              <p className="text-muted-foreground">
                {articles.length}개의 저장된 기사
              </p>
            </div>
          </div>
        </div>

        {/* Bookmarked Articles */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">저장된 기사가 없습니다</h2>
            <p className="text-muted-foreground mb-4">
              관심있는 기사를 저장하여 나중에 다시 읽어보세요
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              뉴스 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: Article) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={() => window.open(article.url, "_blank")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
