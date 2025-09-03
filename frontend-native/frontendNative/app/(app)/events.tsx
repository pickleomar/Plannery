import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data - replace with actual event service
const mockEvents = [
  {
    id: 1,
    title: 'Wedding Ceremony',
    date: '2024-06-15T14:00:00Z',
    location: 'Central Park',
    status: 'active',
    category: 'Wedding',
  },
  {
    id: 2,
    title: 'Birthday Party',
    date: '2024-06-20T18:00:00Z',
    location: 'Home',
    status: 'planning',
    category: 'Birthday Party',
  },
  {
    id: 3,
    title: 'Corporate Meeting',
    date: '2024-06-25T10:00:00Z',
    location: 'Office',
    status: 'completed',
    category: 'Corporate Event',
  },
  {
    id: 4,
    title: 'Summer Concert',
    date: '2024-07-10T19:00:00Z',
    location: 'City Stadium',
    status: 'planning',
    category: 'Concert',
  },
];

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState(mockEvents);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewEvent = (event: any) => {
    // TODO: Implement event details navigation
    console.log('View event:', event);
  };

  const handleEditEvent = (eventId: number) => {
    // TODO: Implement edit event navigation
    console.log('Edit event:', eventId);
  };

  const handleDeleteEvent = (event: any) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents(prev => prev.filter(e => e.id !== event.id));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'planning':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'planning':
        return 'Planning';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.status === filter);

  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleViewEvent(item)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetail}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.eventDetail}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>{item.location}</Text>
        </View>
        
        <View style={styles.eventDetail}>
          <Ionicons name="pricetag-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => handleEditEvent(item.id)}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => handleDeleteEvent(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({events.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'planning' && styles.filterTabActive]}
            onPress={() => setFilter('planning')}
          >
            <Text style={[styles.filterText, filter === 'planning' && styles.filterTextActive]}>
              Planning ({events.filter(e => e.status === 'planning').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Active ({events.filter(e => e.status === 'active').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
              Completed ({events.filter(e => e.status === 'completed').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.eventsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  eventsList: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionIconButton: {
    padding: 8,
  },
});
