import React, { createContext, useContext, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSessionCheck } from '@/hooks/useSessionCheck';

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
  
  // Enable session check to prevent multiple devices from using same account
  useSessionCheck(profileData.profile?.user_id);

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