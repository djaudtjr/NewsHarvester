import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import type { UserPreferences } from "@shared/schema";

const availableSources = [
  { id: "newsapi", label: "NewsAPI (International)" },
  { id: "naver", label: "Naver (Korea)" },
  { id: "bing", label: "Bing News" },
];

const availableCategories = [
  { id: "technology", label: "기술 / Technology" },
  { id: "business", label: "경제 / Business" },
  { id: "general", label: "일반 / General" },
  { id: "sports", label: "스포츠 / Sports" },
  { id: "entertainment", label: "연예 / Entertainment" },
];

export default function Settings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [favoriteSources, setFavoriteSources] = useState<string[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [language, setLanguage] = useState("ko");

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  // Initialize state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFavoriteSources(preferences.favoriteSources || []);
      setFavoriteCategories(preferences.favoriteCategories || []);
      setLanguage(preferences.language || "ko");
    }
  }, [preferences]);

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (data: {
      favoriteSources: string[];
      favoriteCategories: string[];
      language: string;
    }) => {
      await apiRequest("PUT", "/api/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "설정 저장 완료",
        description: "사용자 설정이 성공적으로 저장되었습니다.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "오류",
        description: "설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const toggleSource = (sourceId: string) => {
    setFavoriteSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setFavoriteCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = () => {
    updatePreferences.mutate({
      favoriteSources,
      favoriteCategories,
      language,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">설정 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
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
            <SettingsIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">설정</h1>
              <p className="text-muted-foreground">뉴스 검색 경험을 개인화하세요</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle>언어 설정</CardTitle>
              <CardDescription>
                인터페이스 언어를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language">언어</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어 (Korean)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Favorite Sources */}
          <Card>
            <CardHeader>
              <CardTitle>선호 뉴스 소스</CardTitle>
              <CardDescription>
                기본으로 검색할 뉴스 소스를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableSources.map((source) => (
                  <div key={source.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={favoriteSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                      data-testid={`checkbox-source-${source.id}`}
                    />
                    <Label
                      htmlFor={`source-${source.id}`}
                      className="cursor-pointer"
                    >
                      {source.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Favorite Categories */}
          <Card>
            <CardHeader>
              <CardTitle>관심 카테고리</CardTitle>
              <CardDescription>
                관심있는 뉴스 카테고리를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={favoriteCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      data-testid={`checkbox-category-${category.id}`}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updatePreferences.isPending}
              size="lg"
              data-testid="button-save-preferences"
            >
              <Save className="h-4 w-4 mr-2" />
              {updatePreferences.isPending ? "저장 중..." : "설정 저장"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
