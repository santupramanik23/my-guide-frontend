/**
 * Booking Utilities
 * Professional helpers for booking management
 */

/**
 * Get booking status badge configuration
 */
export const getBookingStatusBadge = (status) => {
  const badges = {
    pending: {
      label: 'Pending Confirmation',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: '⏳',
      description: 'Awaiting confirmation'
    },
    confirmed: {
      label: 'Confirmed',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      icon: '✓',
      description: 'Your booking is confirmed'
    },
    completed: {
      label: 'Completed',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: '✓✓',
      description: 'Experience completed'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: '✕',
      description: 'Booking cancelled'
    }
  };

  return badges[status] || badges.pending;
};

/**
 * Get payment status badge configuration
 */
export const getPaymentStatusBadge = (paymentStatus) => {
  const badges = {
    pending: {
      label: 'Payment Pending',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      icon: '💳',
      description: 'Payment not yet received'
    },
    paid: {
      label: 'Paid',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: '✓',
      description: 'Payment successful'
    },
    refunded: {
      label: 'Refunded',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      icon: '↩',
      description: 'Amount refunded'
    },
    failed: {
      label: 'Payment Failed',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: '✕',
      description: 'Payment failed'
    }
  };

  return badges[paymentStatus] || badges.pending;
};

/**
 * Calculate days until booking
 */
export const getDaysUntilBooking = (bookingDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const booking = new Date(bookingDate);
  booking.setHours(0, 0, 0, 0);

  const diffTime = booking - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get booking urgency level
 */
export const getBookingUrgency = (bookingDate) => {
  const days = getDaysUntilBooking(bookingDate);

  if (days < 0) {
    return { level: 'past', label: 'Past', color: 'text-gray-500' };
  } else if (days === 0) {
    return { level: 'today', label: 'Today!', color: 'text-red-600 font-bold' };
  } else if (days === 1) {
    return { level: 'tomorrow', label: 'Tomorrow', color: 'text-orange-600 font-semibold' };
  } else if (days <= 3) {
    return { level: 'soon', label: `In ${days} days`, color: 'text-yellow-600' };
  } else if (days <= 7) {
    return { level: 'upcoming', label: `In ${days} days`, color: 'text-blue-600' };
  } else {
    return { level: 'future', label: `In ${days} days`, color: 'text-gray-600' };
  }
};

/**
 * Check if booking can be cancelled
 */
export const canCancelBooking = (booking) => {
  if (!booking || booking.status === 'cancelled' || booking.status === 'completed') {
    return { allowed: false, reason: 'Booking cannot be cancelled' };
  }

  const hoursUntil = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);

  if (hoursUntil < 24) {
    return {
      allowed: false,
      reason: 'Cancellation must be made at least 24 hours before the booking',
      hoursRemaining: Math.max(0, hoursUntil)
    };
  }

  return {
    allowed: true,
    reason: 'Free cancellation available',
    hoursUntil
  };
};

/**
 * Check if booking can be modified
 */
export const canModifyBooking = (booking) => {
  if (!booking || booking.status === 'cancelled' || booking.status === 'completed') {
    return { allowed: false, reason: 'Booking cannot be modified' };
  }

  const hoursUntil = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);

  if (hoursUntil < 24) {
    return {
      allowed: false,
      reason: 'Modifications must be made at least 24 hours before the booking'
    };
  }

  return {
    allowed: true,
    reason: 'You can modify your booking',
    hoursUntil
  };
};

/**
 * Format booking price with currency
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
};

/**
 * Format booking date
 */
export const formatBookingDate = (date, format = 'full') => {
  const d = new Date(date);

  const formats = {
    full: {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    },
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    },
    medium: {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }
  };

  return d.toLocaleDateString('en-IN', formats[format] || formats.full);
};

/**
 * Calculate booking timeline stages
 */
export const getBookingTimeline = (booking) => {
  const stages = [
    {
      id: 'booking',
      label: 'Booking Created',
      completed: true,
      date: booking.createdAt,
      icon: '📝'
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      completed: booking.status !== 'pending',
      date: booking.updatedAt,
      icon: '✓'
    },
    {
      id: 'payment',
      label: 'Payment',
      completed: booking.paymentStatus === 'paid',
      date: booking.paymentStatus === 'paid' ? booking.updatedAt : null,
      icon: '💳'
    },
    {
      id: 'activity',
      label: 'Activity Date',
      completed: booking.status === 'completed' || new Date(booking.date) < new Date(),
      date: booking.date,
      icon: '🎯',
      isFuture: new Date(booking.date) > new Date()
    },
    {
      id: 'completed',
      label: 'Completed',
      completed: booking.status === 'completed',
      date: booking.status === 'completed' ? booking.updatedAt : null,
      icon: '✓✓'
    }
  ];

  // Handle cancelled bookings
  if (booking.status === 'cancelled') {
    return stages.slice(0, 2).concat([{
      id: 'cancelled',
      label: 'Cancelled',
      completed: true,
      date: booking.updatedAt,
      icon: '✕',
      isTerminal: true
    }]);
  }

  return stages;
};

/**
 * Generate calendar event data (.ics format)
 */
export const generateCalendarEvent = (booking, item) => {
  const title = item?.title || item?.name || 'My Guide Booking';
  const location = item?.location?.address || 'See booking details';
  const description = `Booking ID: ${booking._id || booking.id}\\nParticipants: ${booking.participants}\\nTotal: ₹${booking.totalAmount}`;

  const startDate = new Date(booking.date);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours default

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My Guide//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${booking._id || booking.id}@myguide.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

/**
 * Download calendar event
 */
export const downloadCalendarEvent = (booking, item) => {
  const icsContent = generateCalendarEvent(booking, item);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `booking-${booking._id || booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Get cancellation policy text
 */
export const getCancellationPolicy = () => {
  return {
    title: 'Free Cancellation Policy',
    rules: [
      'Cancel up to 24 hours before the activity for a full refund',
      'Cancellations made less than 24 hours before the start time are non-refundable',
      'No-shows are non-refundable',
      'Weather-related cancellations may qualify for a reschedule or refund'
    ],
    contact: 'For special circumstances, contact support@myguide.com'
  };
};

/**
 * Calculate refund amount based on cancellation time
 */
export const calculateRefund = (booking) => {
  const hoursUntil = (new Date(booking.date) - new Date()) / (1000 * 60 * 60);
  const totalAmount = booking.totalAmount || 0;

  if (hoursUntil >= 24) {
    return {
      amount: totalAmount,
      percentage: 100,
      policy: 'Full refund (cancelled 24+ hours in advance)'
    };
  } else if (hoursUntil >= 12) {
    const refund = totalAmount * 0.5;
    return {
      amount: refund,
      percentage: 50,
      policy: '50% refund (cancelled 12-24 hours in advance)'
    };
  } else {
    return {
      amount: 0,
      percentage: 0,
      policy: 'No refund (cancelled less than 12 hours in advance)'
    };
  }
};

export default {
  getBookingStatusBadge,
  getPaymentStatusBadge,
  getDaysUntilBooking,
  getBookingUrgency,
  canCancelBooking,
  canModifyBooking,
  formatPrice,
  formatBookingDate,
  getBookingTimeline,
  generateCalendarEvent,
  downloadCalendarEvent,
  getCancellationPolicy,
  calculateRefund
};
