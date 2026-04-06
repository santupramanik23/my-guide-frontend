// src/pages/help/Help.jsx
import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  Mail,
  MessageCircle,
  Send,
  ArrowLeft,
} from "lucide-react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const QUICK_LINKS = [
  {
    icon: BookOpen,
    title: "Getting Started",
    desc: "New to MyGuide? Learn the basics of booking and exploring activities.",
    to: "#getting-started",
    color: "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  },
  {
    icon: Calendar,
    title: "My Bookings",
    desc: "View, manage, or cancel your upcoming and past trip bookings.",
    to: "/account/bookings",
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  },
  {
    icon: CreditCard,
    title: "Payment Issues",
    desc: "Resolve billing problems, refunds, and payment method questions.",
    to: "#payment-issues",
    color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Settings,
    title: "Account Settings",
    desc: "Update your profile, preferences, notifications, and privacy settings.",
    to: "/settings",
    color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  },
];

const FAQS = [
  {
    id: "faq-1",
    question: "How do I book an activity on MyGuide?",
    answer:
      "Browse activities by searching for a destination or category. Click on any activity card to view details, select your preferred date and number of participants, then proceed to checkout. You'll receive a confirmation email once the booking is complete.",
  },
  {
    id: "faq-2",
    question: "Can I cancel or modify my booking?",
    answer:
      "Yes. Navigate to My Bookings from your dashboard or the account menu. Each booking shows a 'Cancel' or 'Modify' option. Cancellations made more than 48 hours before the activity are fully refunded. Modifications are subject to availability.",
  },
  {
    id: "faq-3",
    question: "How long does a refund take to process?",
    answer:
      "Refunds are typically processed within 5–7 business days after approval. The exact time depends on your bank or payment provider. You'll receive an email notification once the refund has been initiated from our side.",
  },
  {
    id: "faq-4",
    question: "What payment methods are accepted?",
    answer:
      "MyGuide accepts all major credit and debit cards (Visa, Mastercard, RuPay), UPI, net banking, and popular wallets. All transactions are secured with SSL encryption and PCI-DSS compliance.",
  },
  {
    id: "faq-5",
    question: "How do I become a guide or instructor on MyGuide?",
    answer:
      "Sign up for a MyGuide account and navigate to Settings. Under your role settings, submit a guide or instructor application with your credentials and experience. Our team reviews applications within 3–5 business days.",
  },
  {
    id: "faq-6",
    question: "What happens if a guide cancels the activity?",
    answer:
      "If a guide cancels, you'll receive an immediate notification and a full refund within 3–5 business days. We'll also suggest alternative similar activities in the same area as a courtesy.",
  },
  {
    id: "faq-7",
    question: "How do reviews and ratings work?",
    answer:
      "After completing an activity, you'll receive a review request. Reviews are verified — only users who actually completed the booking can leave feedback. Ratings are averaged across all verified reviews to form a guide's overall score.",
  },
  {
    id: "faq-8",
    question: "Is my personal data safe with MyGuide?",
    answer:
      "We take data privacy seriously. Your data is stored securely, never sold to third parties, and is only shared with guides strictly for trip coordination. You can review and control all data sharing in Settings → Privacy, and request a full data download at any time.",
  },
];

const SUBJECTS = [
  "Booking Issue",
  "Payment Problem",
  "Account Issue",
  "General Inquiry",
  "Other",
];

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-12 text-white mb-10">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-10 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">How can we help you?</h1>
        <p className="text-violet-100 mb-6">
          Search our knowledge base or browse the topics below. Our support team is always here for you.
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300 pointer-events-none" />
          <input
            type="search"
            placeholder="Search for help..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm placeholder-violet-200 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          />
        </div>
      </div>
    </div>
  );
}

