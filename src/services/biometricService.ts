import ReactNativeBiometrics from 'react-native-biometrics';
import { authService } from './authService';

const rnBiometrics = new ReactNativeBiometrics();

export const biometricService = {
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch {
      return false;
    }
  },

  async authenticate(): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm biometric authentication',
      });
      return success;
    } catch {
      return false;
    }
  },

  async setupBiometric(): Promise<boolean> {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        return false;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Enable biometric authentication',
      });

      if (success) {
        await authService.enableBiometric();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};