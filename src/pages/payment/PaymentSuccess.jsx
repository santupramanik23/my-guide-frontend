import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  Download,
  Calendar,
  Users,
  MapPin,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Share2,
  ArrowRight,
  Sparkles,
  Star,
  Receipt,
  FileText,
  MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/store/auth";
import toast from "react-hot-toast";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(n || 0));

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "N/A";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    if (!bookingId || !paymentId) {
      setError("Invalid payment confirmation link");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch booking details
        const bookingRes = await api.get(`/bookings/${bookingId}`);
        const bookingData = bookingRes?.data?.data?.booking || bookingRes?.data?.booking || bookingRes?.data;
        setBooking(bookingData);

        // Try to fetch payment details (optional)
        try {
          const paymentRes = await api.get(`/payments/${paymentId}`);
          const paymentData = paymentRes?.data?.data?.payment || paymentRes?.data?.payment || paymentRes?.data;
          setPayment(paymentData);
        } catch (e) {
          console.log("Payment details not available:", e);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching payment confirmation:", err);
        setError(err?.response?.data?.message || "Failed to load payment details");
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, paymentId]);

  const downloadReceipt = async () => {
    if (!booking?._id && !booking?.id) return;

    setDownloadingReceipt(true);
    try {
      const id = booking._id || booking.id;
      const response = await api.get(`/bookings/${id}/receipt`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-receipt-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      console.error("Error downloading receipt:", err);
      toast.error("Failed to download receipt");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const shareBooking = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Booking Confirmation",
          text: `I just booked an amazing experience!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent grid place-items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center p-4">
        <Card className="max-w-md w-full border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto mb-4">
              <span className="text-3xl"></span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Confirmation Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "Unable to load payment details"}
            </p>
            <Button onClick={() => navigate("/bookings")} className="w-full">
              Go to My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = booking.activity || booking.place;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Success Banner */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 animate-bounce-once">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your booking is confirmed and ready
          </p>
        </div>

        {/* Transaction Info Banner */}
        <div className="mb-6 p-4 bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur rounded-lg border-l-4 border-green-500 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                  {paymentId || booking.paymentId || "Processing..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                 PAID
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details Card */}
            <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  Booking Details
                </h2>

                {item && (
                  <div className="flex gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.title || item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {item.title || item.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.city}
                          </span>
                        )}
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.duration} hours
                          </span>
                        )}
                        {item.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {item.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {fmtDate(booking.date)}
                      </p>
                      {booking.time && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.time}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Participants</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.participants} {booking.participants === 1 ? "person" : "people"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                      <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {booking._id || booking.id}
                      </p>
                    </div>
                  </div>

                  {booking.customer && (
                    <>
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.customer.email}
                          </p>
                        </div>
                      </div>

                      {booking.customer.phone && (
                        <div className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                          <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {booking.customer.phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {booking.specialRequests && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Special Requests</p>
                        <p className="text-gray-900 dark:text-white">{booking.specialRequests}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* What's Next Card */}
            <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  What happens next?
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We've sent a confirmation email with your booking details and payment receipt.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Prepare for Your Experience
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We'll send you a reminder 24 hours before your booking. Please arrive 15 minutes early.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Enjoy Your Adventure
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show up, have fun, and create unforgettable memories!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </h3>
                <div className="space-y-3 text-sm">
                  {booking.pricing ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                        <span className="text-gray-900 dark:text-white">{INR(booking.pricing.basePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal ({booking.participants}x)</span>
                        <span className="text-gray-900 dark:text-white">{INR(booking.pricing.subtotal)}</span>
                      </div>
                      {booking.pricing.groupDiscount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>
                            Group discount
                            {booking.pricing.groupDiscountRate ? ` (${Math.round(booking.pricing.groupDiscountRate * 100)}%)` : ""}
                          </span>
                          <span>-{INR(booking.pricing.groupDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tax (18%)</span>
                        <span className="text-gray-900 dark:text-white">{INR(booking.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                        <span className="text-gray-900 dark:text-white">{INR(booking.pricing.serviceFee)}</span>
                      </div>
                      {booking.pricing.promoDiscount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Promo discount{booking.pricing.promoCode ? ` (${booking.pricing.promoCode})` : ""}</span>
                          <span>-{INR(booking.pricing.promoDiscount)}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-base">
                        <span className="text-gray-900 dark:text-white">Total Paid</span>
                        <span className="text-green-600 dark:text-green-400">{INR(booking.totalAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-gray-900 dark:text-white">Total Paid</span>
                      <span className="text-green-600 dark:text-green-400">{INR(booking.totalAmount)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={downloadReceipt}
                  disabled={downloadingReceipt}
                  className="w-full"
                  variant="outline"
                >
                  {downloadingReceipt ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </>
                  )}
                </Button>

                <Button onClick={shareBooking} className="w-full" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Booking
                </Button>

                <Link to="/bookings" className="block">
                  <Button className="w-full">
                    View All Bookings
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">
                    Add to Calendar
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Don't forget! Add this booking to your calendar so you don't miss it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explore More CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Looking for more adventures?
          </p>
          <Link to="/activities">
            <Button variant="outline" size="lg">
              Explore More Activities
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
