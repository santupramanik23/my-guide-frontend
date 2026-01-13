// import React, { useEffect, useMemo, useState } from "react";
// import { useSearchParams, useNavigate, Link } from "react-router-dom";
// import {
//   AlertTriangle, Users, Mail, Phone, User, Loader2, MapPin, Clock,
//   CreditCard, CheckCircle2, Star, Info, ChevronRight, ArrowLeft, X,
//   ChevronLeft, ChevronRight as ChevronRightIcon, Calendar as CalendarIcon,
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/Card";
// import Button from "@/components/ui/Button"; // ✅ fix: was importing BookingButton as Button before :contentReference[oaicite:2]{index=2}
// import { api, useAuthStore } from "@/store/auth";
// import toast from "react-hot-toast";

// /* ---------- utils ---------- */
// const INR = (n) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n||0));
// const fmtDuration = (m)=>{ if(!m) return "—"; if(m<60) return `${m}m`; const h=Math.floor(m/60),r=m%60; return r?`${h}h ${r}m`:`${h}h`; };
// const isApproved = (d)=> d?.approved===true || d?.isApproved===true || d?.status==="approved";
// const todayISO = ()=>{ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().split("T")[0]; };

// /* ---------- inline Calendar (no extra files) ---------- */
// const addMonths = (d, n)=>{ const x=new Date(d); x.setMonth(x.getMonth()+n); x.setDate(1); return x; };
// const daysInMonth = (d)=> new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
// const toISODate = (d)=> d.toISOString().split("T")[0];

// function CalendarPicker({ value, onChange, label="Date", required=true }) {
//   const min = new Date(); min.setHours(0,0,0,0);
//   const [view, setView] = useState(()=> value? new Date(value) : min);
//   const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay()+6)%7; // Mon=0
//   const total = daysInMonth(view);
//   const weeks=[]; let day=1-firstDow;
//   while(day<=total){ const row=[]; for(let i=0;i<7;i++) row.push(new Date(view.getFullYear(), view.getMonth(), day++)); weeks.push(row); }
//   const sel = value? new Date(value) : null;

//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       <div className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
//         <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800">
//           <button type="button" onClick={()=>setView((v)=>addMonths(v,-1))} className="p-1 rounded hover:bg-white/70 dark:hover:bg-gray-700" aria-label="Previous month">
//             <ChevronLeft className="h-5 w-5" />
//           </button>
//           <div className="flex items-center gap-2 font-semibold">
//             <CalendarIcon className="h-4 w-4" />
//             {view.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
//           </div>
//           <button type="button" onClick={()=>setView((v)=>addMonths(v,1))} className="p-1 rounded hover:bg-white/70 dark:hover:bg-gray-700" aria-label="Next month">
//             <ChevronRightIcon className="h-5 w-5" />
//           </button>
//         </div>
//         <div className="grid grid-cols-7 text-xs text-center py-2">
//           {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d)=> <div key={d} className="text-gray-500">{d}</div>)}
//         </div>
//         <div className="grid grid-cols-7 gap-1 p-2">
//           {weeks.map((row,ri)=> row.map((d,ci)=>{
//             const disabled = d<min || d.getMonth()!==view.getMonth();
//             const selected = sel && d.toDateString()===sel.toDateString();
//             return (
//               <button
//                 key={`${ri}-${ci}`} type="button" disabled={disabled} aria-pressed={selected}
//                 onClick={()=>onChange(toISODate(d))}
//                 className={[
//                   "h-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500",
//                   disabled? "text-gray-400 cursor-not-allowed" : "hover:bg-primary-50 dark:hover:bg-primary-900/30",
//                   selected? "bg-primary-600 text-white hover:bg-primary-600" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
//                 ].join(" ")}
//               >
//                 {d.getDate()}
//               </button>
//             );
//           }))}
//         </div>
//       </div>
//       {/* mobile fallback */}
//       <input type="date" value={value||""} min={todayISO()} onChange={(e)=>onChange(e.target.value)}
//         className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white md:hidden"/>
//     </div>
//   );
// }

// /* ---------- page ---------- */
// export default function BookingFlow(){
//   const nav = useNavigate();
//   const [q] = useSearchParams();
//   const { isAuthenticated, user } = useAuthStore();

//   const itemId = q.get("activity") || q.get("place");
//   const itemType = q.get("place") ? "place" : "activity";

//   const [loading, setLoading] = useState(true);
//   const [item, setItem] = useState(null);
//   const [error, setError] = useState("");
//   const [step, setStep] = useState(0);
//   const [submitting, setSubmitting] = useState(false);

