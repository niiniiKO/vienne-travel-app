export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Profile {
    id: string
    name: string
    avatar_url?: string | null
}

export interface Tag {
    id: string
    name: string
    created_at: string
}

export interface Schedule {
    id: string
    start_time: string
    end_time: string
    title: string
    event_type: 'point' | 'range'
    address?: string | null
    tag?: string[] | null
    memo?: string | null
    created_at: string
}

export interface Transaction {
    id: string
    amount: number
    currency: 'EUR' | 'JPY'
    paid_by: string
    description?: string | null
    created_at: string
    // Virtual field for UI
    paid_by_user?: Profile
}

export interface TransactionShare {
    id: string
    transaction_id: string
    profile_id: string
    created_at: string
}

export interface Wish {
    id: string
    title: string
    status: 'want' | 'done'
    tag?: string[] | null
    memo?: string | null
    address?: string | null
    created_at: string
}

export interface Info {
    id: string
    title: string
    content_html?: string | null
    content_text?: string | null
    created_at: string
}

export interface Task {
    id: string
    title: string
    memo?: string | null
    is_done: boolean
    created_at: string
}
