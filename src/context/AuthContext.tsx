// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  isAdmin: boolean;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  apartmentName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // LOGIN
  const login = async (email: string, password: string) => {
    const res = await axios.post("http://localhost:8000/login", { email, password });
    const fetchedUser = res.data.user;

    // Check admin status
    const adminCheck = await axios.get("http://localhost:8000/check-admin", {
      params: { email: fetchedUser.email },
    });

    const userData = {
      ...fetchedUser,
      isAdmin: adminCheck.data.is_admin,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    window.location.href = "http://localhost:5173/";
  };

  // SIGNUP
  const signup = async (data: SignupData) => {
    const res = await axios.post(
      "http://localhost:8000/signup",
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        apartmentName: data.apartmentName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check admin status
    const adminCheck = await axios.get("http://localhost:8000/check-admin", {
      params: { email: data.email },
    });

    const userData = {
      ...res.data.user,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: res.data.user.createdAt || new Date().toISOString(),
      isAdmin: adminCheck.data.is_admin,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    window.location.href = "http://localhost:5173/";
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "http://localhost:5173/auth";
  };

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
