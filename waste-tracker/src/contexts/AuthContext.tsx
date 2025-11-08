import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// --- MOCK/PLACEHOLDER TYPES & SERVICE (Replace with actual imports/logic) ---
type User = {
  id: string;
  username: string;
  email: string;
  token: string;
};

// Simple storage simulation (should be AsyncStorage in React Native)
const TOKEN_KEY = "user_auth_token";
const MOCK_STORAGE = {
  getItem: async (key: string): Promise<string | null> =>
    localStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> =>
    localStorage.setItem(key, value),
  removeItem: async (key: string): Promise<void> =>
    localStorage.removeItem(key),
};

// Simplified Auth Service to show JWT interaction
const authService = {
  // Simulates an API call that returns a user object including a JWT/token
  login: async (username: string, password: string): Promise<User> => {
    // In a real app, this would be a fetch call to your backend
    console.log(`Mock API: Logging in ${username}`);
    const mockToken = `jwt.${btoa(username)}.${Date.now()}`;
    await MOCK_STORAGE.setItem(TOKEN_KEY, mockToken);
    return {
      id: "user_" + username,
      username,
      email: `${username}@example.com`,
      token: mockToken,
    };
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<User> => {
    // In a real app, this would be a fetch call to your backend
    console.log(`Mock API: Registering ${username}`);
    const mockToken = `jwt.${btoa(username)}.${Date.now()}`;
    await MOCK_STORAGE.setItem(TOKEN_KEY, mockToken);
    return { id: "user_" + username, username, email, token: mockToken };
  },

  logout: async (): Promise<void> => {
    await MOCK_STORAGE.removeItem(TOKEN_KEY);
    console.log("Mock API: Token removed.");
  },

  // Attempts to retrieve user data based on a stored token
  getCurrentUser: async (): Promise<User | null> => {
    const token = await MOCK_STORAGE.getItem(TOKEN_KEY);
    if (!token) return null;

    // In a real app, this token would be used to fetch the user's profile from the backend
    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid token format");
      const username = atob(parts[1]);

      return {
        id: "user_" + username,
        username,
        email: `${username}@example.com`,
        token,
      };
    } catch (e) {
      console.error("Error decoding token:", e);
      await MOCK_STORAGE.removeItem(TOKEN_KEY); // Clear invalid token
      return null;
    }
  },
};
// --- END MOCK ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Checks for existing token on mount
  useEffect(() => {
    loadUserFromToken();
  }, []);

  const loadUserFromToken = async () => {
    try {
      // getCurrentUser relies on the token stored in MOCK_STORAGE
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log("Error loading user from token", error);
      // Ensure token is cleared if fetching user fails
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const loggedInUser = await authService.login(username, password);
    // Token is saved inside authService.login
    setUser(loggedInUser);
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const newUser = await authService.register(username, email, password);
    // Token is saved inside authService.register
    setUser(newUser);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      // Note: Updating user requires refreshing the token in a real scenario
      // or at least updating the user object in the backend.
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout: () => {
          logout();
        },
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
