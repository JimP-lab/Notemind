import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreditsContextType {
  credits: number;
  isUnlimited: boolean;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  useCredit: () => Promise<boolean>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isPremium } = useAuth();
  const [credits, setCredits] = useState(3);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCredits = async () => {
    if (!user || !session) {
      setCredits(3);
      setIsUnlimited(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-user-credits', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      if (data) {
        setCredits(data.credits_remaining || 0);
        setIsUnlimited(data.is_unlimited || isPremium);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const useCredit = async (): Promise<boolean> => {
    if (!user || !session) {
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('use-credit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error using credit:', error);
        return false;
      }

      if (data?.success) {
        setCredits(data.credits_remaining || 0);
        setIsUnlimited(data.is_unlimited || false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error using credit:', error);
      return false;
    }
  };

  // Refresh credits when user changes or when component mounts
  useEffect(() => {
    if (user) {
      refreshCredits();
    } else {
      setCredits(3);
      setIsUnlimited(false);
    }
  }, [user, session]);

  // Update unlimited status based on premium status
  useEffect(() => {
    if (isPremium && !isUnlimited) {
      setIsUnlimited(true);
      setCredits(999999);
    }
  }, [isPremium]);

  const value = {
    credits: isUnlimited ? 999999 : credits,
    isUnlimited,
    loading,
    refreshCredits,
    useCredit,
  };

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
};