//   const [date, setDate] = useState(q.get("date") || "");
//   const [guests, setGuests] = useState(q.get("guests") || "1");
//   const [name, setName] = useState(user?.name || "");
//   const [email, setEmail] = useState(user?.email || "");
//   const [phone, setPhone] = useState(user?.phone || "");
//   const [special, setSpecial] = useState("");
//   const [agree, setAgree] = useState(false);
//   const [promo, setPromo] = useState("");

//   useEffect(()=>{
//     let ignore=false;
//     (async()=>{
//       if(!itemId){ setError("No item selected."); setLoading(false); return; }
//       try{
//         setLoading(true); setError("");
//         let d;
//         try { const r = await api.get(`/activities/${itemId}`, { silenceToast:true }); d = r?.data?.data || r?.data || r; }
//         catch { const r = await api.get(`/places/${itemId}`, { silenceToast:true }); d = r?.data?.data || r?.data?.place || r?.data || r; }
//         if (d && (d.approved===undefined || isApproved(d))) setItem(d);
//         else { setItem(null); setError("This item is not available for booking."); }
//       }catch{ setError("Failed to load item details."); }
//       finally{ if(!ignore) setLoading(false); }
//     })();
//     return ()=>{ ignore=true; };
//   },[itemId]);

//   const pricing = useMemo(()=>{
//     const base = typeof item?.basePrice==="number" ? item.basePrice : 99;
//     const g = Number(guests||1);
//     const subtotal = base*g;
//     const tax = Math.round(subtotal*0.18);
//     const fee = Math.round(subtotal*0.05);
//     const promoOff = promo.trim().toUpperCase()==="WELCOME10" ? Math.floor(subtotal*0.1) : 0;
//     const total = Math.max(0, subtotal + tax + fee - promoOff);
//     return { base, g, subtotal, tax, fee, promoOff, total };
//   },[item, guests, promo]);

//   const validDate = date && new Date(date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0);
//   const validGuests = Number(guests) >= 1;
//   const validContact = name.trim().length>=2 && /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g,"").length>=10;
//   const canNext = step===0 ? (validDate && validGuests) : step===1 ? validContact : agree;

//   const submit = async()=>{
//     if(!agree){ toast.error("Please agree to the terms"); return; }
//     if(!isAuthenticated){
//       nav("/auth/login",{ state:{ returnTo:`/booking?${itemType}=${itemId}&date=${date}&guests=${guests}` }});
//       return;
//     }
//     try{
//       setSubmitting(true); setError("");
//       const payload = {
//         activityId: itemType==="activity" ? itemId : undefined,
//         placeId: itemType==="place" ? itemId : undefined,
//         date,
//         participants: Number(guests),
//         peopleCount: Number(guests),                 // compatibility
//         participantDetails: [{ name: name.trim(), email: email.trim(), phone: phone.trim() }],
//         customer: { name: name.trim(), email: email.trim(), phone: phone.trim() }, // compatibility
//         specialRequests: special?.trim() || "",
//         pricing: { basePrice: pricing.base, subtotal: pricing.subtotal, tax: pricing.tax, serviceFee: pricing.fee, promoOff: pricing.promoOff, total: pricing.total },
//         totalAmount: pricing.total,
//       };
//       const r = await api.post("/bookings", payload);
//       const data = r?.data?.data || r?.data;
//       const id = data?.booking?._id || data?.booking?.id || data?._id || data?.id;
//       if (!id) throw new Error("No booking id in response");
//       toast.success("Booking created!");
//       nav(`/booking/confirm?id=${id}`, { replace:true });
//     }catch(e){
//       const msg = e?.response?.data?.message || e?.message || "Unable to create booking.";
//       setError(msg); toast.error(msg);
//     }finally{ setSubmitting(false); }
//   };

//   if (loading){
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary-600"/>
//           <p className="text-gray-600 dark:text-gray-400">Loading details...</p>
//         </div>
//       </div>
//     );
//   }
//   if (!item){
//     return (
//       <div className="max-w-3xl mx-auto px-4 py-16 text-center">
//         <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 grid place-items-center mb-4">
//           <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400"/>
//         </div>
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Item Unavailable</h2>
//         <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "This item is not available for booking."}</p>
//         <div className="flex gap-3 justify-center">
//           <Button as={Link} to="/search" variant="outline">Browse Activities</Button>
//           <Button as={Link} to="/">Go Home</Button>
//         </div>
//       </div>
//     );
//   }

