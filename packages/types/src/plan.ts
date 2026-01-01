export type PlanType = 'quarter' | 'month' | 'week';

export interface Plan {
  id: string;
  goalId: string;
  type: PlanType;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlanDto {
  goalId: string;
  type: PlanType;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdatePlanDto {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

