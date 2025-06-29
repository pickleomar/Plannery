# Plannery - Event Management Platform

Plannery is an event planning and management platform built with React and Django that helps users create, organize, and manage events with integrated service provider recommendations.

## 🌟 Features

### Core Functionality
- **User Authentication & Authorization**
  - Custom user registration and login
  - Role-based access (Organizer, Admin)
  - Protected routes and session management
  - OAuth integration ready (Google, Facebook) (Future Implementation)

- **Event Management**
  - Multi-step event creation wizard
  - Event categories and categorization
  - Location search with Google Places integration using RAPIDAPI as a third-party endpoint
  - Date/time scheduling with validation
  - Budget and attendance tracking
  - Event editing and deletion

- **Service Provider Integration**
  - Automatic provider recommendations based on event type and location
  - Google Places API integration for real-time provider data
  - Provider search and filtering
  - Provider selection and management
  - Contact information and ratings display

- **Smart Location Services**
  - Geolocation-based initial location detection
  - Location search with autocomplete
  - Distance calculations for providers
  - Address formatting and validation

### User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Progressive Disclosure** - Step-by-step wizard interface
- **Real-time Validation** - Instant feedback on form inputs
- **Loading States** - Clear indicators for async operations
- **Error Handling** - Graceful error recovery and user feedback

## Architecture

### Frontend (React)
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared components (DateTimePicker)
│   ├── events/          # Event-specific components
│   ├── layout/          # Layout and navigation
│   └── routes/          # Route protection components
├── pages/               # Page components
├── services/            # API service layers
├── context/             # React Context providers
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

### Backend (Django)
```
server/
├── backend/             # Django project settings
├── users/               # User management app
├── events/              # Event management app
├── location/            # Location and provider services
└── requirements.txt     # Python dependencies
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **React DatePicker** - Date/time selection
- **FontAwesome** - Icon library
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **Django CORS Headers** - Cross-origin requests
- **Django Allauth** - Authentication system
- **Python Dotenv** - Environment configuration

### External APIs
- **Google Places API** - Location services and provider data
- **RapidAPI** - Additional provider information

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Plannery
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Configuration

Create a `.env` file in the server directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://username:password@localhost:5432/plannery_db
GOOGLE_PLACES_API_KEY=your-google-places-api-key
RAPIDAPI_KEY=your-rapidapi-key
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🗄️ Database Schema

### Core Models

#### User Model
```python
class User(AbstractUser):
    id = UUIDField(primary_key=True)
    username = CharField(max_length=20, unique=True)
    email = EmailField(unique=True)
    role = CharField(choices=['ORGANIZER', 'ADMIN'])
    oauth_provider = CharField(choices=['GOOGLE', 'FACEBOOK'])
```

#### Event Model
```python
class Event(models.Model):
    title = CharField(max_length=200)
    category = ForeignKey(Category)
    organizer = ForeignKey(User)
    budget = IntegerField()
    start_date = DateTimeField()
    location = JSONField()
    expected_attendance = PositiveIntegerField()
```

#### Provider Model
```python
class Provider(models.Model):
    name = CharField(max_length=100)
    api_source = CharField(choices=['YELP', 'GOOGLE', 'RAPIDAPI'])
    address = CharField(max_length=255)
    phone = CharField(max_length=20)
    website = URLField()
    rating = FloatField()
    coordinates = JSONField()
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Events
- `GET /api/events/categories/` - Get event categories
- `POST /api/events/create/` - Create new event
- `GET /api/events/my-events/` - Get user's events
- `GET /api/events/{id}/` - Get event details
- `PUT /api/events/{id}/` - Update event
- `DELETE /api/events/{id}/` - Delete event

### Providers
- `POST /api/events/providers/create-from-api/` - Add provider to event
- `DELETE /api/events/{id}/providers/clear/` - Clear event providers

### Location
- `GET /api/location/get-initial-location/` - Get user's location
- `POST /api/location/search-locations/` - Search locations
- `POST /api/location/providers/` - Get location-based providers

## Usage Guide

### Creating an Event

1. **Authentication**: Register/login to access the platform
2. **Category Selection**: Choose from available event categories
3. **Basic Information**: 
   - Enter event title, date, and location
   - Set budget and expected attendance
4. **Service Providers**: 
   - Review recommended providers
   - Search for specific providers
   - Select desired providers
5. **Confirmation**: Review and create the event

### Managing Events

- **Dashboard**: View all your events in a centralized dashboard
- **Edit Events**: Modify event details and provider selections
- **Delete Events**: Remove events with confirmation
- **Provider Management**: Add/remove providers from existing events

## Security Features

- **CSRF Protection** - Cross-site request forgery prevention
- **Authentication Required** - Protected routes and API endpoints
- **Input Validation** - Server-side and client-side validation
- **Data Sanitization** - Clean user inputs before database storage
- **Role-based Access** - Different permissions for organizers and admins

## 🧪 Testing

### Frontend Testing
```bash
npm run lint          # ESLint code analysis
npm run build         # Production build test
```

### Backend Testing
```bash
python manage.py test  # Run Django tests
```





## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API testing reference in `server/api-testing-ref.md`

## Version History

- **v1.0.0** - Initial release with core event management features
- **v1.1.0** - Added service provider integration
- **v1.2.0** - Enhanced location services and provider search

---
