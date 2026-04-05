import React, { useEffect, useRef, useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

/**
 * DatePicker
 *
 * Props:
 *   value      — selected date as "YYYY-MM-DD" string (or "")
 *   onChange   — (isoString: string) => void
 *   min        — minimum selectable date as "YYYY-MM-DD" (default: today)
 *   max        — maximum selectable date as "YYYY-MM-DD"
 *   placeholder — string shown when no date selected
 *   label       — optional label text rendered above the input
 *   error       — optional error message
 *   className   — extra classes on root wrapper
 */
export default function DatePicker({
  value = "",
  onChange,
  min,
  max,
  placeholder = "Select a date",
  label,
  error,
  className = "",
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min ? parseISO(min) : today;
  const maxDate = max ? parseISO(max) : null;

  const selectedDate = value ? parseISO(value) : null;

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => {
    if (selectedDate) return startOfMonth(selectedDate);
    if (minDate && isAfter(minDate, today)) return startOfMonth(minDate);
    return startOfMonth(today);
  });

  const rootRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
    end:   endOfWeek(endOfMonth(current), { weekStartsOn: 1 }),
  });

  const isDisabled = (day) => {
    if (isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  };

  const select = (day) => {
    if (isDisabled(day)) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
          bg-white dark:bg-gray-800
          ${error
            ? "border-red-400 dark:border-red-500 focus:ring-red-400"
            : open
            ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900/40"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          focus:outline-none`}
      >
        <Calendar className={`h-5 w-5 flex-shrink-0 ${selectedDate ? "text-primary-600 dark:text-primary-400" : "text-gray-400"}`} />
        <span className={`flex-1 text-sm ${selectedDate ? "text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-500"}`}>
          {selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy") : placeholder}
        </span>
        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrent((c) => subMonths(c, 1))}
              disabled={isSameMonth(current, minDate)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>

            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {format(current, "MMMM yyyy")}
            </span>

            <button
              type="button"
              onClick={() => setCurrent((c) => addMonths(c, 1))}
              disabled={maxDate ? isSameMonth(current, maxDate) : false}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const isSelected   = selectedDate && isSameDay(day, selectedDate);
              const isToday      = isSameDay(day, today);
              const disabled     = isDisabled(day);
              const outOfMonth   = !isSameMonth(day, current);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => select(day)}
                  disabled={disabled}
                  className={`
                    relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all
                    ${isSelected
                      ? "bg-primary-600 text-white font-semibold shadow-md shadow-primary-200 dark:shadow-primary-900/40"
                      : disabled
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : outOfMonth
                      ? "text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      : isToday
                      ? "text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {minDate ? `Available from ${format(minDate, "d MMM yyyy")}` : "Select a date"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
