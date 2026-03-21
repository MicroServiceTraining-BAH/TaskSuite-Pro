"use client";

import { useState, useMemo } from "react";
import { Button } from "@tasksuite/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  client?: {
    name: string;
  };
}

interface CalendarViewProps {
  appointments: Appointment[];
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
}

export function CalendarView({
  appointments,
  onDateClick,
  onAppointmentClick,
  onDelete,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((appointment) => {
      const date = new Date(appointment.startTime);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    return grouped;
  }, [appointments]);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return appointmentsByDate[dateKey] || [];
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month;
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [year, month, daysInMonth, startingDayOfWeek]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {monthNames[month]} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border bg-card">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((day) => (
            <div
              key={day}
              className="border-r p-2 text-center text-sm font-semibold last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[120px] border-r border-b bg-muted/30 last:border-r-0"
                />
              );
            }

            const dayAppointments = getAppointmentsForDate(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[120px] border-r border-b p-1.5 last:border-r-0 transition-colors ${
                  isCurrentMonthDate ? "bg-card hover:bg-muted/50" : "bg-muted/30"
                } ${isTodayDate ? "ring-2 ring-primary ring-offset-1" : ""}`}
              >
                <div
                  className={`mb-1.5 text-sm font-medium ${
                    isTodayDate
                      ? "rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center w-7 h-7"
                      : isCurrentMonthDate
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="cursor-pointer rounded bg-primary/10 px-1.5 py-1 text-xs text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                      onClick={() => onAppointmentClick?.(appointment)}
                      title={`${appointment.title} - ${new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      <div className="truncate font-medium">{appointment.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

