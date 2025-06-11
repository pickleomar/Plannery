import { useState, useEffect } from 'react';
import './DateTimePicker.css';

const DateTimePicker = ({ value, onChange, required = false }) => {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  
  useEffect(() => {
    if (value) {
      // Parse the ISO datetime string into separate date and time parts
      const dateObj = new Date(value);
      
      if (!isNaN(dateObj.getTime())) {
        // Format date as YYYY-MM-DD for the date input
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        setDateValue(`${year}-${month}-${day}`);
        
        // Format time as HH:MM for the time input
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        setTimeValue(`${hours}:${minutes}`);
      }
    }
  }, [value]);
  
  const handleDateChange = (e) => {
    setDateValue(e.target.value);
    updateCombinedValue(e.target.value, timeValue);
  };
  
  const handleTimeChange = (e) => {
    setTimeValue(e.target.value);
    updateCombinedValue(dateValue, e.target.value);
  };
  
  const updateCombinedValue = (date, time) => {
    if (date && time) {
      // Combine date and time into ISO string format
      const combinedValue = new Date(`${date}T${time}`);
      if (!isNaN(combinedValue.getTime())) {
        onChange(combinedValue.toISOString());
      }
    } else if (date) {
      // If only date is provided, use a default time (start of day)
      const combinedValue = new Date(`${date}T00:00`);
      if (!isNaN(combinedValue.getTime())) {
        onChange(combinedValue.toISOString());
      }
    } else {
      onChange('');
    }
  };
  
  return (
    <div className="datetime-picker">
      <div className="datetime-inputs">
        <input
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          className="date-input"
          required={required}
        />
        <input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="time-input"
          required={required}
        />
      </div>
    </div>
  );
};

export default DateTimePicker; 