//   const title = item.title || "Untitled";
//   const city = item?.place?.city || item?.city;
//   const duration = item.duration || (item.durationMinutes ? fmtDuration(item.durationMinutes) : null);
//   const rating = item?.rating?.avg;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <Link
//           to={itemType==="place" ? `/places/${itemId}` : `/activities/${itemId}`}
//           className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium mb-6"
//         >
//           <ArrowLeft className="h-4 w-4"/> Back to {itemType}
//         </Link>

//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Booking</h1>
//           <p className="text-gray-600 dark:text-gray-400">Follow the steps to confirm your reservation</p>
//         </div>

//         {/* Stepper */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between max-w-2xl">
//             {["Details","Contact","Review"].map((label,i)=>{
//               const done = i<step, active = i===step;
//               return (
//                 <React.Fragment key={label}>
//                   <div className="flex flex-col items-center flex-1">
//                     <div className={`w-10 h-10 rounded-full grid place-items-center text-sm font-semibold transition-all ${
//                       done? "bg-primary-600 text-white" : active? "bg-primary-100 text-primary-600 ring-4 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-400" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
//                     }`}>
//                       {done? <CheckCircle2 className="h-5 w-5"/> : i+1}
//                     </div>
//                     <span className={`mt-2 text-xs font-medium ${active?"text-gray-900 dark:text-white":"text-gray-500 dark:text-gray-400"}`}>{label}</span>
//                   </div>
//                   {i<2 && <div className={`flex-1 h-1 -mt-8 rounded-full ${done?"bg-primary-600":"bg-gray-200 dark:bg-gray-700"}`}/>}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Item summary */}
//             <Card><CardContent className="p-6">
//               <div className="flex gap-4">
//                 <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 grid place-items-center text-3xl">
//                   {itemType==="place"?"📍":"🎯"}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
//                   <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
//                     {city && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/>{city}</span>}
//                     {duration && <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4"/>{duration}</span>}
//                     {rating && <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>{Number(rating).toFixed(1)}</span>}
//                   </div>
//                 </div>
//               </div>
//             </CardContent></Card>

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4">
//                 <div className="flex gap-3">
//                   <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0"/>
//                   <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
//                 </div>
//               </div>
//             )}

//             {/* Step card */}
//             <Card><CardContent className="p-6 space-y-6">
//               {step===0 && (
//                 <div className="space-y-6">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date & Guests</h3>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <CalendarPicker value={date} onChange={setDate}/>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
//                         Guests <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
//                         <select
//                           value={guests}
//                           onChange={(e)=>setGuests(e.target.value)}
//                           className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none dark:bg-gray-800 dark:text-white"
//                         >
//                           {Array.from({length:10},(_,i)=>i+1).map(n=> <option key={n} value={n}>{n} {n>1?"guests":"guest"}</option>)}
//                         </select>
//                       </div>
//                       {!validGuests && <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><X className="h-3 w-3"/>At least 1 guest</p>}
//                     </div>
//                   </div>

//                   <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                     <div className="flex gap-2">
//                       <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"/>
//                       <div className="text-sm text-blue-800 dark:text-blue-200">
//                         <p className="font-medium mb-1">Flexible Booking</p>
//                         <p>Free cancellation up to 24 hours before your activity starts</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {step===1 && (
//                 <div className="space-y-6">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
//                       <div className="relative">
//                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
//                         <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white" placeholder="e.g., Priya Sharma"/>
//                       </div>
//                       {name.trim().length<2 && <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><X className="h-3 w-3"/>Name is required</p>}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-red-500">*</span></label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
//                         <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white" placeholder="name@example.com"/>
//                       </div>
//                       {!/\S+@\S+\.\S+/.test(email) && <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><X className="h-3 w-3"/>Enter a valid email</p>}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone <span className="text-red-500">*</span></label>
//                       <div className="relative">
//                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
//                         <input value={phone} onChange={(e)=>setPhone(e.target.value.replace(/[^\d+ -]/g,""))} type="tel" className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white" placeholder="+91 98765 43210"/>
//                       </div>
//                       {phone.replace(/\D/g,"").length<10 && <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><X className="h-3 w-3"/>Enter 10+ digits</p>}
//                     </div>
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Special Requests</label>
//                       <textarea value={special} onChange={(e)=>setSpecial(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white" placeholder="(optional)"/>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {step===2 && (
//                 <div className="space-y-6">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Confirm</h3>
//                   <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
//                     <div className="flex items-center justify-between"><span>Date</span><span className="font-medium">{date? new Date(date).toLocaleDateString("en-IN",{weekday:"short", day:"numeric", month:"short", year:"numeric"}) : "—"}</span></div>
//                     <div className="flex items-center justify-between"><span>Guests</span><span className="font-medium">{guests}</span></div>
//                     <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
//                       <CheckCircle2 className="h-4 w-4"/> Reserve now & pay later — no payment today.
//                     </div>
//                     <label className="flex items-start gap-3">
//                       <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} className="mt-1 h-4 w-4"/>
//                       <span className="text-gray-600 dark:text-gray-300">
//                         I agree to the <a href="/terms" className="text-primary-600 dark:text-primary-400 underline">Terms & Conditions</a> and <a href="/cancellation" className="text-primary-600 dark:text-primary-400 underline">Cancellation Policy</a>.
//                       </span>
//                     </label>
//                     {!agree && <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><X className="h-3 w-3"/>You must agree to continue</p>}
//                   </div>
//                 </div>
//               )}

