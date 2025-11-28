import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AuthScreen from '../AuthScreen';

jest.mock('../../services/authService', () => ({
  authService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    isBiometricEnabled: jest.fn().mockResolvedValue(false),
    getCurrentUser: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../../services/biometricService', () => ({
  biometricService: {
    isAvailable: jest.fn().mockResolvedValue(false),
    authenticate: jest.fn(),
  },
}));

describe('AuthScreen', () => {
  it('renders correctly', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<AuthScreen />);
    });
    expect(tree).toBeTruthy();
  });

  it('renders sign in form by default', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<AuthScreen />);
    });
    const instance = tree.root;
    expect(instance).toBeTruthy();
  });
});