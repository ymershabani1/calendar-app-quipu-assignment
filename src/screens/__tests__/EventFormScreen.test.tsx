import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import EventFormScreen from '../EventFormScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'user1', email: 'test@example.com' }),
  },
}));

jest.mock('../../services/eventService', () => ({
  eventService: {
    getEventById: jest.fn().mockResolvedValue(null),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
  },
}));

describe('EventFormScreen', () => {
  it('renders correctly for new event', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<EventFormScreen />);
    });
    expect(tree).toBeTruthy();
  });
});