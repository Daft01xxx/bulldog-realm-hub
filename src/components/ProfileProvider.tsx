import React, { createContext, useContext, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';

interface ProfileContextType {
  profile: any;
  loading: boolean;
  updateProfile: (updates: any) => Promise<void>;
  reloadProfile: () => Promise<void>;
  fetchWalletBalance: (address: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const profileData = useProfile();
  
  console.log('ProfileProvider render - profile:', !!profileData.profile, 'loading:', profileData.loading);

  const contextValue = {
    ...profileData,
    refreshProfile: profileData.reloadProfile, // Add alias for backwards compatibility
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  console.log('useProfileContext called - context:', !!context, 'profile:', !!context?.profile, 'loading:', context?.loading);
  
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};