// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await axios.post("http://localhost:8000/login", { email, password });
    const fetchedUser = res.data.user;

    // 🔍 Check admin status
    const adminCheck = await axios.get("http://localhost:8000/check-admin", {
      params: { email: fetchedUser.email },
    });

    setUser({ ...fetchedUser, isAdmin: adminCheck.data.is_admin });
  };

  const signup = async (email: string, password: string, name: string) => {
  console.log("Sending signup data:", { email, password, name });

  const res = await axios.post(
    "http://localhost:8000/signup",
    { email, password, name },
    {
      headers: {
        "Content-Type": "application/json", // ✅ make it explicit
      },
    }
  );

  const adminCheck = await axios.get("http://localhost:8000/check-admin", {
    params: { email },
  });

  setUser({ ...res.data.user, name, isAdmin: adminCheck.data.is_admin });
};

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
