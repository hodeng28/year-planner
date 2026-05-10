'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmotions, usePatterns, useStrategies } from '@/hooks/use-options';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function OptionSection({ title, queryKey, endpoint, useHook }: { title: string; queryKey: string; endpoint: string; useHook: () => any }) {
  const [newName, setNewName] = useState('');
  const queryClient = useQueryClient();
  const { data: options } = useHook();

  const addMutation = useMutation({
    mutationFn: (name: string) =>
      fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setNewName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 옵션 추가" />
          <Button onClick={() => addMutation.mutate(newName)} disabled={!newName}>
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {options?.map((opt: any) => (
            <Badge key={opt.id} variant="secondary" className="gap-1">
              {opt.name}
              {!opt.isDefault && (
                <button onClick={() => deleteMutation.mutate(opt.id)} className="ml-1 hover:text-red-500">
                  ×
                </button>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">설정</h2>
      <OptionSection title="감정 옵션" queryKey="emotions" endpoint="/options/emotions" useHook={useEmotions} />
      <OptionSection title="패턴 옵션" queryKey="patterns" endpoint="/options/patterns" useHook={usePatterns} />
      <OptionSection title="전략 옵션" queryKey="strategies" endpoint="/options/strategies" useHook={useStrategies} />
    </div>
  );
}
