// import React, { useEffect, useState } from "react";
// import { useSearchParams, Link } from "react-router-dom";
// import {
//   CheckCircle2,
//   Loader2,
//   Calendar,
//   Users,
//   MapPin,
//   Clock,
//   Mail,
//   Phone,
//   Download,
//   Share2,
//   ArrowRight,
//   Sparkles,
//   Star,
//   Info
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import { api } from "@/store/auth";
// import toast from "react-hot-toast";

// const INR = (n) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0
//   }).format(Number(n || 0));

// const fmtDate = (d) =>
//   d
//     ? new Date(d).toLocaleDateString("en-IN", {
//         weekday: "long",
//         day: "numeric",
//         month: "long",
//         year: "numeric"
//       })
//     : "N/A";

// export default function BookingConfirm() {
//   const [p] = useSearchParams();
//   const id = p.get("id") || "";
//   const [loading, setLoading] = useState(true);
//   const [booking, setBooking] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       if (!id) {
//         setError("No booking ID provided.");
//         setLoading(false);
//         return;
//       }
//       try {
//         const r = await api.get(`/bookings/${id}`, { silenceToast: true });
//         const data = r?.data?.data || r?.data?.booking || r?.data;
//         const bk = data?.booking || data;
//         if (mounted) setBooking(bk);
//       } catch (e) {
//         if (mounted) setError(e?.response?.data?.message || "Failed to load booking.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   const share = async () => {
//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: "My Booking",
//           url: window.location.href
//         });
//       } else {
//         await navigator.clipboard.writeText(window.location.href);
//         toast.success("Link copied!");
//       }
//     } catch (error) {
//       console.error('Share error:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-transparent grid place-items-center">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
//           <p className="text-gray-600 dark:text-gray-400">Loading your booking...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !booking) {
//     return (
//       <div className="min-h-screen bg-transparent grid place-items-center px-4">
//         <div className="text-center max-w-md">
//           <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full grid place-items-center mx-auto mb-4">
//             
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//             Booking Not Found
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             {error || "We couldn't find this booking."}
//           </p>
//           <div className="flex gap-3 justify-center">
//             <Button as={Link} to="/account/bookings" variant="outline">
//               View My Bookings
//             </Button>
//             <Button as={Link} to="/search">
//               Browse Activities
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const activity = booking.activity || {};
//   const place = booking.place || {};
//   const title = activity.title || place.title || place.name || "Experience";
//   const city = activity.city || activity?.place?.city || place.city;
//   const duration = activity.duration || place.duration;
//   const rating = activity?.rating?.avg;
  
//   //  Fixed: Use correct field names
//   const customer =
//     (booking.participantDetails && booking.participantDetails[0]) ||
//     booking.customer ||
//     {};
//   const participants = booking.participants || booking.peopleCount || 1;
//   const total = booking.totalAmount || booking?.pricing?.total || booking.amount || 0;

//   return (
//     <div className="min-h-screen bg-transparent py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* Success Header */}
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full grid place-items-center mx-auto mb-4 animate-bounce">
//             <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Your reservation has been successfully created
//           </p>
//           <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
//             <span>Booking ID:</span>
//             <code className="font-mono text-primary-600 dark:text-primary-400">
//               #{booking.id || booking._id || id}
//             </code>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
//           {/* Left Column - Booking Details */}
//           <Card className="lg:col-span-2 border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
//             <CardContent className="p-6 space-y-6">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                 Booking Details
//               </h2>

//               {/* Activity/Place Card */}
//               <div className="flex gap-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
//                 <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 grid place-items-center text-3xl flex-shrink-0">
//                   {place?.title || place?.name ? "" : ""}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
//                     {title}
//                   </h3>
//                   <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
//                     {city && (
//                       <span className="inline-flex items-center gap-1">
//                         <MapPin className="h-4 w-4" />
//                         {city}
//                       </span>
//                     )}
//                     {duration && (
//                       <span className="inline-flex items-center gap-1">
//                         <Clock className="h-4 w-4" />
//                         {duration}
//                       </span>
//                     )}
//                     {rating && (
//                       <span className="inline-flex items-center gap-1">
//                         <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                         {Number(rating).toFixed(1)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Date & Guests */}
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
//                     <Calendar className="h-4 w-4" />
//                     <span className="text-sm font-medium">Date</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 dark:text-white">
//                     {fmtDate(booking.date)}
//                   </p>
//                 </div>

//                 <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
//                     <Users className="h-4 w-4" />
//                     <span className="text-sm font-medium">Guests</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 dark:text-white">
//                     {participants} {participants > 1 ? "guests" : "guest"}
//                   </p>
//                 </div>
//               </div>

