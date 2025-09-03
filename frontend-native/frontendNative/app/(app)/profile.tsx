
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

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

  const profileOptions = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'person-outline',
      color: '#007AFF',
      onPress: () => console.log('Account Settings'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      color: '#FF9500',
      onPress: () => console.log('Notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      color: '#34C759',
      onPress: () => console.log('Privacy & Security'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      color: '#5856D6',
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 'about',
      title: 'About Plannery',
      icon: 'information-circle-outline',
      color: '#FF2D92',

      onPress: () => console.log('About Plannery'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{currentUser?.username || 'User'}</Text>
          <Text style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={16} color="#007AFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Events Created</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <Ionicons name={option.icon as any} size={20} color="white" />
              </View>
              
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Plannery v1.0.0</Text>
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
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  editProfileText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 10,
  },
  optionsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  versionSection: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
