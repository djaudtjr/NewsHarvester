import { useState } from "react";
import { Mail, ChevronDown, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import type { Subscription } from "@shared/schema";

interface EmailStatusIndicatorProps {
  subscriptions: Subscription[];
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function EmailStatusIndicator({
  subscriptions,
  onNew,
  onDelete,
}: EmailStatusIndicatorProps) {
  const [open, setOpen] = useState(false);

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const nextDelivery = activeSubscriptions.length > 0
    ? Math.min(...activeSubscriptions.map((s) => s.deliveryHour))
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative gap-2"
          data-testid="button-email-status"
        >
          <Mail className="h-4 w-4" />
          {activeSubscriptions.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs"
            >
              {activeSubscriptions.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">이메일 구독</h3>
            <Button
              size="sm"
              onClick={() => {
                onNew();
                setOpen(false);
              }}
              data-testid="button-new-subscription"
            >
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
          {nextDelivery !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>다음 전송: 오늘 {nextDelivery.toString().padStart(2, "0")}:00</span>
            </div>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {activeSubscriptions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              활성화된 구독이 없습니다
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {activeSubscriptions.map((sub) => (
                <Card
                  key={sub.id}
                  className="p-3"
                  data-testid={`card-subscription-${sub.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {sub.keywords.slice(0, 3).map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="text-xs"
                          >
                            {keyword}
                          </Badge>
                        ))}
                        {sub.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{sub.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        전송: {sub.deliveryHour.toString().padStart(2, "0")}:00
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onDelete(sub.id)}
                      data-testid={`button-delete-subscription-${sub.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
