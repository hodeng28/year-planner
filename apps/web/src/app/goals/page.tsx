'use client';

import { useState, useEffect } from 'react';
import type { Goal, CreateGoalDto, UpdateGoalDto } from '@year-planner/types';
import { goalsApi } from '@/lib/api';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalForm } from '@/components/goals/goal-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch {
      toast.error('목표를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (data: CreateGoalDto) => {
    setIsSubmitting(true);
    try {
      const newGoal = await goalsApi.create(data);
      setGoals((prev) => [newGoal, ...prev]);
      setIsDialogOpen(false);
      toast.success('목표가 생성되었습니다.');
    } catch {
      toast.error('목표 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: UpdateGoalDto) => {
    if (!editingGoal) return;
    setIsSubmitting(true);
    try {
      const updated = await goalsApi.update(editingGoal.id, data);
      setGoals((prev) =>
        prev.map((g) => (g.id === editingGoal.id ? updated : g))
      );
      setEditingGoal(null);
      toast.success('목표가 수정되었습니다.');
    } catch {
      toast.error('목표 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await goalsApi.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success('목표가 삭제되었습니다.');
    } catch {
      toast.error('목표 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8" />
          <h1 className="text-2xl font-bold">나의 목표</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 목표
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 목표 만들기</DialogTitle>
            </DialogHeader>
            <GoalForm
              onSubmit={handleCreate}
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            아직 등록된 목표가 없습니다.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            첫 번째 목표 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={setEditingGoal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>목표 수정</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              initialData={editingGoal}
              onSubmit={handleUpdate}
              onCancel={() => setEditingGoal(null)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
