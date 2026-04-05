import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle, Users, Mail, Phone, User, Loader2, MapPin, Clock,
  CreditCard, CheckCircle2, Star, Info, ArrowLeft, X, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { api, useAuthStore } from "@/store/auth";
import { initiateRazorpayPayment, loadRazorpayScript } from "@/utils/razorpayUtils";
import toast from "react-hot-toast";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n || 0));

const fmtDuration = (m) => {
  if (!m) return null;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

const todayISO = () => new Date().toISOString().split("T")[0];

const PROMO_CODES = { WELCOME10: 0.10, SAVE5: 0.05 };
const DEFAULT_MAX_GUESTS = 50;
const GUEST_RANGE_STEPS = [
  { min: 1, max: 5 },
  { min: 6, max: 10 },
  { min: 11, max: 20 },
  { min: 21, max: 50 },
];

function getGroupDiscountMeta(guests) {
  if (guests >= 21) return { rate: 0.15, label: "Large group discount (15%)" };
  if (guests >= 11) return { rate: 0.10, label: "Team booking discount (10%)" };
  if (guests >= 5) return { rate: 0.05, label: "Small group discount (5%)" };
  return { rate: 0, label: "" };
}

/* ── component ───────────────────────────────────────────────────────────── */
export default function BookingFlow() {
  const nav = useNavigate();
  const [q] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const itemId   = q.get("activity") || q.get("place");
  const itemType = q.get("place") ? "place" : "activity";

  const [loading,    setLoading]    = useState(true);
  const [item,       setItem]       = useState(null);
  const [error,      setError]      = useState("");
  const [step,       setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 0
  const [date,   setDate]   = useState(q.get("date")   || "");
  const [guests, setGuests] = useState(q.get("guests") || "1");
  const [promo,  setPromo]  = useState("");

  // Step 1
  const [name,    setName]    = useState(user?.name  || "");
  const [email,   setEmail]   = useState(user?.email || "");
  const [phone,   setPhone]   = useState(user?.phone || "");
  const [special, setSpecial] = useState("");

  // Step 2
  const [agree, setAgree] = useState(false);

  /* fetch item details */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!itemId) { setError("No item selected."); setLoading(false); return; }
      try {
        setLoading(true); setError("");
        const endpoint = itemType === "place" ? `/places/${itemId}` : `/activities/${itemId}`;
        const r = await api.get(endpoint);
        const data = itemType === "place"
          ? (r?.data?.data?.place || r?.data?.data || r?.data)
          : (r?.data?.data?.activity || r?.data?.data || r?.data);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setError("Failed to load item details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [itemId, itemType]);

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  /* pricing */
  const pricing = useMemo(() => {
    const base    = typeof item?.basePrice === "number" ? item.basePrice
                  : typeof item?.price     === "number" ? item.price
                  : 99;
    const g        = Number(guests || 1);
    const subtotal = base * g;
    const groupMeta = getGroupDiscountMeta(g);
    const groupDiscount = groupMeta.rate ? Math.floor(subtotal * groupMeta.rate) : 0;
    const tax      = Math.round(subtotal * 0.18);
    const fee      = Math.round(subtotal * 0.05);
    const disc     = PROMO_CODES[promo.trim().toUpperCase()] || 0;
    const promoDiscount = disc ? Math.floor(subtotal * disc) : 0;
    const totalDiscount = groupDiscount + promoDiscount;
    const total    = Math.max(0, subtotal + tax + fee - totalDiscount);
    return {
      base,
      g,
      subtotal,
      tax,
      fee,
      groupDiscount,
      groupDiscountRate: groupMeta.rate,
      groupDiscountLabel: groupMeta.label,
      promoCode: promo.trim().toUpperCase(),
      promoDiscount,
      promoOff: totalDiscount,
      total,
    };
  }, [item, guests, promo]);

  /* validation */
  const validDate    = !!date && date >= todayISO();
  const maxGuestsAllowed = useMemo(() => {
    const configuredCapacity = Number(item?.capacity || item?.maxGuests);
    return Number.isFinite(configuredCapacity) && configuredCapacity > 0
      ? configuredCapacity
      : DEFAULT_MAX_GUESTS;
  }, [item]);
  const guestCount = Number(guests);
  const validGuests  = Number.isInteger(guestCount) && guestCount >= 1 && guestCount <= maxGuestsAllowed;
  const validContact = name.trim().length >= 2
    && /\S+@\S+\.\S+/.test(email)
    && phone.replace(/\D/g, "").length >= 10;

  useEffect(() => {
    const guestCount = Number(guests || 1);
    if (guestCount > maxGuestsAllowed) {
      setGuests(String(maxGuestsAllowed));
    }
  }, [guests, maxGuestsAllowed]);

  const canNext =
    step === 0 ? validDate && validGuests
    : step === 1 ? validContact
    : agree;

  /* submit — creates booking then triggers Razorpay */
  const submit = async () => {
    if (!agree) { toast.error("Please agree to the terms"); return; }
    if (!isAuthenticated) {
      nav("/auth/login", { state: { returnTo: `/booking?${itemType}=${itemId}&date=${date}&guests=${guests}` } });
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // ── 1. Create booking (status: pending, paymentStatus: pending) ───────
      const bookingPayload = {
        [`${itemType}Id`]: itemId,
        date,
        participants:      Number(guests),
        peopleCount:       Number(guests),
        participantDetails: [{ name: name.trim(), email: email.trim(), phone: phone.trim() }],
        customer:           { name: name.trim(), email: email.trim(), phone: phone.trim() },
        specialRequests:    special.trim(),
        pricing: {
          basePrice:  pricing.base,
          subtotal:   pricing.subtotal,
          groupDiscount: pricing.groupDiscount,
          groupDiscountRate: pricing.groupDiscountRate,
          promoCode: pricing.promoCode,
          promoDiscount: pricing.promoDiscount,
          tax:        pricing.tax,
          serviceFee: pricing.fee,
          promoOff:   pricing.promoOff,
          total:      pricing.total,
        },
        totalAmount: pricing.total,
      };

      const bookingRes = await api.post("/bookings", bookingPayload);
      const bookingData = bookingRes?.data?.data || bookingRes?.data;
      const booking     = bookingData?.booking || bookingData;
      const bookingId   = booking?._id || booking?.id;

      if (!bookingId) throw new Error("Booking creation failed — no ID returned");

      // ── 2. Create Razorpay order (amount from DB, not client) ─────────────
      const orderRes = await api.post("/payments/create-order", { bookingId });
      const { orderId, amount, currency, keyId } = orderRes.data?.data || {};

      if (!orderId) throw new Error("Failed to create payment order");

      // ── 3. Open Razorpay checkout ─────────────────────────────────────────
      await new Promise((resolve, reject) => {
        initiateRazorpayPayment({
          orderId,
          // amount from server is already in paise; divide by 100 for the utility
          amount:      amount / 100,
          currency:    currency || "INR",
          keyId,
          bookingId,
          activityName: item?.title || item?.name || "Tour Booking",
          prefill:     { name: name.trim(), email: email.trim(), phone: phone.trim() },

          // ── 4. On success: verify signature server-side ───────────────────
          onSuccess: async ({ orderId: rzpOrderId, paymentId, signature }) => {
            try {
              await api.post("/payments/verify", {
                orderId:   rzpOrderId,
                paymentId,
                signature,
                bookingId,
              });
              toast.success("Payment successful! Booking confirmed.");
              nav(`/booking/confirm?id=${bookingId}`, { replace: true });
              resolve();
            } catch (err) {
              const msg = err?.response?.data?.message || "Payment verification failed";
              toast.error(msg);
              reject(new Error(msg));
            }
          },

          onFailure: (err) => {
            const msg = err?.description || err?.message || "Payment failed or cancelled";
            toast.error(msg);
            reject(new Error(msg));
          },
        });
      });

    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Something went wrong";
      setError(msg);
      if (!msg.toLowerCase().includes("cancel")) toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading / error states ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading details…</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 grid place-items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Item Unavailable</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "This item is not available for booking."}</p>
        <div className="flex gap-3 justify-center">
          <Button as={Link} to="/search" variant="outline">Browse Activities</Button>
          <Button as={Link} to="/">Go Home</Button>
        </div>
      </div>
    );
  }

  const title    = item.title || item.name || "Experience";
  const city     = item?.place?.city || item?.city;
  const duration = item.duration || fmtDuration(item.durationMinutes);
  const rating   = item?.rating?.avg || item?.averageRating;

  const STEPS = ["Details", "Contact", "Payment"];

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          to={`/${itemType === "place" ? "places" : "activities"}/${itemId}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {itemType}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Booking</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Follow the steps to confirm and pay for your reservation</p>

        {/* Stepper */}
        <div className="mb-8 max-w-xl">
          <div className="flex items-center">
            {STEPS.map((label, i) => {
              const done   = i < step;
              const active = i === step;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full grid place-items-center text-sm font-semibold transition-all ${
                      done   ? "bg-primary-600 text-white"
                      : active ? "bg-primary-100 text-primary-700 ring-4 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-300"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    }`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${active ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 -mt-5 rounded-full ${done ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Item summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/20 dark:to-blue-900/20 grid place-items-center text-3xl flex-shrink-0">
                    {itemType === "place" ? "📍" : "🎯"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      {city     && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{city}</span>}
                      {duration && <span className="inline-flex items-center gap-1"><Clock  className="h-4 w-4" />{duration}</span>}
                      {rating   && <span className="inline-flex items-center gap-1"><Star  className="h-4 w-4 fill-yellow-400 text-yellow-400" />{Number(rating).toFixed(1)}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error banner */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Step card */}
            <Card>
              <CardContent className="p-6 space-y-6">

                {/* Step 0: Details */}
                {step === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date & Guests</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <DatePicker
                          label={<>Date <span className="text-red-500">*</span></>}
                          value={date}
                          min={todayISO()}
                          onChange={setDate}
                          placeholder="Choose a date"
                          error={date && !validDate ? "Date must be today or later" : ""}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Guests <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            min={1}
                            max={maxGuestsAllowed}
                            step={1}
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            placeholder={`Enter 1 to ${maxGuestsAllowed}`}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {GUEST_RANGE_STEPS
                            .filter((range) => range.min <= maxGuestsAllowed)
                            .map((range) => {
                              const rangeMax = Math.min(range.max, maxGuestsAllowed);
                              const isActive = guestCount >= range.min && guestCount <= rangeMax;

                              return (
                                <button
                                  key={`${range.min}-${range.max}`}
                                  type="button"
                                  onClick={() => setGuests(String(range.min))}
                                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    isActive
                                      ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  {range.min}-{rangeMax} guests
                                </button>
                              );
                            })}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter the exact group size. Range buttons are shortcuts.
                        </p>
                        {!validGuests && guests !== "" ? (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            Guest count must be between 1 and {maxGuestsAllowed}.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Flexible Booking</p>
                        <p>Free cancellation up to 24 hours before your activity starts.</p>
                      </div>
                    </div>

                    {pricing.groupDiscount > 0 && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-emerald-800 dark:text-emerald-200">
                          <p className="font-medium mb-1">{pricing.groupDiscountLabel}</p>
                          <p>
                            Your group of {pricing.g} gets an automatic saving of {INR(pricing.groupDiscount)}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Contact */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Priya Sharma"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel" value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^\d+ -]/g, ""))}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Special Requests
                        </label>
                        <textarea
                          value={special} onChange={(e) => setSpecial(e.target.value)} rows={3}
                          placeholder="Any dietary requirements, accessibility needs, etc. (optional)"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Review & Pay */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Pay</h3>

                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500">Activity</span>
                        <span className="font-medium">{title}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium">
                          {date ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500">Guests</span>
                        <span className="font-medium">{guests}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500">Contact</span>
                        <span className="font-medium">{name} · {email}</span>
                      </div>
                    </div>

                    {/* Promo code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Promo Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={promo}
                          onChange={(e) => setPromo(e.target.value.toUpperCase())}
                          placeholder="e.g. WELCOME10"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white text-sm uppercase"
                        />
                        {promo && PROMO_CODES[promo] && (
                          <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Applied
                          </span>
                        )}
                        {promo && !PROMO_CODES[promo] && (
                          <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm">
                            <X className="h-4 w-4" /> Invalid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Payment method notice */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-2">
                      <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium mb-1">Secure Payment via Razorpay</p>
                        <p>You'll be redirected to Razorpay's secure checkout. Supports UPI, cards, net banking, and wallets.</p>
                      </div>
                    </div>

                    {/* T&C */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-primary-600"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        I agree to the{" "}
                        <a href="/terms" className="text-primary-600 dark:text-primary-400 underline">Terms & Conditions</a>{" "}
                        and{" "}
                        <a href="/cancellation" className="text-primary-600 dark:text-primary-400 underline">Cancellation Policy</a>.
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="pt-2 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || submitting}
                  >
                    Back
                  </Button>

                  {step < 2 ? (
                    <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                      Continue <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={submit}
                      disabled={!canNext || submitting}
                      className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing…</>
                      ) : (
                        <><CreditCard className="h-4 w-4 mr-2" />Pay {INR(pricing.total)}</>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right rail: Order Summary ────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Order Summary</h3>
                    <span className="text-xs text-gray-500">Instant confirmation</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">{INR(pricing.base)} × {pricing.g} guest{pricing.g > 1 ? "s" : ""}</span>
                      <span className="font-medium">{INR(pricing.subtotal)}</span>
                    </div>
                    {pricing.groupDiscount > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400">
                        <span>{pricing.groupDiscountLabel}</span>
                        <span className="font-medium">−{INR(pricing.groupDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Tax (18%)</span>
                      <span className="font-medium">{INR(pricing.tax)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Service fee (5%)</span>
                      <span className="font-medium">{INR(pricing.fee)}</span>
                    </div>
                    {pricing.promoDiscount > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400">
                        <span>Promo discount{pricing.promoCode ? ` (${pricing.promoCode})` : ""}</span>
                        <span className="font-medium">−{INR(pricing.promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 mt-1 border-t border-gray-200 dark:border-gray-700 text-base font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{INR(pricing.total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {[
                      "🔒 Secure SSL payment",
                      "🔄 Free cancellation (24h)",
                      "📧 Instant email confirmation",
                    ].map((f) => (
                      <div key={f} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        {f}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
