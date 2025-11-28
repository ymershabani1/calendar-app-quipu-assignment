import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventService } from '../eventService';
import { Event } from '../../types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('eventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    date: '2024-01-01',
    startTime: '10:00',
    endTime: '11:00',
    userId: 'user1',
  };

  describe('createEvent', () => {
    it('should create a new event', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await eventService.createEvent({
        title: mockEvent.title,
        description: mockEvent.description,
        date: mockEvent.date,
        startTime: mockEvent.startTime,
        endTime: mockEvent.endTime,
        userId: mockEvent.userId,
      });

      expect(result.title).toBe(mockEvent.title);
      expect(result.id).toBeDefined();
      expect(result.description).toBe(mockEvent.description);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should generate unique id for each event', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const event1 = await eventService.createEvent({
        title: 'Event 1',
        description: '',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        userId: 'user1',
      });

      const event2 = await eventService.createEvent({
        title: 'Event 2',
        description: '',
        date: '2024-01-01',
        startTime: '12:00',
        endTime: '13:00',
        userId: 'user1',
      });

      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('getAllEvents', () => {
    it('should return events for a specific user', async () => {
      const events = [
        mockEvent,
        { ...mockEvent, id: '2', userId: 'user2' },
        { ...mockEvent, id: '3', userId: 'user1' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));

      const result = await eventService.getAllEvents('user1');

      expect(result).toHaveLength(2);
      expect(result.every(e => e.userId === 'user1')).toBe(true);
    });

    it('should return empty array if no events exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await eventService.getAllEvents('user1');

      expect(result).toEqual([]);
    });

    it('should return empty array if user has no events', async () => {
      const events = [{ ...mockEvent, id: '2', userId: 'user2' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));

      const result = await eventService.getAllEvents('user1');

      expect(result).toEqual([]);
    });
  });

  describe('getEventsByDate', () => {
    it('should return events for a specific date', async () => {
      const events = [
        mockEvent,
        { ...mockEvent, id: '2', date: '2024-01-02' },
        { ...mockEvent, id: '3', date: '2024-01-01', userId: 'user1' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));

      const result = await eventService.getEventsByDate('user1', '2024-01-01');

      expect(result).toHaveLength(2);
      expect(result.every(e => e.date === '2024-01-01')).toBe(true);
    });

    it('should return empty array if no events for date', async () => {
      const events = [{ ...mockEvent, id: '2', date: '2024-01-02' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));

      const result = await eventService.getEventsByDate('user1', '2024-01-01');

      expect(result).toEqual([]);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const events = [mockEvent];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await eventService.updateEvent('1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
      expect(result.id).toBe('1');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should update multiple fields', async () => {
      const events = [mockEvent];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await eventService.updateEvent('1', {
        title: 'New Title',
        description: 'New Description',
        startTime: '14:00',
      });

      expect(result.title).toBe('New Title');
      expect(result.description).toBe('New Description');
      expect(result.startTime).toBe('14:00');
    });

    it('should throw error if event not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await expect(eventService.updateEvent('999', { title: 'Updated' })).rejects.toThrow(
        'Event not found',
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const events = [mockEvent, { ...mockEvent, id: '2' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await eventService.deleteEvent('1');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedEvents = JSON.parse(callArgs[1]);
      expect(savedEvents).toHaveLength(1);
      expect(savedEvents[0].id).toBe('2');
    });

    it('should handle deleting non-existent event', async () => {
      const events = [mockEvent];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await eventService.deleteEvent('999');

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedEvents = JSON.parse(callArgs[1]);
      expect(savedEvents).toHaveLength(1);
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      const events = [mockEvent, { ...mockEvent, id: '2' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));

      const result = await eventService.getEventById('1');

      expect(result).toEqual(mockEvent);
    });

    it('should return null if event not found', async () => {
      const events = [mockEvent];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));

      const result = await eventService.getEventById('999');

      expect(result).toBeNull();
    });

    it('should return null if no events exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await eventService.getEventById('1');

      expect(result).toBeNull();
    });
  });
});