/**
 * Razorpay Integration Utilities
 * Handles payment gateway integration
 */

/**
 * Load Razorpay SDK script
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
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.keyId - Razorpay key ID
 * @param {Object} options.prefill - Prefill customer details
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 */
export const initiateRazorpayPayment = async ({
  orderId,
  amount,
  currency = "INR",
  keyId,
  bookingId,
  activityName,
  prefill = {},
  onSuccess,
  onFailure,
}) => {
  // Load Razorpay SDK
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    if (onFailure) {
      onFailure(new Error("Failed to load Razorpay SDK"));
    }
    return;
  }

  const options = {
    key: keyId,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: currency,
    name: "My Guide",
    description: activityName || "Tour Booking",
    order_id: orderId,
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.phone || "",
    },
    theme: {
      color: "#667eea", // Primary brand color
    },
    modal: {
      ondismiss: () => {
        if (onFailure) {
          onFailure(new Error("Payment cancelled by user"));
        }
      },
    },
    handler: function (response) {
      // Payment successful
      if (onSuccess) {
        onSuccess({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          bookingId,
        });
      }
    },
  };

  try {
    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on("payment.failed", function (response) {
      if (onFailure) {
        onFailure({
          error: response.error,
          reason: response.error.reason,
          description: response.error.description,
        });
      }
    });

    razorpayInstance.open();
  } catch (error) {
    if (onFailure) {
      onFailure(error);
    }
  }
};

/**
 * Format amount for display
 */
export const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Validate payment response
 */
export const validatePaymentResponse = (response) => {
  if (!response) return false;

  return !!(
    response.orderId &&
    response.paymentId &&
    response.signature
  );
};

export default {
  loadRazorpayScript,
  initiateRazorpayPayment,
  formatAmount,
  validatePaymentResponse,
};
