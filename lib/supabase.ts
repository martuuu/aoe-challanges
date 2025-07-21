import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          level: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          level?: number
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          challenger: string
          challenged: string
          winner: string | null
          date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          challenger: string
          challenged: string
          winner?: string | null
          date: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          challenger?: string
          challenged?: string
          winner?: string | null
          date?: string
          status?: string
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          challenger: string
          challenged: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          challenger: string
          challenged: string
          status: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          challenger?: string
          challenged?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
      }
    }
  }
}
