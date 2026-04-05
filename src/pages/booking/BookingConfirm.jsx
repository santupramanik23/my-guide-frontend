import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  Calendar,
  Users,
  MapPin,
  Clock,
  Mail,
  Phone,
  Download,
  Share2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Bell,
  MessageSquare,
  Star,
  Copy,
  Check,
} from "lucide-react";
import { api } from "@/store/auth";
import toast from "react-hot-toast";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

const shortId = (id = "") => id.slice(-8).toUpperCase();

const getImageUrl = (item = {}) =>
  item.photos?.[0] || item.images?.[0] || item.image || null;

const getRatingValue = (item = {}) =>
  item?.rating?.avg || item?.averageRating || item?.rating || null;

const formatLocation = (item = {}) => {
  if (typeof item.address === "string" && item.address.trim()) return item.address;
  if (typeof item.location === "string" && item.location.trim()) return item.location;

  if (item.location && typeof item.location === "object") {
    const coords = Array.isArray(item.location.coordinates) ? item.location.coordinates : null;
    if (coords?.length === 2) {
      const [lng, lat] = coords;
      return `${lat}, ${lng}`;
    }
  }

  if (typeof item.city === "string" && item.city.trim()) return item.city;
  return "";
};

/* ── animated tick ───────────────────────────────────────────────────────── */
function SuccessTick() {
  return (
    <div className="relative inline-flex">
      {/* Outer pulse rings */}
      <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
      <span className="absolute inset-2 rounded-full bg-emerald-400/15 animate-ping [animation-delay:200ms]" />
      <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40">
        <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}

/* ── copy-able reference chip ────────────────────────────────────────────── */
function RefChip({ id }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
    >
      <span className="text-xs font-mono text-gray-600 dark:text-gray-300">#{shortId(id)}</span>
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Copy className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      }
    </button>
  );
}

/* ── detail row ──────────────────────────────────────────────────────────── */
function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}

