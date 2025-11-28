import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import CalendarScreen from '../CalendarScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'user1', email: 'test@example.com' }),
  },
}));

jest.mock('../../services/eventService', () => ({
  eventService: {
    getAllEvents: jest.fn().mockResolvedValue([]),
  },
}));

describe('CalendarScreen', () => {
  it('renders correctly', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<CalendarScreen />);
    });
    expect(tree).toBeTruthy();
  });
});