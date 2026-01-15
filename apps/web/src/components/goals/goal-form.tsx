'use client';

import { useState } from 'react';
import type { CreateGoalDto, Goal } from '@year-planner/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GoalFormProps {
  initialData?: Goal;
  onSubmit: (data: CreateGoalDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function GoalForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: GoalFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description: description || undefined });
    if (!initialData) {
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
      <div className="space-y-2">
        <Label htmlFor="title">목표 제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="2025년에 이루고 싶은 목표"
          maxLength={60}
          required
          aria-required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">설명 (선택)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="목표에 대한 상세 설명을 입력하세요"
          maxLength={500}
          rows={3}
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !title.trim()}
          aria-disabled={isLoading || !title.trim()}
        >
          {isLoading ? '저장 중...' : initialData ? '수정' : '저장'}
        </Button>
      </div>
    </form>
  );
}
