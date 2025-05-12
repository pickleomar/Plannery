import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import './CategorySelectionPage.css';

const CategorySelectionPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Predefined categories with icons
  const categoryIcons = {
    'Music': '🎵',
    'Food & Drink': '🍲',
    'Business': '💼',
    'Sports': '⚽',
    'Education': '🎓',
    'Arts': '🎨',
    'Technology': '💻',
    'Health': '❤️',
    'Travel': '✈️',
    'Fashion': '👗',
    'Film & Media': '🎬',
    'Gaming': '🎮',
    'Community': '🏘️',
    'Charity': '🤝',
    'Religious': '🙏',
    'Politics': '🗳️',
    'Science': '🔬',
    'Family': '👪',
    'Pets': '🐾',
    'Outdoors': '🏕️',
    'Nightlife': '🌃',
    'Performing Arts': '🎭',
    'Culture': '🏛️',
    'Holiday': '🎄'
  };

  // Default icon if category is not in our predefined list
  const defaultIcon = '📅';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await eventService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    navigate(`/create-event/${categoryId}`);
  };

  const getIconForCategory = (categoryName) => {
    return categoryIcons[categoryName] || defaultIcon;
  };

  if (loading) {
    return (
      <div className="category-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-error">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button onClick={fetchCategories} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="category-selection-page">
      <div className="category-header">
        <h1>Choose an Event Category</h1>
        <p>Select the category that best fits the event you're creating</p>
      </div>
      
      <div className="categories-grid">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="category-card"
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="category-icon">{getIconForCategory(category.name)}</div>
            <h3>{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySelectionPage; 