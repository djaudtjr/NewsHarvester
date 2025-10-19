import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export interface SearchFilters {
  keyword: string;
  startDate?: Date;
  endDate?: Date;
  source: string;
}

interface SearchFilterPanelProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export function SearchFilterPanel({ onSearch, isLoading }: SearchFilterPanelProps) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [source, setSource] = useState("all");

  const handleSearch = () => {
    onSearch({ keyword, startDate, endDate, source });
  };

  const handleClear = () => {
    setKeyword("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSource("all");
    onSearch({ keyword: "", source: "all" });
  };

  const hasFilters = keyword || startDate || endDate || source !== "all";

  return (
    <div className="sticky top-16 z-40 w-full bg-card border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Keyword Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('home.searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
              data-testid="input-search-keyword"
            />
          </div>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal min-w-[200px]"
                data-testid="button-date-range"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDate && endDate ? (
                  `${format(startDate, "yyyy-MM-dd", { locale: ko })} ~ ${format(endDate, "yyyy-MM-dd", { locale: ko })}`
                ) : startDate ? (
                  format(startDate, "yyyy-MM-dd", { locale: ko })
                ) : (
                  "날짜 선택"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium mb-2">시작 날짜</p>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={ko}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium mb-2">종료 날짜</p>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || date < startDate}
                    locale={ko}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Source Filter */}
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[150px]" data-testid="select-source">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('search.allSources')}</SelectItem>
              <SelectItem value="newsapi">NewsAPI</SelectItem>
              <SelectItem value="naver">Naver</SelectItem>
              <SelectItem value="bing">Bing</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={!keyword || isLoading}
              data-testid="button-search"
            >
              {t('common.search')}
            </Button>
            {hasFilters && (
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
                data-testid="button-clear"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