//               <div className="pt-2 flex items-center justify-between">
//                 <Button variant="outline" onClick={()=>setStep((s)=>Math.max(0,s-1))} disabled={step===0 || submitting}>Back</Button>
//                 {step<2 ? (
//                   <Button onClick={()=>setStep((s)=>s+1)} disabled={!canNext}>Continue <ChevronRight className="h-4 w-4 ml-2"/></Button>
//                 ) : (
//                   <Button onClick={submit} disabled={!canNext || submitting}>
//                     {submitting ? "Creating Booking..." : "Confirm Booking"} <CreditCard className="h-4 w-4 ml-2"/>
//                   </Button>
//                 )}
//               </div>
//             </CardContent></Card>
//           </div>

//           {/* Right rail summary */}
//           <div className="lg:col-span-1">
//             <div className="lg:sticky lg:top-6 space-y-6">
//               <Card className="shadow-lg"><CardContent className="p-6 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-base font-semibold dark:text-white">Order Summary</h3>
//                   <span className="text-xs text-gray-500">Instant confirmation</span>
//                 </div>
//                 <div className="text-sm text-gray-700 dark:text-gray-300">
//                   <div className="flex items-center justify-between py-1">
//                     <span>{INR(pricing.base)} × {pricing.g} {pricing.g>1?"guests":"guest"}</span>
//                     <span className="font-medium">{INR(pricing.subtotal)}</span>
//                   </div>
//                   <div className="flex items-center justify-between py-1"><span>Tax (18%)</span><span className="font-medium">{INR(pricing.tax)}</span></div>
//                   <div className="flex items-center justify-between py-1"><span>Service fee</span><span className="font-medium">{INR(pricing.fee)}</span></div>
//                   {pricing.promoOff>0 && (
//                     <div className="flex items-center justify-between py-1">
//                       <span className="inline-flex items-center gap-1">Promo</span>
//                       <span className="font-medium text-emerald-700">−{INR(pricing.promoOff)}</span>
//                     </div>
//                   )}
//                   <div className="border-t border-gray-200 dark:border-gray-700 my-2"/>
//                   <div className="flex items-center justify-between text-lg font-bold">
//                     <span>Total</span><span className="text-primary-600 dark:text-primary-400">{INR(pricing.total)}</span>
//                   </div>
//                   <div className="text-xs text-gray-500">No payment due today</div>
//                 </div>
//               </CardContent></Card>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle, Users, Mail, Phone, User, Loader2, MapPin, Clock,
  CreditCard, CheckCircle2, Star, Info, ChevronRight, ArrowLeft, X,
  ChevronLeft, ChevronRight as ChevronRightIcon, Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

/* ---------- utils ---------- */
const INR = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", 
  currency: "INR", 
  maximumFractionDigits: 0 
}).format(Number(n || 0));

const fmtDuration = (m) => {
  if (!m) return "N/A";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

const isApproved = (d) => d?.approved === true || d?.isApproved === true || d?.status === "approved";

/* ---------- Calendar Component ---------- */
const addMonths = (d, n) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  x.setDate(1);
  return x;
};

const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const toISODate = (d) => d.toISOString().split("T")[0];
const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

