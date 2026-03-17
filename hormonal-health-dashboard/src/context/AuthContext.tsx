import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type UserRole = 'patient' | 'doctor' | null;

interface UserProfile {
  name: string;
  id: string;
  role: UserRole;
}

interface AuthContextType {
  userRole: UserRole;
  userProfile: UserProfile | null;
  selectedPatientId: string | null;
  hasCompletedOnboarding: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  selectPatient: (id: string | null) => void;
  setCompletedOnboarding: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  });

  const setCompletedOnboarding = (value: boolean) => {
    setHasCompletedOnboarding(value);
    localStorage.setItem('hasCompletedOnboarding', value.toString());
  };

  const login = (role: UserRole) => {
    setUserRole(role);
    if (role === 'patient') {
      setUserProfile({ name: 'Pragya S.', id: 'DH-289', role: 'patient' });
    } else if (role === 'doctor') {
      setUserProfile({ name: 'Dr. Sarah Wilson', id: 'DOC-501', role: 'doctor' });
    }
  };

  const logout = () => {
    setUserRole(null);
    setUserProfile(null);
    setSelectedPatientId(null);
  };

  const selectPatient = (id: string | null) => {
    setSelectedPatientId(id);
  };

  return (
    <AuthContext.Provider value={{ 
      userRole, 
      userProfile, 
      selectedPatientId, 
      hasCompletedOnboarding,
      login, 
      logout, 
      selectPatient,
      setCompletedOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
