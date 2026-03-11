import { supabase } from "./client";
import type { Profile } from "@/types/supabase";

export interface OtpRequestResult {
  error: string | null;
}

export interface OtpVerifyResult {
  error: string | null;
  isAdmin: boolean;
}

export interface SessionProfile {
  profile: Profile | null;
  error: string | null;
}

/**
 * Request an email OTP code.
 * shouldCreateUser: false enforces admin allowlist — only existing auth.users receive the code.
 * Error messages are intentionally generic to avoid leaking allowlist membership.
 */
export async function requestOtp(email: string): Promise<OtpRequestResult> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) {
    return { error: "No se pudo enviar el código. Verifica el correo e intenta de nuevo." };
  }
  return { error: null };
}

/**
 * Verify the OTP token and authorize by checking public.profiles.
 * Signs out immediately if the user has no active admin profile.
 */
export async function verifyOtp(email: string, token: string): Promise<OtpVerifyResult> {
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (verifyError) {
    return { error: "Código inválido o expirado. Solicita uno nuevo.", isAdmin: false };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return { error: "No se pudo establecer la sesión. Intenta de nuevo.", isAdmin: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", sessionData.session.user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin" || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Acceso no autorizado.", isAdmin: false };
  }

  return { error: null, isAdmin: true };
}

/** Sign out the current Supabase session. */
export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Fetch the current session's admin profile from public.profiles.
 * Returns { profile: null, error: null } when there is no active session (not an error).
 */
export async function getAdminProfile(): Promise<SessionProfile> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { profile: null, error: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    return { profile: null, error: "No se pudo obtener el perfil de administrador." };
  }
  return { profile, error: null };
}