//               {/* Contact Info */}
//               <div className="grid sm:grid-cols-2 gap-4">
//                 <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
//                     <Mail className="h-4 w-4" />
//                     <span className="text-sm font-medium">Email</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 dark:text-white truncate">
//                     {customer.email || ""}
//                   </p>
//                 </div>

//                 <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
//                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
//                     <Phone className="h-4 w-4" />
//                     <span className="text-sm font-medium">Phone</span>
//                   </div>
//                   <p className="font-semibold text-gray-900 dark:text-white">
//                     {customer.phone || ""}
//                   </p>
//                 </div>
//               </div>

//               {/* Special Requests */}
//               {booking.specialRequests && (
//                 <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-amber-50 dark:bg-amber-900/20">
//                   <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
//                     Special Requests
//                   </div>
//                   <p className="text-gray-900 dark:text-white whitespace-pre-line">
//                     {booking.specialRequests}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Right Column - Price Summary */}
//           <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
//             <CardContent className="p-6 space-y-4">
//               <h3 className="text-base font-semibold dark:text-white">
//                 Price Summary
//               </h3>

//               <div className="text-sm text-gray-700 dark:text-gray-300">
//                 <div className="flex items-center justify-between py-1">
//                   <span>Total Amount</span>
//                   <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
//                     {INR(total)}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => toast.success("Receipt download started")}
//                   startIcon={<Download className="h-4 w-4" />}
//                   className="flex-1"
//                 >
//                   Receipt
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={share}
//                   startIcon={<Share2 className="h-4 w-4" />}
//                   className="flex-1"
//                 >
//                   Share
//                 </Button>
//               </div>

//               <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-200 dark:border-emerald-800">
//                 <div className="flex items-start gap-2">
//                   <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="font-medium mb-1">Free Cancellation</p>
//                     <p className="text-xs text-emerald-600 dark:text-emerald-400">
//                       Up to 24 hours before start time
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm border border-blue-200 dark:border-blue-800">
//                 <div className="flex items-start gap-2">
//                   <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="font-medium mb-1">No Payment Today</p>
//                     <p className="text-xs text-blue-600 dark:text-blue-400">
//                       Pay at the venue or as per terms
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <Button as={Link} to="/account/bookings" fullWidth className="mt-4">
//                 Manage in My Bookings
//                 <ArrowRight className="h-4 w-4 ml-2" />
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         {/* What's Next Section */}
//         <Card className="mb-8 border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
//           <CardContent className="p-6">
//             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What happens next?
//             </h3>
//             <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
//               <div className="flex items-start gap-3">
//                 <div className="w-6 h-6 rounded-full bg-purple-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
//                   1
//                 </div>
//                 <div>
//                   <p className="font-medium">Confirmation Email</p>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     You'll receive a confirmation email at {customer.email || "your email"}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="w-6 h-6 rounded-full bg-purple-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
//                   2
//                 </div>
//                 <div>
//                   <p className="font-medium">Prepare for Your Experience</p>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Check your email for important details and instructions
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <div className="w-6 h-6 rounded-full bg-purple-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
//                   3
//                 </div>
//                 <div>
//                   <p className="font-medium">Enjoy Your Adventure</p>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Show up on {fmtDate(booking.date)} and have an amazing time!
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* CTA Section */}
//         <div className="text-center">
//           <Button
//             as={Link}
//             to="/search"
//             variant="outline"
//             startIcon={<Sparkles className="h-4 w-4" />}
//           >
//             Explore More Activities
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
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
  Sparkles,
  Star,
  Info,
  AlertTriangle
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
    : "";

