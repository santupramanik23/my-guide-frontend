/**
 * Razorpay Checkout Utility
 * Handles Razorpay payment integration on frontend
 */

import { api } from "@/store/auth";

/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay checkout for booking payment
 * @param {Object} options - Payment options
 * @param {string} options.bookingId - Booking ID
 * @param {number} options.amount - Amount in rupees (will be converted to paise)
 * @param {string} options.name - Customer name
 * @param {string} options.email - Customer email
 * @param {string} options.phone - Customer phone
 * @param {string} options.description - Payment description
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<void>}
 */
export const openRazorpayCheckout = async ({
  bookingId,
  amount,
  name,
  email,
  phone,
  description = "Booking Payment",
  onSuccess,
  onError,
}) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
    }

    // Create payment order
    const orderResponse = await api.post("/payments/create-order", {
      bookingId,
      amount: Math.round(amount),
    });

    const { orderId, amount: orderAmount, currency, keyId } = orderResponse.data.data;

    // Razorpay checkout options
    const options = {
      key: keyId,
      amount: orderAmount,
      currency: currency,
      name: "My Guide",
      description: description,
      order_id: orderId,
      prefill: {
        name: name,
        email: email,
        contact: phone,
      },
      theme: {
        color: "#667eea",
      },
      modal: {
        ondismiss: () => {
          if (onError) {
            onError(new Error("Payment cancelled by user"));
          }
        },
      },
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verifyResponse = await api.post("/payments/verify", {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId: bookingId,
          });

          if (verifyResponse.data.data.success) {
            if (onSuccess) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                booking: verifyResponse.data.data.booking,
              });
            }
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          if (onError) {
            onError(error);
          }
        }
      },
    };

    // Open Razorpay checkout
    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("Payment failed:", response.error);
      if (onError) {
        onError(new Error(response.error.description || "Payment failed"));
      }
    });

    rzp.open();
  } catch (error) {
    console.error("Razorpay checkout error:", error);
    if (onError) {
      onError(error);
    }
  }
};

/**
 * Format amount to display
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

/**
 * Check if payment is required for booking
 * @param {Object} booking - Booking object
 * @returns {boolean} True if payment is required
 */
export const isPaymentRequired = (booking) => {
  if (!booking) return false;
  return booking.paymentStatus !== "paid" && booking.status !== "cancelled";
};

/**
 * Get payment status badge
 * @param {string} status - Payment status
 * @returns {Object} Badge configuration
 */
export const getPaymentStatusBadge = (status) => {
  const badges = {
    pending: {
      label: "Payment Pending",
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      icon: "💳",
    },
    paid: {
      label: "Paid",
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      icon: "✓",
    },
    failed: {
      label: "Payment Failed",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      icon: "✕",
    },
    refunded: {
      label: "Refunded",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      icon: "↩",
    },
  };

  return badges[status] || badges.pending;
};

export default {
  loadRazorpayScript,
  openRazorpayCheckout,
  formatAmount,
  isPaymentRequired,
  getPaymentStatusBadge,
};