/* ── pricing row ─────────────────────────────────────────────────────────── */
function PriceRow({ label, value, highlight, discount }) {
  return (
    <div className={`flex justify-between items-center text-sm ${highlight ? "font-bold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
      <span>{label}</span>
      <span className={discount ? "text-emerald-600 dark:text-emerald-400" : highlight ? "text-emerald-600 dark:text-emerald-400" : ""}>
        {value}
      </span>
    </div>
  );
}

/* ── what's next step ────────────────────────────────────────────────────── */
function NextStep({ icon: Icon, title, desc, step }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
          {step}
        </div>
        {step < 3 && <div className="w-px flex-1 bg-emerald-200 dark:bg-emerald-800 mt-1" />}
      </div>
      <div className="pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────────────── */
export default function BookingConfirm() {
  const [params] = useSearchParams();
  const id = params.get("id") || "";
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    if (!id) { setError("No booking ID provided."); setLoading(false); return; }
    let mounted = true;
    (async () => {
      try {
        const r = await api.get(`/bookings/${id}`);
        const data = r?.data?.data || r?.data;
        const bk = data?.booking || data;
        if (mounted) setBooking(bk);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || "Failed to load booking.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Booking Confirmation", url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch { /* user cancelled */ }
  };

  const handleDownloadReceipt = async () => {
    setDownloadingReceipt(true);
    try {
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

      toast.success("Receipt downloaded successfully.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to download receipt.");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  /* ── loading ────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-14 w-14 animate-spin text-emerald-500 mx-auto" />
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">Confirming your booking…</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This will only take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── error ──────────────────────────────────────────────────────────────── */
  if (error || !booking) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 p-4">
        <div className="text-center max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Booking Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || "We couldn't find this booking."}</p>
          <Link
            to="/account/bookings"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            View My Bookings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── data ───────────────────────────────────────────────────────────────── */
  const item     = booking.activity || booking.place || {};
  const itemName = item.title || item.name || "Experience";
  const itemType = booking.activity ? "Activity" : "Place";
  const guests   = booking.peopleCount || booking.participants || 1;
  const pricing  = booking.pricing || {};
  const coverImg = getImageUrl(item);
  const rating   = getRatingValue(item);
  const locationLabel = formatLocation(item);
  const bookingId = booking.id || booking._id || id;

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Hero success banner ──────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl overflow-hidden text-white p-8 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <SuccessTick />
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Payment Successful!</h1>
            <p className="mt-2 text-emerald-100 text-sm">
              Your booking is confirmed and payment is received.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Booking ref: <RefChip id={bookingId} />
            </div>
          </div>
        </div>

        {/* ── Ticket card ─────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden">

          {/* Cover image */}
          {coverImg ? (
            <div className="relative h-48">
              <img src={coverImg} alt={itemName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <span className="inline-block text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full mb-1.5">
                  {itemType}
                </span>
                <h2 className="text-xl font-bold text-white leading-tight">{itemName}</h2>
                {rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-white/90 font-medium">{Number(rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-24 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 flex items-end px-5 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/30 text-white px-2 py-0.5 rounded-full">
                  {itemType}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{itemName}</h2>
              </div>
            </div>
          )}

          {/* Ticket punch holes + dashed divider */}
          <div className="relative flex items-center px-4">
            <div className="w-5 h-5 -ml-2.5 rounded-full bg-emerald-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-inner" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-600 mx-1" />
            <div className="w-5 h-5 -mr-2.5 rounded-full bg-emerald-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-inner" />
          </div>

          {/* Booking details */}
          <div className="p-6 space-y-5">

            {/* Status pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Confirmed & Paid
                </span>
              </div>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold px-3 py-1 rounded-full">
                ✓ Active
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailRow icon={Calendar} label="Date"     value={fmtDate(booking.date)} />
              <DetailRow icon={Users}    label="Guests"   value={`${guests} ${guests === 1 ? "person" : "people"}`} />
              {booking.time && <DetailRow icon={Clock} label="Time" value={booking.time} />}
              {locationLabel && (
                <DetailRow icon={MapPin} label="Location" value={locationLabel} />
              )}
            </div>

            {/* Contact */}
            {(booking.customer?.name || booking.customer?.email) && (
              <>
                <div className="h-px bg-gray-100 dark:bg-gray-700" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Guest Details
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {booking.customer.name && (
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {booking.customer.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {booking.customer.email && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Mail className="h-3.5 w-3.5" /> {booking.customer.email}
                        </span>
                      )}
                      {booking.customer.phone && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5" /> {booking.customer.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Pricing */}
            <div className="h-px bg-gray-100 dark:bg-gray-700" />
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Payment Summary
              </p>
              {pricing.basePrice > 0 && (
                <PriceRow
                  label={`Base price × ${guests}`}
                  value={INR(pricing.subtotal || pricing.basePrice * guests)}
                />
              )}
              {pricing.groupDiscount > 0 && (
                <PriceRow
                  label={`Group discount${pricing.groupDiscountRate ? ` (${Math.round(pricing.groupDiscountRate * 100)}%)` : ""}`}
                  value={`− ${INR(pricing.groupDiscount)}`}
                  discount
                />
              )}
              {pricing.tax > 0 && (
                <PriceRow label="Tax (18% GST)" value={INR(pricing.tax)} />
              )}
              {pricing.serviceFee > 0 && (
                <PriceRow label="Service fee" value={INR(pricing.serviceFee)} />
              )}
              {pricing.promoDiscount > 0 && (
                <PriceRow
                  label={`Promo discount${pricing.promoCode ? ` (${pricing.promoCode})` : ""}`}
                  value={`− ${INR(pricing.promoDiscount)}`}
                  discount
                />
              )}

              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total Paid</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {INR(booking.totalAmount)}
                </span>
              </div>

              {booking.paymentId && (
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono pt-1">
                  Txn: {booking.paymentId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Special requests ─────────────────────────────────────────────── */}
        {booking.specialRequests && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex gap-3">
            <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                Special Requests
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">{booking.specialRequests}</p>
            </div>
          </div>
        )}

        {/* ── What's next ──────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">What happens next?</h3>
          <div className="space-y-0">
            <NextStep
              step={1}
              icon={Mail}
              title="Check your email"
              desc="A confirmation email with your booking details has been sent to your registered address."
            />
            <NextStep
              step={2}
              icon={Bell}
              title="Reminder before your trip"
              desc="We'll send you a reminder 24 hours before your activity so you don't miss a thing."
            />
            <NextStep
              step={3}
              icon={Star}
              title="Enjoy & review"
              desc="Have an amazing experience! After your activity, share your feedback to help other travellers."
            />
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 font-semibold py-3 px-4 rounded-2xl transition-all text-sm"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={handleDownloadReceipt}
            disabled={downloadingReceipt}
            className="flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold py-3 px-4 rounded-2xl transition-all text-sm"
          >
            <Download className="h-4 w-4" /> {downloadingReceipt ? "Downloading..." : "Receipt"}
          </button>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Link
            to="/account/bookings"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 rounded-2xl transition-colors text-sm shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
          >
            My Bookings <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3.5 px-4 rounded-2xl transition-colors text-sm"
          >
            Explore More
          </Link>
        </div>

      </div>
    </div>
  );
}
