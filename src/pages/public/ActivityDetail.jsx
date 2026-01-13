import React, { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Share2,
  Heart,
  ShieldCheck,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { api } from "@/store/auth";

const formatINR = (price) =>
  typeof price !== "number"
    ? "INR 0"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price);

const formatDuration = (minutes) => {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const getValidImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.filter((img) => img && typeof img === "string" && img.trim() !== "");
};

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Meera Sen",
    rating: 5,
    date: "Dec 2025",
    title: "Exceptional guide",
    body: "The host was incredibly warm and the itinerary felt premium. Highly recommend.",
  },
  {
    id: 2,
    name: "Arjun Iyer",
    rating: 4,
    date: "Nov 2025",
    title: "Smooth and well planned",
    body: "Booking was easy, and the experience felt curated. Would book again.",
  },
  {
    id: 3,
    name: "Nisha Patel",
    rating: 5,
    date: "Oct 2025",
    title: "Memorable experience",
    body: "Thoughtful touches throughout. Great value for a premium experience.",
  },
];

export default function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/activities/${id}`);

      let activityData = null;
      if (res.data?.data?.activity) {
        activityData = res.data.data.activity;
      } else if (res.data?.activity) {
        activityData = res.data.activity;
      } else if (res.data?.data) {
        activityData = res.data.data;
      } else if (res.data) {
        activityData = res.data;
      }

      if (!activityData) {
        throw new Error("Invalid response format from server");
      }

      setActivity(activityData);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("Activity not found. It may have been removed or does not exist.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to load activity details. Please check your connection and try again.");
      }

      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleImageError = (e) => {
    e.target.src = "/placeholder-image.jpg";
    e.target.className = `${e.target.className} bg-gradient-to-br from-primary-50 to-white`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center max-w-md p-8 bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur rounded-2xl shadow-xl border border-purple-100/70 dark:border-[#2a1a45]">
          <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unable to load activity</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchActivity}>Try Again</Button>
            <Button as={Link} to="/search" variant="outline">
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center max-w-md p-8 bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur rounded-2xl shadow-xl border border-purple-100/70 dark:border-[#2a1a45]">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activity not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The activity you're looking for doesn't exist.</p>
          <Button as={Link} to="/search">Back to Search</Button>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    featured,
    images = [],
    tags = [],
    price,
    basePrice,
    capacity,
    duration,
    durationMinutes,
    averageRating,
    rating,
    totalReviews,
    place,
  } = activity;

  const validImages = getValidImages(images);
  const hasImages = validImages.length > 0;
  const displayTitle = title || "Untitled Activity";
  const displayRating = averageRating || rating?.avg;
  const displayCity = place?.city || activity?.city;
  const displayDuration = duration || (durationMinutes ? formatDuration(durationMinutes) : null);
  const rawPrice = price || basePrice || 0;
  const displayPrice = formatINR(rawPrice);
  const guestText = capacity ? `Up to ${capacity} guests` : "Up to 10 guests";
  const reviews = activity?.reviews?.length ? activity.reviews : MOCK_REVIEWS;
  const reviewCount = totalReviews || rating?.count || reviews.length;
  const baseRating =
    displayRating ||
    (reviews.length
      ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length
      : 4.8);
  const computedAverageRating = Number.isFinite(baseRating) ? baseRating : 4.8;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => Number(review.rating) === stars).length;
    const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, percent };
  });

  return (
    <div className="min-h-screen bg-transparent">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-white h-80 md:h-96 relative shadow-xl border border-purple-100/70 dark:border-[#2a1a45]">
              {hasImages ? (
                <>
                  <img
                    src={validImages[currentImageIndex]}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />

                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {validImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white scale-125"
                                : "bg-white/50 hover:bg-white/70"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">No image</div>
                    <p className="text-sm">No images available</p>
                  </div>
                </div>
              )}

              {featured && (
                <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Popular</span>
                </div>
              )}

              <div className="absolute right-4 top-4">
                <FavoriteButton itemId={id} type="activity" />
              </div>

              {hasImages && validImages.length > 1 && (
                <div className="absolute right-4 bottom-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                  {currentImageIndex + 1} / {validImages.length}
                </div>
              )}
            </div>

            {hasImages && validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary-500 ring-2 ring-primary-200"
                        : "border-purple-100/70 hover:border-purple-200"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${displayTitle} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}

            <Card className="shadow-lg border border-purple-100/70 dark:border-[#2a1a45] rounded-2xl bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{displayTitle}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {displayRating && (
                    <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      <span className="font-medium">
                        {Number(displayRating).toFixed(1)}
                        {reviewCount && ` (${reviewCount} reviews)`}
                      </span>
                    </span>
                  )}

                  {displayCity && (
                    <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">{displayCity}</span>
                    </span>
                  )}

                  {displayDuration && (
                    <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="h-5 w-5 text-primary-600" />
                      <span className="font-medium">{displayDuration}</span>
                    </span>
                  )}

                  {category && (
                    <span className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full text-primary-700 font-medium capitalize border border-primary-100">
                      {category}
                    </span>
                  )}
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {description || "No description available for this activity."}
                  </p>

                  {tags.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">What to expect</h3>
                      <div className="flex flex-wrap gap-3">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-100 capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border border-purple-100/70 dark:border-[#2a1a45] rounded-2xl bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guest reviews</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Verified bookings from premium travelers
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {computedAverageRating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < Math.round(computedAverageRating)
                                ? "text-amber-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                            fill={index < Math.round(computedAverageRating) ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {reviewCount} reviews
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
                  <div className="space-y-3">
                    {ratingBreakdown.map((row) => (
                      <div key={row.stars} className="flex items-center gap-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 w-8">{row.stars}★</div>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-primary-600"
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                          {row.percent}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-purple-100/70 dark:border-[#2a1a45] p-4 bg-white/70 dark:bg-[#1a1230]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900 dark:text-white">{review.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{review.date}</div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? "text-amber-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                              fill={index < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {review.title}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{review.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="self-start sticky top-6 shadow-xl border border-purple-100/70 dark:border-[#2a1a45] rounded-2xl bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{displayTitle}</h2>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                {displayRating && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 text-sm font-semibold border border-emerald-200">
                    <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                    {Number(displayRating).toFixed(1)} {reviewCount ? `(${reviewCount})` : ""}
                  </span>
                )}
                {displayCity && (
                  <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-sm">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    {displayCity}
                  </span>
                )}
                {displayDuration && (
                  <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-sm">
                    <Clock className="h-4 w-4 text-primary-600" />
                    {displayDuration}
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-full text-sm text-primary-700 capitalize border border-primary-100">
                    {category}
                  </span>
                )}
              </div>

              <div className="mb-6 p-4 bg-white/80 dark:bg-[#1a1230] rounded-xl space-y-3 border border-purple-100/70 dark:border-[#2a1a45]">
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Free cancellation up to 24 hours before</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Reserve now & pay later</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Instant confirmation</span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-primary-50/80 rounded-xl border border-primary-100">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">From</span>
                    <span className="text-3xl font-bold text-primary-700">{displayPrice}</span>
                  </div>
                  <span className="text-sm text-gray-600">per person</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <Button
                  as={Link}
                  to={`/booking?activity=${id}`}
                  size="lg"
                  fullWidth
                  className="h-12 text-base font-semibold bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl"
                >
                  Reserve your spot
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  startIcon={<Heart className="h-5 w-5" />}
                  className="h-12 border-purple-200 text-gray-700 hover:bg-purple-50"
                >
                  Add to wishlist
                </Button>
              </div>

              <div className="pt-4 border-t border-purple-100/70 dark:border-[#2a1a45] flex items-center justify-between text-sm">
                <button
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share trip</span>
                </button>
                <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>{guestText}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border border-purple-100/70 dark:border-[#2a1a45] rounded-2xl bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About this experience</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {description || "No description available for this activity."}
                  </p>

                  {tags.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">What to expect</h3>
                      <div className="flex flex-wrap gap-3">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium border border-primary-100 capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="h-20 md:hidden" />
      </section>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#120c1f]/95 backdrop-blur border-t border-purple-100/70 dark:border-[#2a1a45]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">From</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatINR(rawPrice)}
            </div>
          </div>
          <Button
            as={Link}
            to={`/booking?activity=${id}`}
            size="md"
            className="px-5 rounded-full font-semibold"
          >
            Reserve your spot
          </Button>
        </div>
      </div>
    </div>
  );
}