function QuickLinks() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_LINKS.map(({ icon: Icon, title, desc, to, color }) => (
          <Link
            key={title}
            to={to}
            className="group flex flex-col gap-3 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mt-auto" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const handleToggle = useCallback((id) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {FAQS.map(({ id, question, answer }) => {
          const isOpen = openFaq === id;
          return (
            <div
              key={id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            >
              <button
                onClick={() => handleToggle(id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-inset"
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm pr-4">{question}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </button>
              <div
                className={[
                  "px-5 overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-96 pb-4" : "max-h-0",
                ].join(" ")}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection({ user }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!form.subject) errs.subject = "Please select a subject.";
    if (!form.message.trim()) {
      errs.message = "Message is required.";
    } else if (form.message.trim().length < 20) {
      errs.message = "Message must be at least 20 characters.";
    }
    return errs;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 1500));
    setSubmitting(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm((prev) => ({ ...prev, subject: "", message: "" }));
  }, [form, validate]);

  const inputBase =
    "w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";
  const inputNormal = `${inputBase} border-gray-300 dark:border-gray-600`;
  const inputError  = `${inputBase} border-red-400 dark:border-red-500`;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Contact Support</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form below and we'll respond as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="support-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Name
                    </label>
                    <input
                      id="support-name"
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      className={errors.name ? inputError : inputNormal}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="support-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email
                    </label>
                    <input
                      id="support-email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      className={errors.email ? inputError : inputNormal}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="support-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Subject
                  </label>
                  <select
                    id="support-subject"
                    value={form.subject}
                    onChange={handleChange("subject")}
                    className={errors.subject ? inputError : inputNormal}
                  >
                    <option value="">Select a topic…</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="support-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="support-message"
                    value={form.message}
                    onChange={handleChange("message")}
                    rows={5}
                    className={errors.message ? inputError : inputNormal}
                    placeholder="Describe your issue in detail (min 20 characters)…"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                  <p className="mt-1 text-xs text-gray-400">{form.message.length} chars</p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" loading={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Support Channels */}
        <div className="lg:col-span-2 space-y-4">
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Support Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* System Status */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  All systems operational
                </span>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Email Support</p>
                  <a
                    href="mailto:support@myguide.com"
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    support@myguide.com
                  </a>
                  <p className="text-xs text-gray-400 mt-0.5">We respond within 24 hours</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">Mon–Sat, 9 AM – 6 PM IST</p>
                  <a
                    href="https://wa.me/911234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Response Times */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Response Times
                </p>
                {[
                  { channel: "Email", time: "Within 24 hours" },
                  { channel: "WhatsApp", time: "Within 2 hours" },
                  { channel: "Urgent issues", time: "Within 4 hours" },
                ].map(({ channel, time }) => (
                  <div key={channel} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">{channel}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function BottomCta() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-800 dark:to-violet-900/20 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="font-bold text-gray-900 dark:text-white text-lg">Still need help?</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Our team responds within 24 hours on business days.
        </p>
      </div>
      <a
        href="mailto:support@myguide.com"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors flex-shrink-0"
      >
        <Mail className="h-4 w-4" />
        Email us now
      </a>
    </div>
  );
}

/* ─── Page content (used in both layouts) ────────────────────────────────────── */
function HelpContent({ user }) {
  return (
    <>
      <HeroSection />
      <QuickLinks />
      <FaqSection />
      <ContactSection user={user} />
      <BottomCta />
    </>
  );
}

/* ─── Standalone layout (unauthenticated) ────────────────────────────────────── */
function StandaloneLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-violet-600 dark:text-violet-400">
            MyGuide
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {children}
      </main>
    </div>
  );
}

/* ─── Help Page ──────────────────────────────────────────────────────────────── */
export default function Help() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return (
      <DashboardLayout role={user.role} title="Help & Support" user={user}>
        <HelpContent user={user} />
      </DashboardLayout>
    );
  }

  return (
    <StandaloneLayout>
      <HelpContent user={null} />
    </StandaloneLayout>
  );
}
