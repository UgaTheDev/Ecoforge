import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

// --- TYPES ---
type User = { id: string; username: string; email?: string; token: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// --- CONSTANTS & MOCK SERVICE ---
const TOKEN_KEY = "userToken";
const MOCK_STORAGE = AsyncStorage;

// NOTE FOR ANDROID EMULATORS:
// If you are using an Android Emulator, 'localhost' points to the emulator itself.
// You MUST change this to 'http://10.0.2.2:5000' for the emulator to reach your computer's server.

// --- AUTH SERVICE (Handles API Calls) ---
const authService = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ msg: "Login failed" }));
      throw new Error(errorData.msg || "Login failed due to server error.");
    }

    const data = await response.json();

    const user: User = {
      id: String(data.user_id),
      username: username,
      email: `${username}@recycle.app`,
      token: data.access_token,
    };

    await MOCK_STORAGE.setItem(TOKEN_KEY, data.access_token);
    return user;
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    // NOTE: Python backend only uses username and password (ignores email)
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), // ← Only send username and password
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ msg: "Registration failed" }));
      throw new Error(
        errorData.msg || "Registration failed due to server error."
      );
    }

    // Registration successful - no return needed
  },

  logout: async (): Promise<void> => {
    await MOCK_STORAGE.removeItem(TOKEN_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = await MOCK_STORAGE.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    return {
      id: "placeholder_id",
      username: "Authenticated User",
      token: token,
    };
  },
};

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT (Handles State) ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const loadedUser = await authService.getCurrentUser();
        setUser(loadedUser);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    // Registration does not automatically log the user in
    await authService.register(username, email, password);
    // User must manually log in after registration
  };

  const handleLogout = async () => {
    setLoading(true);
    await authService.logout();
    setUser(null);
    setLoading(false);
  };

  const contextValue = {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// --- HOOK TO CONSUME CONTEXT ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
