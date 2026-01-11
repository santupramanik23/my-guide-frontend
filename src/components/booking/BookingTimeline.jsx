/**
 * Booking Timeline Component
 * Visual progress tracker for booking stages
 */

import { Check, Circle, X } from 'lucide-react';
import { getBookingTimeline, formatBookingDate } from '@/utils/bookingUtils';

export default function BookingTimeline({ booking }) {
  const stages = getBookingTimeline(booking);

  return (
    <div className="py-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">
        Booking Progress
      </h3>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Stages */}
        <div className="space-y-6">
          {stages.map((stage) => {
            const isCancelled = stage.isTerminal && stage.id === 'cancelled';

            return (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center
                    w-8 h-8 rounded-full border-2 text-sm
                    ${
                      stage.completed
                        ? isCancelled
                          ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400'
                          : 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400'
                        : stage.isFuture
                        ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {stage.completed ? (
                    isCancelled ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )
                  ) : (
                    <Circle className="w-3 h-3" fill="currentColor" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-center justify-between">
                    <p
                      className={`
                        text-sm font-medium
                        ${
                          stage.completed
                            ? isCancelled
                              ? 'text-red-900 dark:text-red-300'
                              : 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }
                      `}
                    >
                      {stage.icon} {stage.label}
                    </p>

                    {stage.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatBookingDate(stage.date, 'short')}
                      </p>
                    )}
                  </div>

                  {/* Future date indicator */}
                  {stage.isFuture && (
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      Scheduled for {formatBookingDate(stage.date, 'full')}
                    </p>
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
