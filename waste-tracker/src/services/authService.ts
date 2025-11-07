import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

class AuthService {
  private readonly USER_KEY = '@waste_tracker_user';

  async login(username: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email: `${username}@example.com`,
      points: 0,
      totalWasteLogged: 0,
    };
    
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      points: 0,
      totalWasteLogged: 0,
    };
    
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  async updateUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();
