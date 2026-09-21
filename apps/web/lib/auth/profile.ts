import { createClient } from "@supabase/supabase-js";
import { env } from "@/infra/config/env";

type CustomerProfileRow = {
  user_id: string;
  first_name: string;
  phone: string;
  date_of_birth: string; // YYYY-MM-DD
};

type ProfileWriteResult = {
  data: CustomerProfileRow | null;
  error: { message: string } | null;
};

export type ProfileWriter = (
  accessToken: string,
  record: CustomerProfileRow,
) => Promise<ProfileWriteResult>;

let writerForTest: ProfileWriter | null = null;

function createProfileWriter(): ProfileWriter {
  return async (accessToken, record) => {
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await client
      .from("customer_profiles")
      .upsert(record, { onConflict: "user_id" })
      .select()
      .single();

    return {
      data: (data as CustomerProfileRow | null) ?? null,
      error: error ? { message: error.message } : null,
    };
  };
}

export async function writeCustomerProfile(accessToken: string, record: CustomerProfileRow) {
  const writer = writerForTest ?? createProfileWriter();
  return writer(accessToken, record);
}

export function setProfileWriterForTest(writer: ProfileWriter | null) {
  writerForTest = writer;
}

