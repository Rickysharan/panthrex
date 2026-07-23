import "server-only";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  location: string | null;
  phone: string | null;
  plan: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  username: string | null;
  country: string | null;
  city: string | null;
  subscription_plan: string;
  subscription_status: string;
  stripe_trial_used: boolean;
  premium_until: string | null;
  ai_credits: number;
  referral_code: string | null;
  referred_by: string | null;
  resumes_created: number;
  cover_letters_created: number;
  ats_scans: number;
  interview_sessions: number;
  last_login: string | null;
};

type ProfileInsert = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  location?: string | null;
  phone?: string | null;
  plan?: string | null;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  username?: string | null;
  country?: string | null;
  city?: string | null;
  subscription_plan?: string;
  subscription_status?: string;
  stripe_trial_used?: boolean;
  premium_until?: string | null;
  ai_credits?: number;
  referral_code?: string | null;
  referred_by?: string | null;
  resumes_created?: number;
  cover_letters_created?: number;
  ats_scans?: number;
  interview_sessions?: number;
  last_login?: string | null;
};

type ProfileUpdate = Partial<Omit<ProfileInsert, "id">>;

type CustomerRow = {
  user_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
};

type CustomerInsert = {
  user_id: string;
  stripe_customer_id: string;
  created_at?: string;
  updated_at?: string;
};

type CustomerUpdate = Partial<CustomerInsert>;

type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string | null;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
};

type SubscriptionInsert = {
  id?: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id?: string | null;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SubscriptionUpdate = Partial<SubscriptionInsert>;

type ResumeRow = {
  id: string;
  user_id: string;
  title: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  education: Json | null;
  experience: Json | null;
  skills: Json | null;
  projects: Json | null;
  certifications: Json | null;
  created_at: string;
  updated_at: string;
  template: string | null;
  job_title: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  is_default: boolean;
};

type ResumeInsert = {
  id?: string;
  user_id: string;
  title?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  education?: Json | null;
  experience?: Json | null;
  skills?: Json | null;
  projects?: Json | null;
  certifications?: Json | null;
  created_at?: string;
  updated_at?: string;
  template?: string | null;
  job_title?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  is_default?: boolean;
};

type ResumeUpdate = Partial<ResumeInsert>;

type ApiUsageRow = {
  id: string;
  user_id: string;
  endpoint: string;
  tokens: number;
  created_at: string;
};

type ApiUsageInsert = {
  id?: string;
  user_id: string;
  endpoint: string;
  tokens?: number;
  created_at?: string;
};

type ApiUsageUpdate = Partial<ApiUsageInsert>;

type DayPassRow = {
  id: string;
  user_id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid: number;
  currency: string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type DayPassInsert = {
  id?: string;
  user_id: string;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  amount_paid?: number;
  currency?: string;
  status?: string;
  starts_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type DayPassUpdate = Partial<DayPassInsert>;


type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  href: string | null;
  metadata: Json;
  read_at: string | null;
  created_at: string;
};

type NotificationInsert = {
  id?: string;
  user_id: string;
  type?: string;
  title: string;
  description: string;
  href?: string | null;
  metadata?: Json;
  read_at?: string | null;
  created_at?: string;
};

type NotificationUpdate = Partial<
  Omit<NotificationInsert, "id" | "user_id">
>;

type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
        Relationships: [];
      };
      day_passes: {
        Row: DayPassRow;
        Insert: DayPassInsert;
        Update: DayPassUpdate;
        Relationships: [];
      };
      resumes: {
        Row: ResumeRow;
        Insert: ResumeInsert;
        Update: ResumeUpdate;
        Relationships: [];
      };
      api_usage: {
        Row: ApiUsageRow;
        Insert: ApiUsageInsert;
        Update: ApiUsageUpdate;
        Relationships: [];
      };

      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let adminClient: SupabaseClient<Database> | null = null;

export function createAdminClient(): SupabaseClient<Database> {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  adminClient = createClient<Database>(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}
