import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  AuthResponse,
} from '../services/auth/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<AuthResponse>;
  signUp: (email: string, pass: string, displayName?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Fetch current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string): Promise<AuthResponse> => {
    setIsLoading(true);
    const res = await signInWithEmail(email, pass);
    if (res.user) {
      setUser(res.user);
      setSession(res.session);
    }
    setIsLoading(false);
    return res;
  };

  const signUp = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    const res = await signUpWithEmail(email, pass, displayName);
    if (res.user) {
      setUser(res.user);
      setSession(res.session);
    }
    setIsLoading(false);
    return res;
  };

  const signOut = async () => {
    setIsLoading(true);
    await signOutUser();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
