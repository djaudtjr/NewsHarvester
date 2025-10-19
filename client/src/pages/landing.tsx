import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Newspaper, Search, Mail, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">뉴스 수집기</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            로그인
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            여러 소스에서 뉴스를 한눈에,
            <br />
            개인화된 이메일로 받아보세요
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Naver, Bing 등 다양한 뉴스 소스를 통합 검색하고, 원하는 키워드로
            매일 뉴스 요약본을 이메일로 받아보세요.
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
            시작하기
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">통합 검색</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Naver, Bing 등 여러 소스에서 뉴스를 동시에 검색하고 중복은
              자동으로 제거됩니다.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">실시간 트렌드</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Naver Data Lab 기반 인기 카테고리 트렌드를 실시간으로
              확인하세요.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">이메일 구독</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              관심 키워드를 등록하면 매일 원하는 시간에 뉴스 요약 PDF를
              받아보실 수 있습니다.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AI 요약</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              OpenAI를 활용하여 뉴스 기사를 자동으로 요약해 빠르게 정보를
              파악하세요.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
