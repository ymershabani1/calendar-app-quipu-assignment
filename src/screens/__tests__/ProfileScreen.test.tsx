import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ProfileScreen from '../ProfileScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'user1', email: 'test@example.com' }),
    isBiometricEnabled: jest.fn().mockResolvedValue(false),
    disableBiometric: jest.fn(),
  },
}));

jest.mock('../../services/biometricService', () => ({
  biometricService: {
    isAvailable: jest.fn().mockResolvedValue(false),
    setupBiometric: jest.fn(),
  },
}));

describe('ProfileScreen', () => {
  it('renders correctly', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ProfileScreen />);
    });
    expect(tree).toBeTruthy();
  });
});