import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

// Mock data for now - replace with actual event service
const mockEvents = [
  {
    id: 1,
    title: 'Wedding Ceremony',
    date: '2024-06-15T14:00:00Z',
    location: 'Central Park',
    status: 'active',
  },
  {
    id: 2,
    title: 'Birthday Party',
    date: '2024-06-20T18:00:00Z',
    location: 'Home',
    status: 'planning',
  },
];

export default function DashboardScreen() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [userEvents, setUserEvents] = useState(mockEvents);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Failed to logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleCreateEvent = () => {
    router.push('/(app)/create-event');
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
            // Remove event from list
            setUserEvents(prev => prev.filter(e => e.id !== event.id));
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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{currentUser?.username || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCreateEvent}>
            <View style={styles.actionIcon}>
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text style={styles.actionText}>Create Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <Text style={styles.actionText}>View Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Events</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/events')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : userEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No events yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first event to get started</Text>
            </View>
          ) : (
            userEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleViewEvent(event)}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
                  </View>
                  
                  <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                </View>

                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => handleEditEvent(event.id)}
                  >
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionIconButton}
                    onPress={() => handleDeleteEvent(event)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
