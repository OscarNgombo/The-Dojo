export interface ApiResponse<T> {
    data: T
    message?: string
    success: boolean
}

export interface ApiErrorShape {
    name: 'ApiError'
    message: string
    status?: number
    url: string
    method: string
    code?: string
    details?: unknown
    aborted?: boolean
    network?: boolean
}

export interface RequestConfig {
    signal?: AbortSignal
    timeoutMs?: number
    headers?: HeadersInit
}

export interface PaginatedResponse<T> {
    domain: string
    current_page: number
    last_page: number
    page_size: number
    total_count: number
    records: T[]
}

export interface User {

    id: string | number
    name: string
    email: string
    google_id?: string
    role: 'admin' | 'trainee'
    status: 'approved' | 'pending' | 'rejected'
    avatar_url?: string;
    created_at: string
    updated_at: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    name: string
    email: string
    password: string
}

export interface GoogleAuthCredentials {
    token: string
}

export interface Subject {
    id: string
    name: string
    description: string
    isActive: boolean
    createdBy: string
    createdAt: string
    updatedAt: string
    createdByName?: string 
}

export interface RawSubject {
    id: number
    name: string
    description: string
    created_by: number
    is_active: boolean
    created_at: string
    updated_at: string
    created_by_name?: string
}

export interface SubjectFormData {
    name: string
    description: string
    isActive: boolean
}

export interface Task {
    id: string
    subjectId: string
    title: string
    description: string
    requirements: string
    dueDate: string
    maxScore: number
    isActive: boolean
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface TaskFormData {
    subjectId: string
    title: string
    description: string
    requirements: string
    dueDate: string
    maxScore: number
    isActive: boolean
}

export interface QueryParams {
    page?: number
    pageSize?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    status?: 'approved' | 'pending' | 'rejected'
    role?: 'admin' | 'trainee'
    isActive?: boolean
}
