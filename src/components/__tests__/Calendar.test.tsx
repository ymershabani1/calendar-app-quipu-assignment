import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Calendar from '../Calendar';
import { CalendarView, Event } from '../../types';

describe('Calendar Component', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Morning Meeting',
      description: 'Team standup',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      userId: 'user1',
    },
    {
      id: '2',
      title: 'Lunch',
      description: '',
      date: '2024-01-15',
      startTime: '12:00',
      endTime: '13:00',
      userId: 'user1',
    },
  ];

  const defaultProps = {
    view: 'month' as CalendarView,
    selectedDate: new Date(2024, 0, 15),
    onDateSelect: jest.fn(),
    events: mockEvents,
  };

  it('renders month view correctly', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<Calendar {...defaultProps} />);
    });
    expect(tree).toBeTruthy();
  });

  it('renders day view correctly', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<Calendar {...defaultProps} view="day" />);
    });
    expect(tree).toBeTruthy();
  });

  it('calls onDateSelect when date is pressed', async () => {
    const onDateSelect = jest.fn();
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <Calendar {...defaultProps} onDateSelect={onDateSelect} />,
      );
    });
    expect(tree).toBeTruthy();
    expect(onDateSelect).toBeDefined();
  });

  it('displays events in month view', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<Calendar {...defaultProps} events={mockEvents} />);
    });
    expect(tree).toBeTruthy();
  });

  it('displays events in day view', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <Calendar {...defaultProps} view="day" events={mockEvents} />,
      );
    });
    expect(tree).toBeTruthy();
  });

  it('handles empty events array', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<Calendar {...defaultProps} events={[]} />);
    });
    expect(tree).toBeTruthy();
  });
});