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

  const contextValue = React.useMemo(() => ({
    ...profileData,
    refreshProfile: profileData.reloadProfile,
  }), [profileData]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};