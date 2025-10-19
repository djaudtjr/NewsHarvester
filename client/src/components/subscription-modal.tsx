import { useState } from "react";
import { X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Subscription, InsertSubscription } from "@shared/schema";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (subscription: InsertSubscription) => Promise<void>;
  editingSubscription?: Subscription;
  isSaving?: boolean;
}

export function SubscriptionModal({
  open,
  onClose,
  onSave,
  editingSubscription,
  isSaving,
}: SubscriptionModalProps) {
  const [keywords, setKeywords] = useState<string[]>(
    editingSubscription?.keywords || []
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [deliveryHour, setDeliveryHour] = useState(
    editingSubscription?.deliveryHour?.toString() || "9"
  );

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSave = async () => {
    if (keywords.length === 0) return;

    await onSave({
      keywords,
      deliveryHour: parseInt(deliveryHour),
      isActive: true,
      userId: editingSubscription?.userId || "",
    });

    handleClose();
  };

  const handleClose = () => {
    setKeywords(editingSubscription?.keywords || []);
    setKeywordInput("");
    setDeliveryHour(editingSubscription?.deliveryHour?.toString() || "9");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-subscription">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            이메일 구독 관리
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Keywords Section */}
          <div className="space-y-3">
            <Label htmlFor="keyword-input" className="text-sm font-medium">
              검색 키워드
            </Label>
            <div className="flex gap-2">
              <Input
                id="keyword-input"
                placeholder="키워드 입력..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                data-testid="input-keyword"
              />
              <Button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
                data-testid="button-add-keyword"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Keyword Tags */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
                {keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="pl-3 pr-1 py-1"
                    data-testid={`badge-keyword-${keyword}`}
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 hover-elevate rounded-full p-0.5"
                      data-testid={`button-remove-keyword-${keyword}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Time Section */}
          <div className="space-y-3">
            <Label htmlFor="delivery-hour" className="text-sm font-medium">
              이메일 전송 시간
            </Label>
            <Select value={deliveryHour} onValueChange={setDeliveryHour}>
              <SelectTrigger id="delivery-hour" data-testid="select-delivery-hour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, "0")}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              선택한 시간 1시간 전에 PDF가 생성되며, 설정한 시간에 이메일로 전송됩니다.
            </p>
          </div>

          {/* Preview Section */}
          <div className="p-4 bg-muted rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium mb-2">전송 예정 정보</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 키워드: {keywords.length > 0 ? keywords.join(", ") : "없음"}</p>
              <p>• 전송 시간: 매일 {deliveryHour.padStart(2, "0")}:00</p>
              <p>
                • PDF 생성: 매일{" "}
                {((parseInt(deliveryHour) - 1 + 24) % 24)
                  .toString()
                  .padStart(2, "0")}
                :00
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            data-testid="button-cancel"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={keywords.length === 0 || isSaving}
            data-testid="button-save-subscription"
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
