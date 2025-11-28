import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';

type EventFormScreenRouteProp = RouteProp<RootStackParamList, 'EventForm'>;
type EventFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EventFormScreen() {
  const navigation = useNavigation<EventFormScreenNavigationProp>();
  const route = useRoute<EventFormScreenRouteProp>();
  const { eventId, date } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadEvent = React.useCallback(async () => {
    if (!eventId) return;
    try {
      const event = await eventService.getEventById(eventId);
      if (event) {
        setTitle(event.title);
        setDescription(event.description);
        setEventDate(event.date);
        setStartTime(event.startTime);
        setEndTime(event.endTime);
      }
    } catch {
      Alert.alert('Error', 'Failed to load event');
    }
  }, [eventId]);

  useEffect(() => {
    loadUser();
    if (eventId) {
      loadEvent();
    }
  }, [eventId, loadEvent]);

  const loadUser = async () => {
    const user = await authService.getCurrentUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const validateTime = (start: string, end: string): boolean => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    return endTotal > startTotal;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!validateTime(startTime, endTime)) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      if (eventId) {
        await eventService.updateEvent(eventId, {
          title: title.trim(),
          description: description.trim(),
          date: eventDate,
          startTime,
          endTime,
        });
        Alert.alert('Success', 'Event updated successfully');
      } else {
        await eventService.createEvent({
          title: title.trim(),
          description: description.trim(),
          date: eventDate,
          startTime,
          endTime,
          userId,
        });
        Alert.alert('Success', 'Event created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!eventId) return;

    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventService.deleteEvent(eventId);
            Alert.alert('Success', 'Event deleted successfully');
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete event');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {eventId ? 'Edit Event' : 'New Event'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#8E8E93"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Event description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#8E8E93"
            textAlignVertical="top"
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={eventDate}
            onChangeText={setEventDate}
            placeholderTextColor="#8E8E93"
          />

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={startTime}
                onChangeText={setStartTime}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={endTime}
                onChangeText={setEndTime}
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {eventId && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  cancelButton: {
    padding: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    padding: 5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 15,
  },
  timeInput: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});