export interface User {
  email: string;
  password: string;
  id: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
}

export type CalendarView = 'day' | 'month';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  EventForm: { eventId?: string; date?: string };
};

export type MainTabParamList = {
  Calendar: undefined;
  Profile: undefined;
};