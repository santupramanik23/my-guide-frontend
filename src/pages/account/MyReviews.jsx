import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, MapPin, ThumbsUp, MessageSquare, Calendar, Filter } from "lucide-react";
import { useSampleDataStore } from "@/store/sampleData";
import { useAuthStore } from "@/store/auth";

const DEMO_TRAVELLER_ID = '4';

function StarRating({ rating, size = "sm" }) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${starSize} ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        />
      ))}
    </div>
  );
}

export default function MyReviews() {
  const { user } = useAuthStore();
  const { reviews, activities, places } = useSampleDataStore();
  const [filterRating, setFilterRating] = useState("all");

  const effectiveUserId = useMemo(() => {
    const hasData = reviews.some(r => r.userId === user?.id);
    return hasData ? user?.id : DEMO_TRAVELLER_ID;
  }, [reviews, user?.id]);

  const userReviews = useMemo(() => {
    return reviews
      .filter((r) => r.userId === effectiveUserId)
      .map((review) => {
        const activity = activities.find((a) => a.id === review.activityId);
        const place = activity ? places.find((p) => p.id === activity.placeId) : null;
        return { ...review, activity, place };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, user?.id, activities, places]);

  const filteredReviews = useMemo(() => {
    if (filterRating === "all") return userReviews;
    return userReviews.filter((r) => r.rating === Number(filterRating));
  }, [userReviews, filterRating]);

  const avgRating =
    userReviews.length > 0
      ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
      : "—";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: userReviews.filter((r) => r.rating === star).length,
  }));

  return (
    <DashboardLayout role="traveller" title="My Reviews" user={user}>
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-white">
        <h1 className="text-2xl font-bold mb-1">My Reviews</h1>
        <p className="opacity-90">Your experiences, shared with the community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h2>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">{avgRating}</div>
                <StarRating rating={Math.round(Number(avgRating))} size="lg" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {userReviews.length} review{userReviews.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="space-y-2">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-4">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: userReviews.length ? `${(count / userReviews.length) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-4">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter by Rating
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterRating("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterRating === "all"
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  All Ratings ({userReviews.length})
                </button>
                {ratingCounts.map(({ star, count }) => (
                  <button
                    key={star}
                    onClick={() => setFilterRating(String(star))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      filterRating === String(star)
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {star} Star{star !== 1 ? "s" : ""} ({count})
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main: review list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Complete an activity and share your experience!
                </p>
                <Link
                  to="/search"
                  className="inline-flex px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Explore Activities
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  {/* Activity info */}
                  <div className="flex items-start gap-4 mb-4">
                    {review.activity?.images?.[0] && (
                      <img
                        src={review.activity.images[0]}
                        alt={review.activity.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/activities/${review.activityId}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {review.activity?.title || "Unknown Activity"}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {review.place?.name || "Unknown Place"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Review content */}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{review.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      Helpful ({review.helpful})
                    </button>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      review.rating >= 4
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : review.rating === 3
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    }`}>
                      {review.rating >= 4 ? "Positive" : review.rating === 3 ? "Neutral" : "Critical"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
