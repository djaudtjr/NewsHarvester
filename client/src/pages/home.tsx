import { useState, useMemo, useCallback } from "react";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Newspaper, LogOut, RefreshCw, Settings, Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingDashboard, TrendingDashboardSkeleton } from "@/components/trending-dashboard";
import { SearchFilterPanel, type SearchFilters } from "@/components/search-filter-panel";
import { NewsCard } from "@/components/news-card";
import { NewsCardSkeleton } from "@/components/news-card-skeleton";
import { SubscriptionModal } from "@/components/subscription-modal";
import { EmailStatusIndicator } from "@/components/email-status-indicator";
import type { Article, TrendData, Subscription, InsertSubscription, Bookmark as BookmarkType } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface PaginatedResponse {
  articles: Article[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchFilters>({
    keyword: "",
    source: "all",
  });

  // Fetch trending data
  const { data: trends, isLoading: trendsLoading } = useQuery<TrendData[]>({
    queryKey: ["/api/trends"],
  });

  // Fetch news articles with infinite scroll
  const buildSearchUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.keyword) params.append("keyword", searchParams.keyword);
    if (searchParams.startDate) {
      params.append("startDate", new Date(searchParams.startDate).toISOString().split('T')[0]);
    }
    if (searchParams.endDate) {
      params.append("endDate", new Date(searchParams.endDate).toISOString().split('T')[0]);
    }
    if (searchParams.source && searchParams.source !== "all") params.append("source", searchParams.source);
    params.append("page", page.toString());
    params.append("pageSize", "20");
    return `/api/news/search?${params.toString()}`;
  };

  const {
    data: articlesData,
    isLoading: articlesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchArticles,
  } = useInfiniteQuery<PaginatedResponse>({
    queryKey: ["articles", searchParams],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(buildSearchUrl(pageParam as number));
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    enabled: !!searchParams.keyword,
    initialPageParam: 1,
  });

  // Flatten all pages into single array
  const articles = useMemo(() => {
    return articlesData?.pages.flatMap((page) => page.articles) || [];
  }, [articlesData]);

  // Infinite scroll trigger
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: hasNextPage || false,
    isLoading: isFetchingNextPage,
  });

  // Fetch subscriptions
  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery<(BookmarkType & { article: Article })[]>({
    queryKey: ["/api/bookmarks"],
  });

  // Create set of bookmarked article IDs for quick lookup
  const bookmarkedArticleIds = useMemo(() => {
    return new Set(bookmarks.map((b: BookmarkType & { article: Article }) => b.articleId));
  }, [bookmarks]);

  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      await apiRequest("POST", "/api/subscriptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "구독 추가 완료",
        description: "이메일 구독이 성공적으로 추가되었습니다.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "구독 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete subscription mutation
  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "구독 삭제 완료",
        description: "이메일 구독이 삭제되었습니다.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "구독 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Create bookmark mutation
  const createBookmark = useMutation({
    mutationFn: async (articleId: string) => {
      // Short-circuit if already bookmarked
      if (bookmarkedArticleIds.has(articleId)) {
        return null;
      }
      return await apiRequest("POST", "/api/bookmarks", { articleId });
    },
    onSuccess: (data) => {
      if (data === null) return; // Already bookmarked, skip toast
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "북마크 추가",
        description: "기사가 저장되었습니다.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      // Handle 409 conflict gracefully
      if (error.status === 409) {
        queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
        return; // Silently refresh bookmarks
      }
      toast({
        title: "오류",
        description: "북마크 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Delete bookmark mutation
  const deleteBookmark = useMutation({
    mutationFn: async (articleId: string) => {
      const bookmark = bookmarks.find((b: BookmarkType & { article: Article }) => b.articleId === articleId);
      if (bookmark) {
        await apiRequest("DELETE", `/api/bookmarks/${bookmark.id}`, undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "북마크 삭제",
        description: "기사 저장이 취소되었습니다.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "오류",
        description: "북마크 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleBookmarkToggle = (articleId: string) => {
    if (bookmarkedArticleIds.has(articleId)) {
      deleteBookmark.mutate(articleId);
    } else {
      createBookmark.mutate(articleId);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchParams(filters);
  };

  const handleRefresh = () => {
    refetchArticles();
    queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">뉴스 수집기</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={articlesLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-5 w-5 ${articlesLoading ? "animate-spin" : ""}`} />
            </Button>
            <EmailStatusIndicator
              subscriptions={subscriptions}
              onNew={() => setSubscriptionModalOpen(true)}
              onDelete={(id) => deleteSubscription.mutate(id)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/bookmarks")}
              data-testid="button-bookmarks"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/settings")}
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16">
        {/* Trending Dashboard */}
        {trendsLoading ? (
          <TrendingDashboardSkeleton />
        ) : trends && trends.length > 0 ? (
          <TrendingDashboard trends={trends} />
        ) : null}

        {/* Search & Filter Panel */}
        <SearchFilterPanel
          onSearch={handleSearch}
          isLoading={articlesLoading}
        />

        {/* News Grid */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {!searchParams.keyword ? (
            <div className="text-center py-16">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                키워드를 입력하여 뉴스를 검색하세요
              </h2>
              <p className="text-muted-foreground">
                Naver, Bing 등 여러 소스에서 뉴스를 검색할 수 있습니다
              </p>
            </div>
          ) : articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                {articlesData?.pages[0].pagination.total || articles.length}개의 기사를 찾았습니다
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onClick={() => window.open(article.url, "_blank")}
                    isBookmarked={bookmarkedArticleIds.has(article.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
              
              {/* Infinite scroll trigger */}
              {hasNextPage && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center items-center py-8"
                  data-testid="infinite-scroll-trigger"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>더 많은 기사 불러오는 중...</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      data-testid="button-load-more"
                    >
                      더 보기
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                검색 결과가 없습니다
              </h2>
              <p className="text-muted-foreground">
                다른 키워드로 검색해보세요
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSave={(data) => createSubscription.mutateAsync(data)}
        isSaving={createSubscription.isPending}
      />
    </div>
  );
}
