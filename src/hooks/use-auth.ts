import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

export interface AuthUser {
  role: string;
  hasProfile: boolean;
  isTemporaryPassword: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carregar dados do usuário de forma mais eficiente
  const loadUserData = useCallback(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }

    const role = localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE);
    const hasProfile =
      localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_PROFILE) === 'true';
    const isTemporaryPassword =
      localStorage.getItem(LOCAL_STORAGE_KEYS.IS_TEMPORARY_PASSWORD) === 'true';

    if (role) {
      setUser({
        role,
        hasProfile,
        isTemporaryPassword,
      });
    }

    setLoading(false);
    return true;
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const logout = useCallback(() => {
    Object.values(LOCAL_STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(key)
    );
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  // Adicionar método para verificar autenticação
  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  }, []);

  // Adicionar método para atualizar dados do usuário
  const updateUserData = useCallback((userData: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));

    if (userData.hasProfile !== undefined) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.HAS_PROFILE,
        String(userData.hasProfile)
      );
    }

    if (userData.isTemporaryPassword !== undefined) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.IS_TEMPORARY_PASSWORD,
        String(userData.isTemporaryPassword)
      );
    }
  }, []);

  return {
    user,
    loading,
    logout,
    isAuthenticated,
    updateUserData,
    refreshUserData: loadUserData,
  };
}
