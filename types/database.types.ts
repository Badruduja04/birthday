export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          birthday: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          memory_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          memory_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          memory_date?: string | null
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          event_date: string
          event_type: 'memory' | 'photo' | 'message' | 'birthday' | 'special'
          image_url: string | null
          image_path: string | null
          music_title: string | null
          music_artist: string | null
          audio_url: string | null
          audio_path: string | null
          is_highlighted: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          event_date: string
          event_type: 'memory' | 'photo' | 'message' | 'birthday' | 'special'
          image_url?: string | null
          image_path?: string | null
          music_title?: string | null
          music_artist?: string | null
          audio_url?: string | null
          audio_path?: string | null
          is_highlighted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_type?: 'memory' | 'photo' | 'message' | 'birthday' | 'special'
          image_url?: string | null
          image_path?: string | null
          music_title?: string | null
          music_artist?: string | null
          audio_url?: string | null
          audio_path?: string | null
          is_highlighted?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          title: string
          content: string | null
          mood: string | null
          weather: string | null
          image_url: string | null
          image_path: string | null
          audio_url: string | null
          audio_path: string | null
          tags: string[] | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          title: string
          content?: string | null
          mood?: string | null
          weather?: string | null
          image_url?: string | null
          image_path?: string | null
          audio_url?: string | null
          audio_path?: string | null
          tags?: string[] | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          title?: string
          content?: string | null
          mood?: string | null
          weather?: string | null
          image_url?: string | null
          image_path?: string | null
          audio_url?: string | null
          audio_path?: string | null
          tags?: string[] | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          user_id: string
          title: string
          artist: string
          audio_url: string
          cover_url: string | null
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          artist: string
          audio_url: string
          cover_url?: string | null
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          artist?: string
          audio_url?: string
          cover_url?: string | null
          duration?: number | null
          created_at?: string
        }
      }
    }
  }
}
