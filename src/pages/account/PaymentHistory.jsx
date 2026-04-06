import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { CreditCard, MapPin, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSampleDataStore } from "@/store/sampleData";
import { useAuthStore } from "@/store/auth";

const DEMO_TRAVELLER_ID = '4';

const STATUS_CONFIG = {
  confirmed: { label: "Paid", icon: CheckCircle, classes: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" },
  pending:   { label: "Pending", icon: Clock,        classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300" },
  cancelled: { label: "Refunded", icon: XCircle,    classes: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" },
};

const METHOD_ICONS = {
  UPI: "🔵",
  Card: "💳",
  "Net Banking": "🏦",
};

export default function PaymentHistory() {
  const { user } = useAuthStore();
  const { bookings, activities, places } = useSampleDataStore();
  const [filterStatus, setFilterStatus] = useState("all");

  const effectiveUserId = useMemo(() => {
    const hasData = bookings.some(b => b.userId === user?.id);
    return hasData ? user?.id : DEMO_TRAVELLER_ID;
  }, [bookings, user?.id]);

  const userPayments = useMemo(() => {
    return bookings
      .filter((b) => b.userId === effectiveUserId)
      .map((booking) => {
        const activity = activities.find((a) => a.id === booking.activityId);
        const place = activity ? places.find((p) => p.id === activity.placeId) : null;
        return { ...booking, activity, place };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings, user?.id, activities, places]);

  const filteredPayments = useMemo(() => {
    if (filterStatus === "all") return userPayments;
    return userPayments.filter((p) => p.status === filterStatus);
  }, [userPayments, filterStatus]);

  const stats = useMemo(() => {
    const paid = userPayments.filter((p) => p.status === "confirmed");
    const totalPaid = paid.reduce((sum, p) => sum + p.totalAmount, 0);
    const refunded = userPayments.filter((p) => p.status === "cancelled");
    const totalRefunded = refunded.reduce((sum, p) => sum + p.totalAmount, 0);
    return { totalPaid, totalRefunded, count: paid.length };
  }, [userPayments]);

  return (
    <DashboardLayout role="traveller" title="Payment History" user={user}>
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white">
        <h1 className="text-2xl font-bold mb-1">Payment History</h1>
        <p className="opacity-90">Track all your transactions in one place.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₹{stats.totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Refunded</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₹{stats.totalRefunded.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["all", "confirmed", "pending", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filterStatus === status
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Payments list */}
      <Card>
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
              <p className="text-gray-500 dark:text-gray-400">Book an activity to see your payments here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredPayments.map((payment, idx) => {
                const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.icon;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Activity image */}
                    {payment.activity?.images?.[0] ? (
                      <img
                        src={payment.activity.images[0]}
                        alt={payment.activity.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {payment.activity?.title || "Unknown Activity"}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {payment.place?.name || "Unknown Place"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                        {payment.paymentMethod && (
                          <span>
                            {METHOD_ICONS[payment.paymentMethod] || "💳"} {payment.paymentMethod}
                          </span>
                        )}
                      </div>
                      {payment.paymentId && (
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5 font-mono">
                          {payment.paymentId}
                        </p>
                      )}
                    </div>

                    {/* Amount & status */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white">₹{payment.totalAmount.toLocaleString()}</p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium mt-1 ${statusCfg.classes}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
