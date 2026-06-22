import type {
  BillingCycle,
  LastUsedValue,
  PlanTier,
  SubscriptionCategory,
} from "@/config/app";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Hand-written to mirror the SQL migration in `supabase/migrations`. If you
 * change the schema, regenerate with:
 *   supabase gen types typescript --linked > src/types/database.ts
 * (and re-apply the `@/config/app` enum imports below).
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          plan_tier: PlanTier;
          stripe_customer_id: string | null;
          onboarded: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          plan_tier?: PlanTier;
          stripe_customer_id?: string | null;
          onboarded?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          plan_tier?: PlanTier;
          stripe_customer_id?: string | null;
          onboarded?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: SubscriptionCategory;
          cost_cents: number;
          billing_cycle: BillingCycle;
          renewal_date: string | null;
          last_used: LastUsedValue;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: SubscriptionCategory;
          cost_cents: number;
          billing_cycle: BillingCycle;
          renewal_date?: string | null;
          last_used?: LastUsedValue;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: SubscriptionCategory;
          cost_cents?: number;
          billing_cycle?: BillingCycle;
          renewal_date?: string | null;
          last_used?: LastUsedValue;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          generated_at: string;
          payload: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_at?: string;
          payload: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_at?: string;
          payload?: Json;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

/** Convenience row aliases used across the app. */
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type SubscriptionRow =
  Database["public"]["Tables"]["subscriptions"]["Row"];
export type InsightRow = Database["public"]["Tables"]["insights"]["Row"];
