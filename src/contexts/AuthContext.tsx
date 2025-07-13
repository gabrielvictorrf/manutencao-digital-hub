import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'operador' | 'visualizador';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  canEdit: boolean;
  canAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários iniciais (simulando banco de dados)
const initialUsers: User[] = [
  {
    id: '1',
    email: 'gabrielferreira',
    name: 'Gabriel Ferreira',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString(),
  }
];

// Senhas simuladas (em produção, usar hash)
const userPasswords: Record<string, string> = {
  '1': 'admin123', // Senha padrão para gabrielferreira
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { userId } = JSON.parse(authData);
      const foundUser = users.find(u => u.id === userId);
      if (foundUser && foundUser.active) {
        setUser(foundUser);
      } else {
        localStorage.removeItem('authData');
      }
    }
  }, [users]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => u.email === email && u.active);
    if (foundUser && userPasswords[foundUser.id] === password) {
      setUser(foundUser);
      localStorage.setItem('authData', JSON.stringify({ userId: foundUser.id }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authData');
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    if (user?.role !== 'admin') return false;
    
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) return false;

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      active: userData.active,
      createdAt: new Date().toISOString(),
    };

    userPasswords[newUser.id] = userData.password;
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    if (user?.role !== 'admin') return false;
    
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, ...userData } : u
    ));
    return true;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    if (user?.role !== 'admin' || id === '1') return false; // Não pode deletar o admin principal
    
    setUsers(prev => prev.filter(u => u.id !== id));
    delete userPasswords[id];
    return true;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user || userPasswords[user.id] !== currentPassword) return false;
    
    userPasswords[user.id] = newPassword;
    return true;
  };

  const canEdit = user?.role === 'admin' || user?.role === 'operador';
  const canAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      createUser,
      updateUser,
      deleteUser,
      changePassword,
      canEdit,
      canAdmin,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}