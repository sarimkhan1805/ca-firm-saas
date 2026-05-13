/**
 * AuthContext - global auth state.
 * Stores current user + their profile (role) and exposes login/logout.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase auth user
  const [profile, setProfile] = useState(null); // Our profiles table row (has role)
  const [loading, setLoading] = useState(true);

  // On mount, check if a session exists
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    };
    init();

    // Subscribe to auth changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch profile row to get role
  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  // Login helper
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Logout helper
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
