import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Loader2, Lock, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import { openRazorpayCheckout, formatAmount } from "@/utils/razorpay";
import toast from "react-hot-toast";

/**
 * Payment Button Component
 * Handles Razorpay checkout integration
 */
export default function PaymentButton({
  bookingId,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  description = "Booking Payment",
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  variant = "primary",
  size = "lg",
  fullWidth = true,
  showSecurityBadges = true,
  className = "",
}) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!bookingId || !amount) {
      toast.error("Invalid payment details");
      return;
    }

    if (!customerEmail || !customerName) {
      toast.error("Customer details are required");
      return;
    }

    setIsProcessing(true);

    try {
      await openRazorpayCheckout({
        bookingId,
        amount,
        name: customerName,
        email: customerEmail,
        phone: customerPhone || "",
        description,
        onSuccess: (data) => {
          setIsProcessing(false);
          toast.success("Payment successful!");

          // Call success callback if provided
          if (onPaymentSuccess) {
            onPaymentSuccess(data);
          } else {
            // Default: Navigate to payment success page
            navigate(
              `/payment/success?bookingId=${bookingId}&paymentId=${data.paymentId}`
            );
          }
        },
        onError: (error) => {
          setIsProcessing(false);
          const errorMessage =
            error?.message || "Payment failed. Please try again.";
          toast.error(errorMessage);

          // Call error callback if provided
          if (onPaymentError) {
            onPaymentError(error);
          }
        },
      });
    } catch (error) {
      setIsProcessing(false);
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment. Please try again.");

      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        variant={variant}
        size={size}
        className={fullWidth ? "w-full" : ""}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay {formatAmount(amount)}
          </>
        )}
      </Button>

      {showSecurityBadges && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>SSL Encrypted</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Powered by
            </span>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs font-semibold text-blue-600 dark:text-blue-400">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.436 0H1.564C.7 0 0 .7 0 1.564v20.872C0 23.3.7 24 1.564 24h20.872c.864 0 1.564-.7 1.564-1.564V1.564C24 .7 23.3 0 22.436 0zM7.8 19.2H4.2V8.4h3.6v10.8zM6 6.984c-1.152 0-2.088-.936-2.088-2.088S4.848 2.808 6 2.808s2.088.936 2.088 2.088S7.152 6.984 6 6.984zM20.4 19.2h-3.6v-5.256c0-1.344-.024-3.072-1.872-3.072-1.872 0-2.16 1.464-2.16 2.976V19.2h-3.6V8.4h3.456v1.476h.048c.48-.912 1.656-1.872 3.408-1.872 3.648 0 4.32 2.4 4.32 5.52V19.2z" />
              </svg>
              Razorpay
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Your payment information is secure and encrypted
          </p>
        </div>
      )}
    </div>
  );
}
