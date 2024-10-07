export interface Database {
  public: {
    Tables: {
      emojis: {
        Row: {
          id: string
          image_url: string
          prompt: string
          likes_count: number
          creator_user_id: string
          created_at: string
        }
        Insert: {
          image_url: string
          prompt: string
          creator_user_id: string
          likes_count?: number
        }
        Update: {
          likes_count?: number
        }
      }
      likes: {
        Row: {
          user_id: string
          emoji_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          emoji_id: string
        }
        Update: {
          user_id?: string
          emoji_id?: string
        }
      }
    }
    Functions: {
      increment_likes: {
        Args: { emoji_id: string }
        Returns: void
      }
      decrement_likes: {
        Args: { emoji_id: string }
        Returns: void
      }
    }
  }
}