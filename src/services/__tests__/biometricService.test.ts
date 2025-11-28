import ReactNativeBiometrics from 'react-native-biometrics';
import { biometricService } from '../biometricService';
import { authService } from '../authService';

jest.mock('react-native-biometrics', () => {
  const mockInstance = {
    isSensorAvailable: jest.fn(),
    simplePrompt: jest.fn(),
  };
  return jest.fn().mockImplementation(() => mockInstance);
});

jest.mock('../authService', () => ({
  authService: {
    enableBiometric: jest.fn(),
  },
}));

describe('biometricService', () => {
  let mockBiometrics: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBiometrics = new ReactNativeBiometrics();
  });

  describe('isAvailable', () => {
    it('should return true when sensor is available', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockResolvedValue({ available: true });

      const result = await biometricService.isAvailable();

      expect(result).toBe(true);
    });

    it('should return false when sensor is not available', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockResolvedValue({ available: false });

      const result = await biometricService.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await biometricService.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('should return true on successful authentication', async () => {
      (mockBiometrics.simplePrompt as jest.Mock).mockResolvedValue({ success: true });

      const result = await biometricService.authenticate();

      expect(result).toBe(true);
      expect(mockBiometrics.simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Confirm biometric authentication',
      });
    });

    it('should return false on failed authentication', async () => {
      (mockBiometrics.simplePrompt as jest.Mock).mockResolvedValue({ success: false });

      const result = await biometricService.authenticate();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (mockBiometrics.simplePrompt as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await biometricService.authenticate();

      expect(result).toBe(false);
    });
  });

  describe('setupBiometric', () => {
    it('should enable biometric when sensor is available and prompt succeeds', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockResolvedValue({ available: true });
      (mockBiometrics.simplePrompt as jest.Mock).mockResolvedValue({ success: true });
      (authService.enableBiometric as jest.Mock).mockResolvedValue(undefined);

      const result = await biometricService.setupBiometric();

      expect(result).toBe(true);
      expect(authService.enableBiometric).toHaveBeenCalled();
    });

    it('should return false when sensor is not available', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockResolvedValue({ available: false });

      const result = await biometricService.setupBiometric();

      expect(result).toBe(false);
      expect(authService.enableBiometric).not.toHaveBeenCalled();
    });

    it('should return false when prompt fails', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockResolvedValue({ available: true });
      (mockBiometrics.simplePrompt as jest.Mock).mockResolvedValue({ success: false });

      const result = await biometricService.setupBiometric();

      expect(result).toBe(false);
      expect(authService.enableBiometric).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      (mockBiometrics.isSensorAvailable as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await biometricService.setupBiometric();

      expect(result).toBe(false);
    });
  });
});