function CalendarPicker({ value, onChange, label = "Date", required = true }) {
  const min = new Date();
  min.setHours(0, 0, 0, 0);
  const [view, setView] = useState(() => value ? new Date(value) : min);
  
  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const total = daysInMonth(view);
  
  const weeks = [];
  let day = 1 - firstDow;
  while (day <= total) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      row.push(new Date(view.getFullYear(), view.getMonth(), day++));
    }
    weeks.push(row);
  }
  
  const sel = value ? new Date(value) : null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setView((v) => addMonths(v, -1))}
            className="p-1 rounded hover:bg-white/70 dark:hover:bg-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 font-semibold">
            <CalendarIcon className="h-4 w-4" />
            {view.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </div>
          <button
            type="button"
            onClick={() => setView((v) => addMonths(v, 1))}
            className="p-1 rounded hover:bg-white/70 dark:hover:bg-gray-700"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 text-xs text-center py-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 p-2">
          {weeks.map((row, ri) =>
            row.map((d, ci) => {
              const disabled = d < min || d.getMonth() !== view.getMonth();
              const selected = sel && d.toDateString() === sel.toDateString();
              return (
                <button
                  key={`${ri}-${ci}`}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => onChange(toISODate(d))}
                  className={[
                    "h-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500",
                    disabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-primary-50 dark:hover:bg-primary-900/30",
                    selected
                      ? "bg-primary-600 text-white hover:bg-primary-600"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })
          )}
        </div>
      </div>
      {/* Mobile fallback */}
      <input
        type="date"
        value={value || ""}
        min={todayISO()}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white md:hidden"
      />
    </div>
  );
}

/* ---------- Main Booking Flow Component ---------- */
export default function BookingFlow() {
  const nav = useNavigate();
  const [q] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const itemId = q.get("activity") || q.get("place");
  const itemType = q.get("place") ? "place" : "activity";

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(q.get("date") || "");
  const [guests, setGuests] = useState(q.get("guests") || "1");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [special, setSpecial] = useState("");
  const [agree, setAgree] = useState(false);
  const [promo, setPromo] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!itemId) {
        setError("No item selected.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        let d;
        try {
          const r = await api.get(`/activities/${itemId}`, { silenceToast: true });
          d = r?.data?.data || r?.data || r;
        } catch {
          const r = await api.get(`/places/${itemId}`, { silenceToast: true });
          d = r?.data?.data || r?.data?.place || r?.data || r;
        }
        if (d && (d.approved === undefined || isApproved(d))) {
          setItem(d);
        } else {
          setItem(null);
          setError("This item is not available for booking.");
        }
      } catch (err) {
        console.error("Failed to load item:", err);
        setError("Failed to load item details.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [itemId]);

  const pricing = useMemo(() => {
    const base = typeof item?.basePrice === "number" ? item.basePrice : 99;
    const g = Number(guests || 1);
    const subtotal = base * g;
    const tax = Math.round(subtotal * 0.18);
    const fee = Math.round(subtotal * 0.05);
    const promoOff = promo.trim().toUpperCase() === "WELCOME10" ? Math.floor(subtotal * 0.1) : 0;
    const total = Math.max(0, subtotal + tax + fee - promoOff);
    return { base, g, subtotal, tax, fee, promoOff, total };
  }, [item, guests, promo]);

  const validDate = date && new Date(date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
  const validGuests = Number(guests) >= 1;
  const validContact = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && phone.replace(/\D/g, "").length >= 10;
  const canNext = step === 0 ? (validDate && validGuests) : step === 1 ? validContact : agree;

  const submit = async () => {
    if (!agree) {
      toast.error("Please agree to the terms");
      return;
    }
    if (!isAuthenticated) {
      nav("/auth/login", {
        state: {
          returnTo: `/booking?${itemType}=${itemId}&date=${date}&guests=${guests}`,
        },
      });
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      
      const payload = {
        activityId: itemType === "activity" ? itemId : undefined,
        placeId: itemType === "place" ? itemId : undefined,
        date: new Date(date).toISOString(),
        participants: Number(guests),
        peopleCount: Number(guests),
        participantDetails: [
          {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
        ],
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
        specialRequests: special?.trim() || "",
        totalAmount: pricing.total,
        pricing: {
          basePrice: pricing.base,
          subtotal: pricing.subtotal,
          tax: pricing.tax,
          serviceFee: pricing.fee,
          promoOff: pricing.promoOff,
          total: pricing.total,
        },
      };

      console.log("Submitting booking:", payload);

      const r = await api.post("/bookings", payload);
      const data = r?.data?.data || r?.data;
      const id = data?.booking?._id || data?.booking?.id || data?._id || data?.id;
      
      if (!id) {
        console.error("No booking ID in response:", data);
        throw new Error("No booking id in response");
      }
      
      toast.success("Booking created successfully!");
      nav(`/booking/confirm?id=${id}`, { replace: true });
    } catch (e) {
      console.error("Booking submission error:", e);
      const msg = e?.response?.data?.message || e?.message || "Unable to create booking.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent grid place-items-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading details...</p>
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
          <Button as={Link} to="/search" variant="outline">
            Browse Activities
          </Button>
          <Button as={Link} to="/">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const title = item.title || item.name || "Untitled";
  const city = item?.place?.city || item?.city;
  const duration = item.duration || (item.durationMinutes ? fmtDuration(item.durationMinutes) : null);
  const rating = item?.rating?.avg;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={itemType === "place" ? `/places/${itemId}` : `/activities/${itemId}`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {itemType}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Booking</h1>
          <p className="text-gray-600 dark:text-gray-400">Follow the steps to confirm your reservation</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl">
            {["Details", "Contact", "Review"].map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full grid place-items-center text-sm font-semibold transition-all ${
                        done
                          ? "bg-primary-600 text-white"
                          : active
                          ? "bg-primary-100 text-primary-600 ring-4 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-400"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-1 -mt-8 rounded-full ${
                        done ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item summary */}
            <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 grid place-items-center">
                    {itemType === "place" ? (
                      <MapPin className="h-8 w-8 text-primary-600" />
                    ) : (
                      <Star className="h-8 w-8 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
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
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
                </div>
              </div>
            )}

            {/* Step card */}
            <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
              <CardContent className="p-6 space-y-6">
                {step === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select Date & Guests
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <CalendarPicker value={date} onChange={setDate} />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Guests <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <select
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none dark:bg-gray-800 dark:text-white bg-white"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n} {n > 1 ? "guests" : "guest"}
                              </option>
                            ))}
                          </select>
                        </div>
                        {!validGuests && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            At least 1 guest
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-medium mb-1">Flexible Booking</p>
                          <p>Free cancellation up to 24 hours before your activity starts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Contact Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 ">
                      <div>
                        <label className="block text-sm font-medium  text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name  <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white bg-white"
                            placeholder="e.g., Priya Sharma"
                          />
                        </div>
                        {name.trim().length < 2 && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            Name is required
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="bg-white w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            placeholder="name@example.com"
                          />
                        </div>
                        {!/\S+@\S+\.\S+/.test(email) && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            Enter a valid email
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^\d+ -]/g, ""))}
                            type="tel"
                            className="bg-white w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        {phone.replace(/\D/g, "").length < 10 && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            Enter 10+ digits
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Special Requests
                        </label>
                        <textarea
                          value={special}
                          onChange={(e) => setSpecial(e.target.value)}
                          rows={4}
                          className="bg-white w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          placeholder="(optional)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Review & Confirm
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Date</span>
                        <span className="font-medium">
                          {date
                            ? new Date(date).toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Guests</span>
                        <span className="font-medium">{guests}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                        <CheckCircle2 className="h-4 w-4" /> Reserve now & pay later - no payment today.
                      </div>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-gray-600 dark:text-gray-300">
                          I agree to the{" "}
                          <a href="/terms" className="text-primary-600 dark:text-primary-400 underline">
                            Terms & Conditions
                          </a>{" "}
                          and{" "}
                          <a href="/cancellation" className="text-primary-600 dark:text-primary-400 underline">
                            Cancellation Policy
                          </a>
                          .
                        </span>
                      </label>
                      {!agree && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          You must agree to continue
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                      Continue <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={submit} disabled={!canNext || submitting}>
                      {submitting ? "Creating Booking..." : "Confirm Booking"}{" "}
                      <CreditCard className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right rail summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
              <Card className="border-purple-100/70 dark:border-[#2a1a45] bg-white/90 dark:bg-[#1a1230]/90 backdrop-blur shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold dark:text-white">Order Summary</h3>
                    <span className="text-xs text-gray-500">Instant confirmation</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-between py-1">
                      <span>
                        {INR(pricing.base)} x {pricing.g} {pricing.g > 1 ? "guests" : "guest"}
                      </span>
                      <span className="font-medium">{INR(pricing.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>Tax (18%)</span>
                      <span className="font-medium">{INR(pricing.tax)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>Service fee</span>
                      <span className="font-medium">{INR(pricing.fee)}</span>
                    </div>
                    {pricing.promoOff > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="inline-flex items-center gap-1">Promo</span>
                        <span className="font-medium text-emerald-700">-{INR(pricing.promoOff)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {INR(pricing.total)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">No payment due today</div>
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
