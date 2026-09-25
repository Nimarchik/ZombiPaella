import { supabase } from "./supabase";

export const getProfile = async (userId) => {
  return await supabase
    .from("profiles")
    .select("id, nickname, avatar, created_at")
    .eq("id", userId)
    .single();
};