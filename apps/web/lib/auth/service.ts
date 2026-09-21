import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/infra/config/env";

type SupabaseAuthClient = Pick<SupabaseClient["auth"], "signInWithOtp" | "verifyOtp"> &
  Partial<
    Pick<
      SupabaseClient["auth"],
      "resetPasswordForEmail" | "setSession" | "updateUser"
    >
  >;

let cachedClient: SupabaseClient | null = null;
let testClient: SupabaseAuthClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}

function getAuthClient(): SupabaseAuthClient {
  return testClient ?? getSupabaseClient().auth;
}

export async function sendPhoneOtp(phone: string) {
  return getAuthClient().signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true,
    },
  });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  return getAuthClient().verifyOtp({
    phone,
    token,
    type: "sms",
  });
}

export async function sendPasswordResetEmail(email: string, redirectTo?: string) {
  const auth = getAuthClient();
  if (!auth.resetPasswordForEmail) {
    throw new Error("Supabase client missing resetPasswordForEmail");
  }

  return auth.resetPasswordForEmail(
    email,
    redirectTo ? { redirectTo } : undefined,
  );
}

export async function resetPasswordWithTokens(
  accessToken: string,
  refreshToken: string,
  password: string,
) {
  const auth = getAuthClient();
  if (!auth.setSession || !auth.updateUser) {
    return {
      data: null,
      error: { message: "Supabase client missing password APIs" },
    };
  }

  const { data: sessionData, error: sessionError } = await auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError || !sessionData.session) {
    return {
      data: null,
      error: sessionError ?? { message: "Invalid session" },
    };
  }

  const { data, error } = await auth.updateUser({ password });
  return { data, error };
}

export function setSupabaseAuthClientForTest(client: SupabaseAuthClient | null) {
  testClient = client;
}

