import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  fullName: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const accessToken = await AsyncStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (userData: User, accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
