import { supabase } from "./supabase";

export const register = async (nickname, email, password) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
    },
  });
};

export const login = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const logout = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    user,
    error,
  };
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};