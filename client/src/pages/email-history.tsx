import { useQuery } from "@tanstack/react-query";
import { Mail, Calendar, CheckCircle, XCircle, FileText, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import type { EmailLog, Subscription } from "@shared/schema";

export default function EmailHistory() {
  const { data: logs = [], isLoading } = useQuery<(EmailLog & { subscription: Subscription })[]>({
    queryKey: ["/api/email-logs"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" data-testid="button-back-to-home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">이메일 전송 내역</h1>
          </div>
        </header>

        <main className="pt-20 max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" data-testid="button-back-to-home">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">이메일 전송 내역</h1>
        </div>
      </header>

      <main className="pt-20 max-w-5xl mx-auto px-4 py-8">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">전송 내역이 없습니다</h2>
            <p className="text-muted-foreground mb-6">
              이메일 구독을 추가하고 첫 번째 뉴스 요약을 받아보세요
            </p>
            <Link to="/">
              <Button data-testid="button-add-subscription">구독 추가하기</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">전송 기록</h2>
              <p className="text-muted-foreground">
                총 {logs.length}개의 이메일이 전송되었습니다
              </p>
            </div>

            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} data-testid={`email-log-${log.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {log.status === "sent" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <span data-testid={`text-log-keywords-${log.id}`}>
                            {log.subscription.keywords.join(", ")}
                          </span>
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <div className="flex items-center gap-2" data-testid={`text-log-date-${log.id}`}>
                            <Calendar className="h-4 w-4" />
                            <span>
                              {log.sentAt
                                ? format(new Date(log.sentAt), "yyyy년 MM월 dd일 HH:mm")
                                : "날짜 정보 없음"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2" data-testid={`text-log-article-count-${log.id}`}>
                            <FileText className="h-4 w-4" />
                            <span>{log.articleCount}개의 기사</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={log.status === "sent" ? "default" : "destructive"}
                        data-testid={`badge-log-status-${log.id}`}
                      >
                        {log.status === "sent" ? "전송 완료" : "전송 실패"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {log.pdfPath && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid={`button-download-pdf-${log.id}`}
                      >
                        <a href={log.pdfPath} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          PDF 다운로드
                        </a>
                      </Button>
                    )}
                    {log.errorMessage && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-3">
                        <p className="text-sm text-destructive" data-testid={`text-log-error-${log.id}`}>
                          <strong>오류:</strong> {log.errorMessage}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
