export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          criada_em: string
          id: string
          nome: string
          peso: number
          user_id: string
        }
        Insert: {
          criada_em?: string
          id?: string
          nome: string
          peso?: number
          user_id?: string
        }
        Update: {
          criada_em?: string
          id?: string
          nome?: string
          peso?: number
          user_id?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          atualizada_em: string
          pesos: Json
          user_id: string
        }
        Insert: {
          atualizada_em?: string
          pesos?: Json
          user_id?: string
        }
        Update: {
          atualizada_em?: string
          pesos?: Json
          user_id?: string
        }
        Relationships: []
      }
      lojas: {
        Row: {
          bairro: string | null
          categoria: string | null
          cidade: string | null
          criada_em: string
          duplicada: boolean
          endereco: string | null
          exemplo: boolean
          fechada: boolean
          google_avaliacoes: number | null
          google_nota: number | null
          google_place_id: string | null
          horario_funcionamento: string | null
          id: string
          instagram: string | null
          latitude: number | null
          longitude: number | null
          melhor_horario: string | null
          nome: string
          nome_fantasia: string | null
          observacoes: string | null
          potencial: number
          prioridade: string
          responsavel: string | null
          site: string | null
          status: string
          telefone: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          categoria?: string | null
          cidade?: string | null
          criada_em?: string
          duplicada?: boolean
          endereco?: string | null
          exemplo?: boolean
          fechada?: boolean
          google_avaliacoes?: number | null
          google_nota?: number | null
          google_place_id?: string | null
          horario_funcionamento?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          melhor_horario?: string | null
          nome: string
          nome_fantasia?: string | null
          observacoes?: string | null
          potencial?: number
          prioridade?: string
          responsavel?: string | null
          site?: string | null
          status?: string
          telefone?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          categoria?: string | null
          cidade?: string | null
          criada_em?: string
          duplicada?: boolean
          endereco?: string | null
          exemplo?: boolean
          fechada?: boolean
          google_avaliacoes?: number | null
          google_nota?: number | null
          google_place_id?: string | null
          horario_funcionamento?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          melhor_horario?: string | null
          nome?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          potencial?: number
          prioridade?: string
          responsavel?: string | null
          site?: string | null
          status?: string
          telefone?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      roteiro_dia: {
        Row: {
          concluida: boolean
          data: string
          id: string
          loja_id: string
          ordem: number
          user_id: string
        }
        Insert: {
          concluida?: boolean
          data?: string
          id?: string
          loja_id: string
          ordem?: number
          user_id?: string
        }
        Update: {
          concluida?: boolean
          data?: string
          id?: string
          loja_id?: string
          ordem?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roteiro_dia_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          com_quem: string | null
          criada_em: string
          data_hora: string
          id: string
          loja_id: string
          notas: string | null
          objecoes: string | null
          proximo_passo: string | null
          resultado: string
          user_id: string
          voltar_em: string | null
        }
        Insert: {
          com_quem?: string | null
          criada_em?: string
          data_hora?: string
          id?: string
          loja_id: string
          notas?: string | null
          objecoes?: string | null
          proximo_passo?: string | null
          resultado: string
          user_id?: string
          voltar_em?: string | null
        }
        Update: {
          com_quem?: string | null
          criada_em?: string
          data_hora?: string
          id?: string
          loja_id?: string
          notas?: string | null
          objecoes?: string | null
          proximo_passo?: string | null
          resultado?: string
          user_id?: string
          voltar_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
