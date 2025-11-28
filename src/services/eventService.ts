import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../types';

const EVENTS_KEY = '@events';

export const eventService = {
  async getAllEvents(userId: string): Promise<Event[]> {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const allEvents: Event[] = eventsJson ? JSON.parse(eventsJson) : [];
    return allEvents.filter(e => e.userId === userId);
  },

  async getEventsByDate(userId: string, date: string): Promise<Event[]> {
    const events = await this.getAllEvents(userId);
    return events.filter(e => e.date === date);
  },

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: Event[] = eventsJson ? JSON.parse(eventsJson) : [];

    const newEvent: Event = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    events.push(newEvent);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    return newEvent;
  },

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: Event[] = eventsJson ? JSON.parse(eventsJson) : [];

    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) {
      throw new Error('Event not found');
    }

    events[index] = { ...events[index], ...updates };
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    return events[index];
  },

  async deleteEvent(eventId: string): Promise<void> {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: Event[] = eventsJson ? JSON.parse(eventsJson) : [];

    const filtered = events.filter(e => e.id !== eventId);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  },

  async getEventById(eventId: string): Promise<Event | null> {
    const eventsJson = await AsyncStorage.getItem(EVENTS_KEY);
    const events: Event[] = eventsJson ? JSON.parse(eventsJson) : [];
    return events.find(e => e.id === eventId) || null;
  },
};