// Base response type for all API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination related types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainee';
  status: 'approved' | 'pending' | 'rejected';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Subject related types
export interface Subject {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectFormData {
  name: string;
  description: string;
  isActive: boolean;
}

// Task related types
export interface Task {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  requirements: string;
  dueDate: string;
  maxScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  subjectId: string;
  title: string;
  description: string;
  requirements: string;
  dueDate: string;
  maxScore: number;
  isActive: boolean;
}

// Query parameters for API requests
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'approved' | 'pending' | 'rejected';
  role?: 'admin' | 'trainee';
  isActive?: boolean;
}