import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../authService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.signUp('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBeDefined();
      expect(result.token).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      await expect(authService.signUp('invalid-email', 'password123')).rejects.toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for email without domain', async () => {
      await expect(authService.signUp('test@', 'password123')).rejects.toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for short password', async () => {
      await expect(authService.signUp('test@example.com', '123')).rejects.toThrow(
        'Password must be at least 6 characters',
      );
    });

    it('should throw error for empty password', async () => {
      await expect(authService.signUp('test@example.com', '')).rejects.toThrow(
        'Password must be at least 6 characters',
      );
    });

    it('should throw error if user already exists', async () => {
      const existingUsers = [
        { id: '1', email: 'test@example.com', password: 'password123' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingUsers));

      await expect(authService.signUp('test@example.com', 'password123')).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should save user and token to storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await authService.signUp('newuser@example.com', 'password123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@user', expect.any(String));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', expect.any(String));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@current_user_id', expect.any(String));
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const users = [{ id: '1', email: 'test@example.com', password: 'password123' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(users));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@auth_token', expect.any(String));
    });

    it('should throw error for invalid email', async () => {
      const users = [{ id: '1', email: 'test@example.com', password: 'password123' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(users));

      await expect(authService.signIn('wrong@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw error for invalid password', async () => {
      const users = [{ id: '1', email: 'test@example.com', password: 'password123' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(users));

      await expect(authService.signIn('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw error when no users exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await expect(authService.signIn('test@example.com', 'password123')).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });

  describe('signOut', () => {
    it('should remove token and user id from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await authService.signOut();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@auth_token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@current_user_id');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when logged in', async () => {
      const users = [{ id: '1', email: 'test@example.com', password: 'password123' }];
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('1')
        .mockResolvedValueOnce(JSON.stringify(users));

      const user = await authService.getCurrentUser();

      expect(user).toEqual(users[0]);
    });

    it('should return null when not logged in', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when user id not found in users list', async () => {
      const users = [{ id: '1', email: 'test@example.com', password: 'password123' }];
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('999')
        .mockResolvedValueOnce(JSON.stringify(users));

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some-token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false if token is empty string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('biometric methods', () => {
    it('should enable biometric authentication', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await authService.enableBiometric();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@biometric_enabled', 'true');
    });

    it('should disable biometric authentication', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await authService.disableBiometric();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@biometric_enabled');
    });

    it('should return true when biometric is enabled', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await authService.isBiometricEnabled();

      expect(result).toBe(true);
    });

    it('should return false when biometric is not enabled', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authService.isBiometricEnabled();

      expect(result).toBe(false);
    });
  });
});