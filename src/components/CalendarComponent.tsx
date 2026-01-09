import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarComponent = ({ onDateChange }) => {
    const [date, setDate] = React.useState(new Date());

    const handleDateChange = (newDate) => {
        setDate(newDate);
        onDateChange(newDate);
    };

    return (
        <div>
            <Calendar
                onChange={handleDateChange}
                value={date}
            />
        </div>
    );
};

export default CalendarComponent;