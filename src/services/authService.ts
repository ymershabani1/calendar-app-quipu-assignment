import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const USER_KEY = '@user';
const TOKEN_KEY = '@auth_token';

export const authService = {
  async signUp(email: string, password: string): Promise<{ user: User; token: string }> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const existingUsers = await this.getAllUsers();
    const userExists = existingUsers.find(u => u.email === email);
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    const user: User = {
      id: Date.now().toString(),
      email,
      password,
    };

    existingUsers.push(user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(existingUsers));

    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem('@current_user_id', user.id);

    return { user, token };
  },

  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem('@current_user_id', user.id);

    return { user, token };
  },

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('@current_user_id');
  },

  async getCurrentUser(): Promise<User | null> {
    const userId = await AsyncStorage.getItem('@current_user_id');
    if (!userId) return null;

    const users = await this.getAllUsers();
    return users.find(u => u.id === userId) || null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  async getAllUsers(): Promise<User[]> {
    const usersJson = await AsyncStorage.getItem(USER_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },
};