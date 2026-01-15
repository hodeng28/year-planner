'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (title: string) => Promise<void>;
  isLoading?: boolean;
}

export function TaskForm({ onSubmit, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="새로운 할 일을 입력하세요"
        maxLength={80}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !title.trim()}>
        <Plus className="h-4 w-4 mr-2" />
        추가
      </Button>
    </form>
  );
}
