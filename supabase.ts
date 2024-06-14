export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          category: string;
          channelid: string | null;
          content: string;
          created_at: string;
          embedding: unknown | null;
          id: number;
          meta: Json | null;
          platform: number;
          updated_at: string;
          updated_by: string;
          userid: string | null;
          verified: boolean | null;
        };
        Insert: {
          category: string;
          channelid?: string | null;
          content: string;
          created_at?: string;
          embedding?: unknown | null;
          id?: never;
          meta?: Json | null;
          platform?: number;
          updated_at?: string;
          updated_by?: string;
          userid?: string | null;
          verified?: boolean | null;
        };
        Update: {
          category?: string;
          channelid?: string | null;
          content?: string;
          created_at?: string;
          embedding?: unknown | null;
          id?: never;
          meta?: Json | null;
          platform?: number;
          updated_at?: string;
          updated_by?: string;
          userid?: string | null;
          verified?: boolean | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          data: Json | null;
          embedding: unknown | null;
          event_ctx: string | null;
          fts: unknown | null;
          id: number;
          profile: string | null;
          userid: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          embedding?: unknown | null;
          event_ctx?: string | null;
          fts?: unknown | null;
          id?: number;
          profile?: string | null;
          userid: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          embedding?: unknown | null;
          event_ctx?: string | null;
          fts?: unknown | null;
          id?: number;
          profile?: string | null;
          userid?: string;
        };
        Relationships: [];
      };
      profiles_login_wip: {
        Row: {
          avatar_url: string | null;
          embeddings: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          embeddings?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          embeddings?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string;
            };
            Returns: unknown;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: unknown;
          };
      halfvec_avg: {
        Args: {
          "": number[];
        };
        Returns: unknown;
      };
      halfvec_out: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      halfvec_send: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hnswhandler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hybrid_search: {
        Args: {
          channel: string;
          query_text: string;
          query_embedding: unknown;
          match_count: number;
          full_text_weight?: number;
          semantic_weight?: number;
          rrf_k?: number;
        };
        Returns: {
          category: string;
          channelid: string | null;
          content: string;
          created_at: string;
          embedding: unknown | null;
          id: number;
          meta: Json | null;
          platform: number;
          updated_at: string;
          updated_by: string;
          userid: string | null;
          verified: boolean | null;
        }[];
      };
      hybrid_search2: {
        Args: {
          channel: string;
          query_text: string;
          query_embedding: unknown;
          match_count: number;
          full_text_weight?: number;
          semantic_weight?: number;
          rrf_k?: number;
        };
        Returns: {
          category: string;
          channelid: string | null;
          content: string;
          created_at: string;
          embedding: unknown | null;
          id: number;
          meta: Json | null;
          platform: number;
          updated_at: string;
          updated_by: string;
          userid: string | null;
          verified: boolean | null;
        }[];
      };
      hybrid_search3: {
        Args: {
          channel: string;
          search_word: string;
          match_count: number;
        };
        Returns: {
          category: string;
          channelid: string | null;
          content: string;
          created_at: string;
          embedding: unknown | null;
          id: number;
          meta: Json | null;
          platform: number;
          updated_at: string;
          updated_by: string;
          userid: string | null;
          verified: boolean | null;
        }[];
      };
      ivfflat_bit_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      l2_norm:
        | {
            Args: {
              "": unknown;
            };
            Returns: number;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: number;
          };
      l2_normalize:
        | {
            Args: {
              "": string;
            };
            Returns: string;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: unknown;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: unknown;
          };
      pgroonga_command:
        | {
            Args: {
              groongacommand: string;
            };
            Returns: string;
          }
        | {
            Args: {
              groongacommand: string;
              arguments: string[];
            };
            Returns: string;
          };
      pgroonga_command_escape_value: {
        Args: {
          value: string;
        };
        Returns: string;
      };
      pgroonga_equal_query_text_array: {
        Args: {
          targets: string[];
          query: string;
        };
        Returns: boolean;
      };
      pgroonga_equal_query_varchar_array: {
        Args: {
          targets: string[];
          query: string;
        };
        Returns: boolean;
      };
      pgroonga_equal_text: {
        Args: {
          target: string;
          other: string;
        };
        Returns: boolean;
      };
      pgroonga_equal_text_condition: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_equal_varchar: {
        Args: {
          target: string;
          other: string;
        };
        Returns: boolean;
      };
      pgroonga_equal_varchar_condition: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_escape:
        | {
            Args: {
              value: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              value: number;
            };
            Returns: string;
          }
        | {
            Args: {
              value: number;
            };
            Returns: string;
          }
        | {
            Args: {
              value: number;
            };
            Returns: string;
          }
        | {
            Args: {
              value: number;
            };
            Returns: string;
          }
        | {
            Args: {
              value: number;
            };
            Returns: string;
          }
        | {
            Args: {
              value: string;
            };
            Returns: string;
          }
        | {
            Args: {
              value: string;
            };
            Returns: string;
          }
        | {
            Args: {
              value: string;
            };
            Returns: string;
          }
        | {
            Args: {
              value: string;
              special_characters: string;
            };
            Returns: string;
          };
      pgroonga_flush: {
        Args: {
          indexname: unknown;
        };
        Returns: boolean;
      };
      pgroonga_handler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      pgroonga_highlight_html:
        | {
            Args: {
              target: string;
              keywords: string[];
            };
            Returns: string;
          }
        | {
            Args: {
              target: string;
              keywords: string[];
              indexname: unknown;
            };
            Returns: string;
          }
        | {
            Args: {
              targets: string[];
              keywords: string[];
            };
            Returns: string[];
          }
        | {
            Args: {
              targets: string[];
              keywords: string[];
              indexname: unknown;
            };
            Returns: string[];
          };
      pgroonga_index_column_name:
        | {
            Args: {
              indexname: unknown;
              columnindex: number;
            };
            Returns: string;
          }
        | {
            Args: {
              indexname: unknown;
              columnname: string;
            };
            Returns: string;
          };
      pgroonga_is_writable: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      pgroonga_match_positions_byte:
        | {
            Args: {
              target: string;
              keywords: string[];
            };
            Returns: number[];
          }
        | {
            Args: {
              target: string;
              keywords: string[];
              indexname: unknown;
            };
            Returns: number[];
          };
      pgroonga_match_positions_character:
        | {
            Args: {
              target: string;
              keywords: string[];
            };
            Returns: number[];
          }
        | {
            Args: {
              target: string;
              keywords: string[];
              indexname: unknown;
            };
            Returns: number[];
          };
      pgroonga_match_term:
        | {
            Args: {
              target: string[];
              term: string;
            };
            Returns: boolean;
          }
        | {
            Args: {
              target: string[];
              term: string;
            };
            Returns: boolean;
          }
        | {
            Args: {
              target: string;
              term: string;
            };
            Returns: boolean;
          }
        | {
            Args: {
              target: string;
              term: string;
            };
            Returns: boolean;
          };
      pgroonga_match_text_array_condition: {
        Args: {
          target: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_match_text_array_condition_with_scorers: {
        Args: {
          target: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_match_text_condition: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_match_text_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_match_varchar_condition: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_match_varchar_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_normalize:
        | {
            Args: {
              target: string;
            };
            Returns: string;
          }
        | {
            Args: {
              target: string;
              normalizername: string;
            };
            Returns: string;
          };
      pgroonga_prefix_varchar_condition: {
        Args: {
          target: string;
          conditoin: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_escape: {
        Args: {
          query: string;
        };
        Returns: string;
      };
      pgroonga_query_expand: {
        Args: {
          tablename: unknown;
          termcolumnname: string;
          synonymscolumnname: string;
          query: string;
        };
        Returns: string;
      };
      pgroonga_query_extract_keywords: {
        Args: {
          query: string;
          index_name?: string;
        };
        Returns: string[];
      };
      pgroonga_query_text_array_condition: {
        Args: {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_text_array_condition_with_scorers: {
        Args: {
          targets: string[];
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_query_text_condition: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_text_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_query_varchar_condition: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition"];
        };
        Returns: boolean;
      };
      pgroonga_query_varchar_condition_with_scorers: {
        Args: {
          target: string;
          condition: Database["public"]["CompositeTypes"]["pgroonga_full_text_search_condition_with_scorers"];
        };
        Returns: boolean;
      };
      pgroonga_result_to_jsonb_objects: {
        Args: {
          result: Json;
        };
        Returns: Json;
      };
      pgroonga_result_to_recordset: {
        Args: {
          result: Json;
        };
        Returns: Record<string, unknown>[];
      };
      pgroonga_score:
        | {
            Args: {
              row: Record<string, unknown>;
            };
            Returns: number;
          }
        | {
            Args: {
              tableoid: unknown;
              ctid: unknown;
            };
            Returns: number;
          };
      pgroonga_set_writable: {
        Args: {
          newwritable: boolean;
        };
        Returns: boolean;
      };
      pgroonga_snippet_html: {
        Args: {
          target: string;
          keywords: string[];
          width?: number;
        };
        Returns: string[];
      };
      pgroonga_table_name: {
        Args: {
          indexname: unknown;
        };
        Returns: string;
      };
      pgroonga_tokenize: {
        Args: {
          target: string;
        };
        Returns: Json[];
      };
      pgroonga_vacuum: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      pgroonga_wal_apply:
        | {
            Args: Record<PropertyKey, never>;
            Returns: number;
          }
        | {
            Args: {
              indexname: unknown;
            };
            Returns: number;
          };
      pgroonga_wal_set_applied_position:
        | {
            Args: Record<PropertyKey, never>;
            Returns: boolean;
          }
        | {
            Args: {
              block: number;
              offset: number;
            };
            Returns: boolean;
          }
        | {
            Args: {
              indexname: unknown;
            };
            Returns: boolean;
          }
        | {
            Args: {
              indexname: unknown;
              block: number;
              offset: number;
            };
            Returns: boolean;
          };
      pgroonga_wal_status: {
        Args: Record<PropertyKey, never>;
        Returns: {
          name: string;
          oid: unknown;
          current_block: number;
          current_offset: number;
          current_size: number;
          last_block: number;
          last_offset: number;
          last_size: number;
        }[];
      };
      pgroonga_wal_truncate:
        | {
            Args: Record<PropertyKey, never>;
            Returns: number;
          }
        | {
            Args: {
              indexname: unknown;
            };
            Returns: number;
          };
      sparsevec_out: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
      vector_avg: {
        Args: {
          "": number[];
        };
        Returns: string;
      };
      vector_dims:
        | {
            Args: {
              "": string;
            };
            Returns: number;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: number;
          };
      vector_norm: {
        Args: {
          "": string;
        };
        Returns: number;
      };
      vector_out: {
        Args: {
          "": string;
        };
        Returns: unknown;
      };
      vector_send: {
        Args: {
          "": string;
        };
        Returns: string;
      };
      vector_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      pgroonga_full_text_search_condition: {
        query: string | null;
        weigths: number[] | null;
        indexname: string | null;
      };
      pgroonga_full_text_search_condition_with_scorers: {
        query: string | null;
        weigths: number[] | null;
        scorers: string[] | null;
        indexname: string | null;
      };
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