export default function BookingConfirm() {
  const [p] = useSearchParams();
  const id = p.get("id") || "";
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState({ activities: [], places: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setError("No booking ID provided.");
        setLoading(false);
        return;
      }
      try {
        const r = await api.get(`/bookings/${id}`, { silenceToast: true });
        const data = r?.data?.data || r?.data?.booking || r?.data;
        const bk = data?.booking || data;
        if (mounted) {
          setBooking(bk);
          console.log("Booking data loaded:", bk);
        }
      } catch (e) {
        console.error("Failed to load booking:", e);
        if (mounted) setError(e?.response?.data?.message || "Failed to load booking.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Fetch recommendations
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id || !booking) return;

      try {
        const r = await api.get(`/bookings/${id}/recommendations`, { silenceToast: true });
        const data = r?.data?.data || {};
        if (mounted) {
          setRecommendations(data);
        }
      } catch (e) {
        console.error("Failed to load recommendations:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, booking]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Booking",
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const downloadReceipt = async () => {
    try {
      toast.loading("Generating your receipt...");

      const response = await api.get(`/bookings/${id}/receipt`, {
        responseType: 'blob',
        silenceToast: true
      });

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-receipt-${id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error("Failed to download receipt. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent grid place-items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-transparent grid place-items-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full grid place-items-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "We couldn't find this booking."}
          </p>
          <div className="flex gap-3 justify-center">
            <Button as={Link} to="/account/bookings" variant="outline">
              View My Bookings
            </Button>
            <Button as={Link} to="/search">
              Browse Activities
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fixed: Handle different data structures
  const activity = booking.activity || {};
  const place = booking.place || {};
  const title = activity.title || place.title || place.name || "Experience";
  const city = activity.city || activity?.place?.city || place.city;
  const duration = activity.duration || place.duration;
  const rating = activity?.rating?.avg;
  
  // Fixed: Use correct field names from booking schema
  const customer = 
    (booking.participantDetails && booking.participantDetails[0]) || 
    booking.customer || 
    {};
  const participants = booking.participants || booking.peopleCount || 1;
  const total = booking.totalAmount || booking?.pricing?.total || booking.amount || 0;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full grid place-items-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
             Booking Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your reservation has been successfully created
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            <span>Booking ID:</span>
            <code className="font-mono text-primary-600 dark:text-primary-400">
              #{booking.id || booking._id || id}
            </code>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left Column - Booking Details */}
          <Card className="lg:col-span-2 border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Booking Details
              </h2>

              {/* Activity/Place Card */}
              <div className="flex gap-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 grid place-items-center flex-shrink-0">
                  {place?.title || place?.name ? (
                    <MapPin className="h-8 w-8 text-primary-600" />
                  ) : (
                    <Star className="h-8 w-8 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {city}
                      </span>
                    )}
                    {duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {duration}
                      </span>
                    )}
                    {rating && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {Number(rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Guests */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {fmtDate(booking.date)}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Guests</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {participants} {participants > 1 ? "guests" : "guest"}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {customer.email || "N/A"}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {customer.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                    Special Requests
                  </div>
                  <p className="text-gray-900 dark:text-white whitespace-pre-line">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Price Summary */}
          <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-semibold dark:text-white">
                Price Summary
              </h3>

              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-between py-1">
                  <span>Total Amount</span>
                  <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                    {INR(total)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadReceipt}
                  startIcon={<Download className="h-4 w-4" />}
                  className="flex-1"
                >
                  Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={share}
                  startIcon={<Share2 className="h-4 w-4" />}
                  className="flex-1"
                >
                  Share
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Free Cancellation</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Up to 24 hours before start time
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">No Payment Today</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Pay at the venue or as per terms
                    </p>
                  </div>
                </div>
              </div>

              <Button as={Link} to="/account/bookings" fullWidth className="mt-4">
                Manage in My Bookings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* What's Next Section */}
        <Card className="mb-8 border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
               What happens next?
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    You'll receive a confirmation email at {customer.email || "your email"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Prepare for Your Experience</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check your email for important details and instructions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white grid place-items-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Enjoy Your Adventure</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Show up on {fmtDate(booking.date)} and have an amazing time!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        {(recommendations.activities.length > 0 || recommendations.places.length > 0) && (
          <Card className="mb-8 border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-600" />
                You Might Also Like
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.activities.map((activity) => (
                  <Link
                    key={activity._id || activity.id}
                    to={`/activities/${activity._id || activity.id}`}
                    className="group block border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-md"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/20 dark:to-blue-900/20 relative overflow-hidden">
                      {activity.images && activity.images[0] ? (
                        <img
                          src={activity.images[0]}
                          alt={activity.title || activity.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Star className="h-10 w-10 text-primary-600" />
                        </div>
                      )}
                      {activity.rating?.avg && (
                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 shadow-md">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {Number(activity.rating.avg).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {activity.title || activity.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {activity.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {activity.city}
                          </span>
                        )}
                        {activity.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.duration}
                          </span>
                        )}
                      </div>
                      {(activity.price || activity.basePrice) && (
                        <p className="mt-2 font-bold text-primary-600 dark:text-primary-400">
                          {INR(activity.price || activity.basePrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}

                {recommendations.places.map((place) => (
                  <Link
                    key={place._id || place.id}
                    to={`/places/${place._id || place.id}`}
                    className="group block border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-md"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 relative overflow-hidden">
                      {place.images && place.images[0] ? (
                        <img
                          src={place.images[0]}
                          alt={place.title || place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-10 w-10 text-primary-600" />
                        </div>
                      )}
                      {place.rating?.avg && (
                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 shadow-md">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {Number(place.rating.avg).toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {place.title || place.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {place.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {place.city}
                          </span>
                        )}
                      </div>
                      {(place.price || place.basePrice) && (
                        <p className="mt-2 font-bold text-emerald-600 dark:text-emerald-400">
                          {INR(place.price || place.basePrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <Button
            as={Link}
            to="/search"
            variant="outline"
            startIcon={<Sparkles className="h-4 w-4" />}
          >
            Explore More Activities
          </Button>
        </div>
      </div>
    </div>
  );
}
