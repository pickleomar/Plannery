import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const eventCategories = [
  {
    id: 1,
    name: 'Wedding',
    icon: 'heart',
    color: '#FF6B6B',
    description: 'Plan your perfect wedding day',
  },
  {
    id: 2,
    name: 'Birthday Party',
    icon: 'gift',
    color: '#4ECDC4',
    description: 'Celebrate special moments',
  },
  {
    id: 3,
    name: 'Corporate Event',
    icon: 'business',
    color: '#45B7D1',
    description: 'Professional business events',
  },
  {
    id: 4,
    name: 'Conference',
    icon: 'people',
    color: '#96CEB4',
    description: 'Educational and networking events',
  },
  {
    id: 5,
    name: 'Concert',
    icon: 'musical-notes',
    color: '#FFEAA7',
    description: 'Musical performances and shows',
  },
  {
    id: 6,
    name: 'Sports Event',
    icon: 'football',
    color: '#DDA0DD',
    description: 'Athletic competitions and games',
  },
];

export default function CreateEventScreen() {
  const router = useRouter();

  const handleCategorySelect = (category: any) => {
    // TODO: Implement event wizard navigation
    console.log('Selected category:', category);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Event</Text>
          <Text style={styles.subtitle}>
            Choose a category to get started with your event planning
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {eventCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategorySelect(category)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={32} color="white" />
              </View>
              
              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customSection}>
          <Text style={styles.customTitle}>Don't see your category?</Text>
          <TouchableOpacity style={styles.customButton}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.customButtonText}>Create Custom Event</Text>
          </TouchableOpacity>
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
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  customSection: {
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  customTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  customButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
