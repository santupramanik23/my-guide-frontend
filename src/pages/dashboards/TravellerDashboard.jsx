
import React, { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import StatCard from "@/components/Layout/StatCard";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  MapPin, 
  Calendar, 
  Heart,
  Star,
  Clock,
  DollarSign,
  Camera,
  Compass,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { useSampleDataStore } from "@/store/sampleData";
import { useAuthStore } from "@/store/auth";

// Demo fallback: sample data uses hardcoded IDs; if no match for real user, show traveller demo data
const DEMO_TRAVELLER_ID = '4';

export default function TravellerDashboard() {
  const { user } = useAuthStore();
  const { activities, places, bookings } = useSampleDataStore();

  // Use real user ID if it matches sample data, else fall back to demo traveller
  const effectiveUserId = useMemo(() => {
    const hasData = bookings.some(b => b.userId === user?.id);
    return hasData ? user?.id : DEMO_TRAVELLER_ID;
  }, [bookings, user?.id]);

  // Get user's bookings
  const userBookings = useMemo(() => {
    return bookings.filter(booking => booking.userId === effectiveUserId);
  }, [bookings, effectiveUserId]);

  // Calculate stats
  const stats = useMemo(() => {
    const confirmedBookings = userBookings.filter(b => b.status === 'confirmed');
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const upcomingBookings = confirmedBookings.filter(b => new Date(b.bookingDate) > new Date());
    
    return {
      totalBookings: userBookings.length,
      upcomingTrips: upcomingBookings.length,
      totalSpent,
      placesVisited: new Set(confirmedBookings.map(b => {
        const activity = activities.find(a => a.id === b.activityId);
        return activity?.placeId;
      }).filter(Boolean)).size
    };
  }, [userBookings, activities]);

  const metrics = [
    {
      icon: MapPin,
      label: "Upcoming Trips",
      value: stats.upcomingTrips.toString(),
      trend: { direction: "up", value: "+2" },
      color: "primary",
      to: "/account/bookings",
    },
    {
      icon: Calendar,
      label: "Total Bookings",
      value: stats.totalBookings.toString(),
      trend: { direction: "up", value: "+3" },
      color: "success",
    },
    {
      icon: DollarSign,
      label: "Total Spent",
      value: `₹${stats.totalSpent.toLocaleString()}`,
      trend: { direction: "up", value: "+12%" },
      color: "warning",
    },
    {
      icon: Star,
      label: "Places Visited",
      value: stats.placesVisited.toString(),
      trend: { direction: "up", value: "+2" },
      color: "purple",
    },
  ];

  // Featured activities for discovery
  const featuredActivities = useMemo(() => {
    return activities.filter(a => a.featured && a.isPublished).slice(0, 4);
  }, [activities]);

  // Recent bookings
  const recentBookings = useMemo(() => {
    return userBookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(booking => {
        const activity = activities.find(a => a.id === booking.activityId);
        const place = activity ? places.find(p => p.id === activity.placeId) : null;
        return { ...booking, activity, place };
      });
  }, [userBookings, activities, places]);

  return (
    <DashboardLayout role="traveller" title="My Travel Dashboard" user={user}>
      
      {/* Welcome Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="opacity-90">Ready for your next adventure? Discover amazing experiences waiting for you.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, i) => (
          <StatCard key={i} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Bookings */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Bookings
                </h2>
                <Link
                  to="/account/bookings"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  View All
                </Link>
              </div>
              
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start exploring and book your first adventure!
                  </p>
                  <Link to="/search">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Explore Activities
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {booking.activity?.images?.[0] && (
                        <img
                          src={booking.activity.images[0]}
                          alt={booking.activity.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {booking.activity?.title || 'Unknown Activity'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.place?.name || 'Unknown Place'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ₹{booking.totalAmount}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discover New Activities */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Discover New Adventures
                </h2>
                <Link 
                  to="/search" 
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Explore All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredActivities.map((activity) => {
                  const place = places.find(p => p.id === activity.placeId);
                  return (
                    <Link 
                      key={activity.id} 
                      to={`/activities/${activity.id}`}
                      className="group block"
                    >
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={activity.images[0]}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                              <Star className="h-3 w-3" />
                              Featured
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                              ₹{activity.price}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {activity.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {place?.name || 'Unknown Place'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.durationMinutes}min
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link 
                  to="/search"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <Compass className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Explore Activities</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Find new adventures</div>
                  </div>
                </Link>
                
                <Link
                  to="/account/bookings"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">My Bookings</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">View your trips</div>
                  </div>
                </Link>

                <Link
                  to="/account/wishlist"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Wishlist</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Saved favorites</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Travel Tips */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 inline-flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Travel Tips
              </h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Best Time to Visit Kolkata</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    October to March offers pleasant weather for outdoor activities.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-200 mb-1">Local Transport</h3>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Metro and trams are convenient for reaching major attractions.
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-1">Food Safety</h3>
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Try street food from busy stalls for authentic experiences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Widget */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Weather</h2>
              
              <div className="text-center">
                <div className="text-4xl mb-2">☀️</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">28°C</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sunny • Perfect for sightseeing
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-gray-500">High</div>
                    <div className="font-medium">32°C</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Low</div>
                    <div className="font-medium">24°C</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
