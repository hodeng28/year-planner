export interface Review {
  id: string;
  goalId?: string;
  planId?: string;
  content: string;
  rating?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewDto {
  goalId?: string;
  planId?: string;
  content: string;
  rating?: number;
}

export interface UpdateReviewDto {
  content?: string;
  rating?: number;
}

