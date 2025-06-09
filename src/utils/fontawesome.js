// Import required FontAwesome core
import { library } from '@fortawesome/fontawesome-svg-core';

// Import the specific icons
import { 
  faCalendar, 
  faMapMarkerAlt, 
  faDollarSign,
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';

// Import regular style icons
import {
  faCalendar as farCalendar
} from '@fortawesome/free-regular-svg-icons';

// Add icons to the library
library.add(
  faCalendar,
  farCalendar,
  faMapMarkerAlt,
  faDollarSign,
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faLocationDot
); 