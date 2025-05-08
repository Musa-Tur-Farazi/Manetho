"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  PlusCircle,
  Filter,
  Search 
} from "lucide-react";
import { Button } from "../../../components/ui/Button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Sample data for calendar events
const events = [
  {
    id: 1,
    title: "Physics Study Session",
    subject: "Thermodynamics",
    date: new Date(2025, 4, 15, 10, 0),
    duration: 90, // minutes
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: 2,
    title: "Biology Review",
    subject: "Cell Structure",
    date: new Date(2025, 4, 16, 14, 0),
    duration: 60,
    color: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    id: 3,
    title: "Chemistry Quiz",
    subject: "Organic Chemistry",
    date: new Date(2025, 4, 17, 15, 30),
    duration: 45,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    id: 4,
    title: "Mathematics Practice",
    subject: "Calculus",
    date: new Date(2025, 4, 18, 9, 0),
    duration: 120,
    color: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    id: 5,
    title: "Study Group Session",
    subject: "Physics",
    date: new Date(2025, 4, 19, 16, 0),
    duration: 90,
    color: "bg-cyan-100 dark:bg-cyan-900/30",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-200 dark:border-cyan-800",
  },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Generate calendar days array
  const generateCalendarDays = () => {
    const days = [];
    const prevMonth = new Date(year, month - 1);
    const nextMonth = new Date(year, month + 1);
    
    // Previous month days
    const prevMonthDays = getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        month: prevMonth.getMonth(),
        year: prevMonth.getFullYear(),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        month,
        year,
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        month: nextMonth.getMonth(),
        year: nextMonth.getFullYear(),
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };
  
  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };
  
  // Check if a day has events
  const getEventsForDay = (day: number, month: number, year: number) => {
    return events.filter(event => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };
  
  // Filter events for selected date
  const selectedDayEvents = getEventsForDay(
    selectedDate.getDate(),
    selectedDate.getMonth(),
    selectedDate.getFullYear()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Study Calendar
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Organize your study sessions and track your progress
          </p>
        </div>
        <Button
          className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white min-w-[180px]"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Study Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[80px] text-center"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day.day, day.month, day.year);
                const isSelected = 
                  selectedDate.getDate() === day.day && 
                  selectedDate.getMonth() === day.month && 
                  selectedDate.getFullYear() === day.year;
                
                return (
                  <div 
                    key={index}
                    onClick={() => setSelectedDate(new Date(day.year, day.month, day.day))}
                    className={`
                      relative h-24 p-1 border border-gray-100 dark:border-gray-700 cursor-pointer
                      transition-colors duration-200 
                      ${day.isCurrentMonth 
                        ? 'bg-white dark:bg-gray-800' 
                        : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600'}
                      ${isSelected ? 'ring-2 ring-cyan-500 dark:ring-cyan-700' : ''}
                    `}
                  >
                    <div className="flex justify-between">
                      <span className={`
                        inline-flex items-center justify-center w-6 h-6 rounded-full text-sm
                        ${isSelected 
                          ? 'bg-cyan-500 dark:bg-cyan-700 text-white' 
                          : 'text-gray-700 dark:text-gray-300'}
                      `}>
                        {day.day}
                      </span>
                    </div>
                    <div className="mt-1 overflow-y-auto max-h-16 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div 
                          key={event.id}
                          className={`text-xs px-1.5 py-0.5 rounded ${event.color} ${event.textColor} truncate`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected day events */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>

            {selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${event.borderColor} ${event.color}`}
                  >
                    <h3 className={`font-medium ${event.textColor}`}>{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.subject}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.date.getHours()}:{event.date.getMinutes().toString().padStart(2, '0')} - 
                        {new Date(event.date.getTime() + event.duration * 60000).getHours()}:
                        {new Date(event.date.getTime() + event.duration * 60000).getMinutes().toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({event.duration} min)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-gray-500 dark:text-gray-400 mb-1">No study sessions</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  There are no sessions scheduled for this day
                </p>
                <Button variant="outline" size="sm" className="min-w-[140px]">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 