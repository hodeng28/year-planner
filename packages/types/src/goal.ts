export interface Goal {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
}

