import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CalendarView, Event } from '../types';
import Calendar from '../components/Calendar';
import { authService } from '../services/authService';
import { eventService } from '../services/eventService';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserAndEvents();
  }, []);

  const loadEvents = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const allEvents = await eventService.getAllEvents(userId);
      setEvents(allEvents);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadEvents();
    }
  }, [selectedDate, userId, loadEvents]);

  const loadUserAndEvents = async () => {
    const user = await authService.getCurrentUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventForm', { eventId: event.id });
  };

  const handleAddEvent = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    navigation.navigate('EventForm', { date: dateStr });
  };

  const getSelectedDateEvents = (): Event[] => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateEvents = getSelectedDateEvents();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, view === 'day' && styles.toggleButtonActive]}
            onPress={() => setView('day')}>
            <Text
              style={[styles.toggleText, view === 'day' && styles.toggleTextActive]}>
              Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, view === 'month' && styles.toggleButtonActive]}
            onPress={() => setView('month')}>
            <Text
              style={[styles.toggleText, view === 'month' && styles.toggleTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          view={view}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
          onEventPress={handleEventPress}
        />
      </View>

      {view === 'month' && (
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsTitle}>
              Events ({selectedDateEvents.length})
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>+ Add Event</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedDateEvents}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventItem}
                onPress={() => handleEventPress(item)}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventTimeText}>
                    {item.startTime} - {item.endTime}
                  </Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No events for this date</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadEvents} />
            }
          />
        </View>
      )}

      {view === 'day' && (
        <TouchableOpacity style={styles.fab} onPress={handleAddEvent}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
  },
  eventsSection: {
    maxHeight: 250,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  eventTime: {
    width: 80,
  },
  eventTimeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});