import { supabase } from "./supabase";

export const getCardImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  const { data } = supabase.storage
    .from("cards")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};