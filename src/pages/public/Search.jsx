

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  ArrowRight,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { SkeletonList } from '@/components/ui/LoadingSkeleton';
import Button from '@/components/ui/Button';
import { api } from '@/store/auth';

/* ----------------------- Filter dictionaries ------------------------ */
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PRICE_RANGES = [
  { value: '0-50', label: 'Under ₹50' },
  { value: '50-100', label: '₹50 – ₹100' },
  { value: '100-500', label: '₹100 – ₹500' },
  { value: '500-1000', label: '₹500 – ₹1,000' },
  { value: '1000+', label: 'Over ₹1,000' },
];

const CATEGORIES = [
  { value: 'cultural', label: 'Cultural Tours', icon: '🏛️' },
  { value: 'food', label: 'Food & Drink', icon: '🍽️' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
  { value: 'art', label: 'Art & History', icon: '🎨' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
];

/* ----------------------- Helper functions ------------------------ */
function toPriceMinMax(range) {
  if (!range) return {};
  if (range.endsWith('+')) return { minPrice: Number(range.replace('+','')) };
  const [a, b] = range.split('-').map(Number);
  return { minPrice: isNaN(a) ? undefined : a, maxPrice: isNaN(b) ? undefined : b };
}

function toDurationMinMax(bucket) {
  switch (bucket) {
    case 'short': return { minDuration: 0, maxDuration: 120 };
    case 'halfday': return { minDuration: 121, maxDuration: 300 };
    case 'fullday': return { minDuration: 301, maxDuration: 600 };
    case 'multiday': return { minDuration: 601 };
    default: return {};
  }
}

function sortMapping(value) {
  switch (value) {
    case 'rating_desc': return { sortBy: 'rating', order: 'desc' };
    case 'price_asc':   return { sortBy: 'price', order: 'asc' };
    case 'price_desc':  return { sortBy: 'price', order: 'desc' };
    case 'popular':     return { sortBy: 'popularity', order: 'desc' };
    default:            return {};
  }
}

// Robust data extraction from API responses
function robustPick(res, key) {
  if (!res) return [];
  const d = res?.data;
  const arr =
    d?.[key] ||
    d?.data?.[key] ||
    d?.data ||
    d?.docs ||
    d?.results ||
    d;
  return Array.isArray(arr) ? arr : [];
}

const formatINR = (price) =>
  typeof price !== 'number'
    ? '₹—'
    : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDuration = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const getCategoryEmoji = (category) => {
  const emojiMap = {
    heritage: '🏛️', food: '🍽️', art: '🎨', nature: '🌿', adventure: '🚵', 
    cultural: '🎭', 'food & drink': '🍷', entertainment: '🎭', default: '📸',
  };
  return emojiMap[category?.toLowerCase()] || emojiMap.default;
};

// Helper to validate and filter images
const getValidImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.filter(img => img && typeof img === 'string' && img.trim() !== '');
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getPlaceTitle = (place) => place?.title || place?.name || '';
const getPlaceLocation = (place) => place?.city || place?.location?.city || place?.country || '';
const getActivityLocation = (activity) => activity?.place?.city || activity?.city || activity?.place?.name || '';

const getNumericRating = (item) => {
  const rating = item?.averageRating ?? item?.rating?.avg ?? item?.rating;
  const parsed = Number(rating);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getNumericPrice = (activity) => {
  const price = activity?.price ?? activity?.basePrice;
  const parsed = Number(price);
  return Number.isFinite(parsed) ? parsed : null;
};

const getNumericDuration = (activity) => {
  const duration = activity?.durationMinutes ?? activity?.duration;
  const parsed = Number(duration);
  return Number.isFinite(parsed) ? parsed : null;
};

function matchesQuery(item, type, q) {
  const query = normalizeText(q);
  if (!query) return true;

  const haystack = type === 'place'
    ? [
        getPlaceTitle(item),
        item?.description,
        item?.category,
        item?.city,
        item?.country,
        ...(Array.isArray(item?.tags) ? item.tags : []),
      ]
    : [
        item?.title,
        item?.description,
        item?.category,
        getActivityLocation(item),
        item?.place?.name,
        ...(Array.isArray(item?.tags) ? item.tags : []),
      ];

  return haystack.some((value) => normalizeText(value).includes(query));
}

function matchesCategory(item, category) {
  if (!category) return true;
  return normalizeText(item?.category) === normalizeText(category);
}

function matchesPrice(activity, priceRange) {
  if (!priceRange) return true;
  const price = getNumericPrice(activity);
  if (price == null) return false;

  const { minPrice, maxPrice } = toPriceMinMax(priceRange);
  if (minPrice !== undefined && price < minPrice) return false;
  if (maxPrice !== undefined && price > maxPrice) return false;
  return true;
}

function matchesRating(item, rating) {
  if (!rating) return true;
  return getNumericRating(item) >= Number(rating);
}

function matchesDuration(activity, duration) {
  if (!duration) return true;
  const minutes = getNumericDuration(activity);
  if (minutes == null) return false;

  const { minDuration, maxDuration } = toDurationMinMax(duration);
  if (minDuration !== undefined && minutes < minDuration) return false;
  if (maxDuration !== undefined && minutes > maxDuration) return false;
  return true;
}

function sortResults(items, type, sort) {
  const list = [...items];
  if (sort === 'price_asc') return list.sort((a, b) => (getNumericPrice(a) ?? Number.MAX_SAFE_INTEGER) - (getNumericPrice(b) ?? Number.MAX_SAFE_INTEGER));
  if (sort === 'price_desc') return list.sort((a, b) => (getNumericPrice(b) ?? -1) - (getNumericPrice(a) ?? -1));
  if (sort === 'rating_desc') return list.sort((a, b) => getNumericRating(b) - getNumericRating(a));
  if (sort === 'popular') {
    return list.sort((a, b) => {
      const featuredDelta = Number(Boolean(b?.featured)) - Number(Boolean(a?.featured));
      if (featuredDelta !== 0) return featuredDelta;
      return getNumericRating(b) - getNumericRating(a);
    });
  }
  if (sort === 'relevance') return list;

  return type === 'place'
    ? list.sort((a, b) => normalizeText(getPlaceTitle(a)).localeCompare(normalizeText(getPlaceTitle(b))))
    : list.sort((a, b) => normalizeText(a?.title).localeCompare(normalizeText(b?.title)));
}

/* -------------------------------------------------------------------- */

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL parameters with safe defaults
  const query = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';
  const categoryParam = (searchParams.get('category') || '').toLowerCase();
  const priceParam = searchParams.get('priceRange') || '';
  const ratingParam = searchParams.get('rating') || '';
  const durationParam = searchParams.get('duration') || '';
  const sortParam = searchParams.get('sort') || 'relevance';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResults, setRawResults] = useState({ places: [], activities: [] });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: query,
    type: typeParam,
    category: categoryParam,
    priceRange: priceParam,
    rating: ratingParam,
    duration: durationParam,
    sort: sortParam,
  });
  
  const [appliedFilters, setAppliedFilters] = useState(filters);

  useEffect(() => {
    const nextFilters = {
      q: query,
      type: typeParam,
      category: categoryParam,
      priceRange: priceParam,
      rating: ratingParam,
      duration: durationParam,
      sort: sortParam,
    };

    setFilters((current) => {
      const isSame =
        current.q === nextFilters.q &&
        current.type === nextFilters.type &&
        current.category === nextFilters.category &&
        current.priceRange === nextFilters.priceRange &&
        current.rating === nextFilters.rating &&
        current.duration === nextFilters.duration &&
        current.sort === nextFilters.sort;

      return isSame ? current : nextFilters;
    });

    setAppliedFilters((current) => {
      const isSame =
        current.q === nextFilters.q &&
        current.type === nextFilters.type &&
        current.category === nextFilters.category &&
        current.priceRange === nextFilters.priceRange &&
        current.rating === nextFilters.rating &&
        current.duration === nextFilters.duration &&
        current.sort === nextFilters.sort;

      return isSame ? current : nextFilters;
    });
  }, [query, typeParam, categoryParam, priceParam, ratingParam, durationParam, sortParam]);

  // Debounce search
  const debounceRef = useRef();
  const debouncedApply = (next) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAppliedFilters(next);
      updateURL(next);
    }, 300);
  };

  // Build API parameters
  const buildCommonParams = (f) => {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q.trim());
    if (f.category) p.set('category', f.category.toLowerCase());

    const { minPrice, maxPrice } = toPriceMinMax(f.priceRange);
    if (minPrice !== undefined) p.set('priceMin', String(minPrice));
    if (maxPrice !== undefined) p.set('priceMax', String(maxPrice));

    const { minDuration, maxDuration } = toDurationMinMax(f.duration);
    if (minDuration !== undefined) p.set('durationMin', String(minDuration));
    if (maxDuration !== undefined) p.set('durationMax', String(maxDuration));

    const s = sortMapping(f.sort);
    if (s.sortBy) p.set('sortBy', s.sortBy);
    if (s.order) p.set('order', s.order);
    return p;
  };

  const LIMIT_PLACES = 100;
  const LIMIT_ACTIVITIES = 100;

  const fetchResults = useCallback(async (f) => {
    try {
      setLoading(true);
      setError(null);

      const paramsPlaces = buildCommonParams(f);
      paramsPlaces.set('limit', String(LIMIT_PLACES));

      const paramsActivities = buildCommonParams(f);
      paramsActivities.set('isPublished', 'true');
      paramsActivities.set('limit', String(LIMIT_ACTIVITIES));

      const wantPlaces = !f.type || f.type === 'place';
      const wantActivities = !f.type || f.type === 'activity';

      const reqs = [
        wantPlaces
          ? api.get(`/places?${paramsPlaces.toString()}`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        wantActivities
          ? api.get(`/activities?${paramsActivities.toString()}`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ];

      const [placesRes, activitiesRes] = await Promise.all(reqs);

      const newPlaces = robustPick(placesRes, 'places');
      const newActivities = robustPick(activitiesRes, 'activities');

      setRawResults({
        places: Array.isArray(newPlaces) ? newPlaces : [],
        activities: Array.isArray(newActivities) ? newActivities : []
      });

    } catch (e) {
      setError('Could not load results. Please try again.');
      setRawResults({ places: [], activities: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch results when appliedFilters change
  useEffect(() => {
    fetchResults(appliedFilters);
  }, [fetchResults, appliedFilters]);

  const updateURL = useCallback((f) => {
    const params = new URLSearchParams();
    if (f.q) params.set('q', f.q);
    if (f.type) params.set('type', f.type);
    if (f.category) params.set('category', f.category);
    if (f.priceRange) params.set('priceRange', f.priceRange);
    if (f.rating) params.set('rating', f.rating);
    if (f.duration) params.set('duration', f.duration);
    if (f.sort && f.sort !== 'relevance') params.set('sort', f.sort);
    setSearchParams(params);
  }, [setSearchParams]);

  const clearFilters = () => {
    const cleared = { 
      q: filters.q, 
      type: '', 
      category: '', 
      priceRange: '', 
      rating: '', 
      duration: '', 
      sort: 'relevance' 
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
    updateURL(cleared);
  };

  const activeFilterEntries = useMemo(
    () => Object.entries(appliedFilters).filter(([k, v]) => 
      !!v && !['q'].includes(k) && !(k === 'sort' && v === 'relevance')
    ),
    [appliedFilters]
  );

  const results = useMemo(() => {
    const hasActivityOnlyFilters = Boolean(
      appliedFilters.priceRange || appliedFilters.rating || appliedFilters.duration
    );

    const filteredPlaces = rawResults.places
      .filter((place) => matchesQuery(place, 'place', appliedFilters.q))
      .filter((place) => matchesCategory(place, appliedFilters.category))
      .filter((place) => !appliedFilters.rating || matchesRating(place, appliedFilters.rating))
      .filter((place) => !hasActivityOnlyFilters);

    const filteredActivities = rawResults.activities
      .filter((activity) => matchesQuery(activity, 'activity', appliedFilters.q))
      .filter((activity) => matchesCategory(activity, appliedFilters.category))
      .filter((activity) => matchesPrice(activity, appliedFilters.priceRange))
      .filter((activity) => matchesRating(activity, appliedFilters.rating))
      .filter((activity) => matchesDuration(activity, appliedFilters.duration));

    return {
      places: sortResults(filteredPlaces, 'place', appliedFilters.sort),
      activities: sortResults(filteredActivities, 'activity', appliedFilters.sort),
    };
  }, [appliedFilters, rawResults]);

  const totalResults = useMemo(
    () => results.places.length + results.activities.length,
    [results]
  );

  const removeChip = (k) => {
    const next = { ...appliedFilters, [k]: '' };
    setAppliedFilters(next);
    setFilters((f) => ({ ...f, [k]: '' }));
    updateURL(next);
  };

  // Handle image errors
  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
    e.target.className = e.target.className + ' bg-gradient-to-br from-blue-50 to-indigo-100';
  };

  /* ----------------------------- UI ----------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {filters.q ? `Search results for "${filters.q}"` : 'Explore Experiences'}
            </h1>
            <div className="mt-1 text-sm text-slate-600">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : (
                `${totalResults.toLocaleString()} experience${totalResults !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowFilters(true)} 
              className="inline-flex items-center gap-2 lg:hidden" 
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterEntries.length ? `(${activeFilterEntries.length})` : ''}
            </Button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterEntries.length > 0 && (
          <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-white/80 backdrop-blur border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {activeFilterEntries.map(([k, v]) => (
                <Chip key={k} onRemove={() => removeChip(k)}>
                  {k === 'priceRange' ? `Price ${v}` :
                   k === 'rating' ? `${v}+ stars` :
                   k === 'duration' ? v :
                   k === 'type' ? (v === 'activity' ? 'Activities' : 'Places') :
                   v}
                </Chip>
              ))}
              <Button variant="outline" size="sm" onClick={clearFilters} className="ml-auto border-slate-300 text-slate-700 hover:bg-slate-50">
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              {error}{' '}
              <button 
                className="underline font-medium" 
                onClick={() => fetchResults(appliedFilters)}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar (desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              apply={(next) => debouncedApply(next)}
              applyNow={() => { setAppliedFilters(filters); updateURL(filters); }}
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading && results.places.length === 0 && results.activities.length === 0 ? (
              <div className="space-y-8"><SkeletonList count={6} /></div>
            ) : (results.places.length + results.activities.length) === 0 ? (
              <EmptySearchResults 
                query={filters.q} 
                onClearFilters={clearFilters} 
                hasActiveFilters={activeFilterEntries.length > 0} 
              />
            ) : (
              <div className="space-y-12">
                {/* Places section */}
                {(!appliedFilters.type || appliedFilters.type === 'place') && results.places.length > 0 && (
                  <section aria-label="Destinations">
                    <HeaderWithCount title="Destinations" count={results.places.length}>
                      {results.places.length > 4 && (
                        <Link
                          to={`/search?${new URLSearchParams({ ...appliedFilters, type: 'place' }).toString()}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                        >
                          View all destinations
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      )}
                    </HeaderWithCount>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.places.map((place) => (
                        <PlaceCard 
                          key={place._id || place.id} 
                          place={place} 
                          onImageError={handleImageError}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Activities section */}
                {(!appliedFilters.type || appliedFilters.type === 'activity') && results.activities.length > 0 && (
                  <section aria-label="Activities">
                    <HeaderWithCount title="Activities" count={results.activities.length}>
                      {results.activities.length > 8 && (
                        <Link
                          to={`/search?${new URLSearchParams({ ...appliedFilters, type: 'activity' }).toString()}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center transition-colors"
                        >
                          View all activities
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      )}
                    </HeaderWithCount>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {results.activities.map((activity) => (
                        <ActivityCard 
                          key={activity._id || activity.id} 
                          activity={activity} 
                          onImageError={handleImageError}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-800">Filters</h3>
              <button 
                className="p-2 rounded-md hover:bg-slate-100 transition-colors" 
                onClick={() => setShowFilters(false)} 
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              apply={(next) => debouncedApply(next)}
              applyNow={() => { 
                setAppliedFilters(filters); 
                updateURL(filters); 
                setShowFilters(false); 
              }}
              mobile
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Filters Panel --------------------------- */
function FiltersPanel({ filters, setFilters, apply, applyNow, mobile = false }) {
  const row = (children) => <div className="space-y-2">{children}</div>;
  const activityOnlyDisabled = filters.type === 'place';

  const handleTypeChange = (type) => {
    const next =
      type === 'place'
        ? { ...filters, type, priceRange: '', rating: '', duration: '' }
        : { ...filters, type };

    setFilters(next);
    apply(next);
  };

  return (
    <Card className="border border-slate-200 rounded-2xl">
      <CardContent className="p-4 space-y-6">
        {/* Type filter */}
        {row(
          <>
            <label className="block text-sm font-medium text-slate-800 mb-1">Type</label>
            <div className="flex gap-2">
              {[
                { v: '', label: 'All' },
                { v: 'place', label: 'Places' },
                { v: 'activity', label: 'Activities' },
              ].map((t) => (
                <button
                  key={t.v || 'all'}
                  type="button"
                  onClick={() => handleTypeChange(t.v)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    filters.type === t.v 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-pressed={filters.type === t.v}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Category filter */}
        {row(
          <>
            <label className="block text-sm font-medium text-slate-800 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    const next = { ...filters, category: filters.category === c.value ? '' : c.value };
                    setFilters(next); 
                    apply(next);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    filters.category === c.value 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-pressed={filters.category === c.value}
                >
                  <span className="mr-1">{c.icon}</span>{c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Price filter */}
        {row(
          <>
            <label className="block text-sm font-medium text-slate-800 mb-1">Price</label>
            <div className={`space-y-2 ${activityOnlyDisabled ? 'opacity-50' : ''}`}>
              {PRICE_RANGES.map((r) => (
                <label key={r.value} className="flex items-center">
                  <input
                    type="radio"
                    name={`price${mobile ? '-m' : ''}`}
                    value={r.value}
                    checked={filters.priceRange === r.value}
                    disabled={activityOnlyDisabled}
                    onChange={(e) => { 
                      const next = { ...filters, priceRange: e.target.value }; 
                      setFilters(next); 
                      apply(next); 
                    }}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{r.label}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`price${mobile ? '-m' : ''}`}
                  value=""
                  checked={filters.priceRange === ''}
                  disabled={activityOnlyDisabled}
                  onChange={() => { 
                    const next = { ...filters, priceRange: '' }; 
                    setFilters(next); 
                    apply(next); 
                  }}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Any</span>
              </label>
            </div>
            {activityOnlyDisabled ? <p className="text-xs text-slate-500">Price filter applies to activities only.</p> : null}
          </>
        )}

        {/* Rating filter */}
        {row(
          <>
            <label className="block text-sm font-medium text-slate-800 mb-1">Rating</label>
            <div className={`space-y-2 ${activityOnlyDisabled ? 'opacity-50' : ''}`}>
              {[5, 4.5, 4].map((r) => (
                <label key={r} className="flex items-center">
                  <input
                    type="radio"
                    name={`rating${mobile ? '-m' : ''}`}
                    value={String(r)}
                    checked={filters.rating === String(r)}
                    disabled={activityOnlyDisabled}
                    onChange={(e) => { 
                      const next = { ...filters, rating: e.target.value }; 
                      setFilters(next); 
                      apply(next); 
                    }}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-slate-700">{r}+ Stars</span>
                  </div>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`rating${mobile ? '-m' : ''}`}
                  value=""
                  checked={filters.rating === ''}
                  disabled={activityOnlyDisabled}
                  onChange={() => { 
                    const next = { ...filters, rating: '' }; 
                    setFilters(next); 
                    apply(next); 
                  }}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Any</span>
              </label>
            </div>
            {activityOnlyDisabled ? <p className="text-xs text-slate-500">Rating filter applies to activities only.</p> : null}
          </>
        )}

        {/* Duration filter */}
        {row(
          <>
            <label className="block text-sm font-medium text-slate-800 mb-1">Duration</label>
            <div className={`space-y-2 ${activityOnlyDisabled ? 'opacity-50' : ''}`}>
              {[
                { v: 'short', label: 'Up to 2 hours' },
                { v: 'halfday', label: '2–5 hours' },
                { v: 'fullday', label: '5–10 hours' },
                { v: 'multiday', label: '10+ hours' },
              ].map((d) => (
                <label key={d.v} className="flex items-center">
                  <input
                    type="radio"
                    name={`duration${mobile ? '-m' : ''}`}
                    value={d.v}
                    checked={filters.duration === d.v}
                    disabled={activityOnlyDisabled}
                    onChange={(e) => { 
                      const next = { ...filters, duration: e.target.value }; 
                      setFilters(next); 
                      apply(next); 
                    }}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{d.label}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`duration${mobile ? '-m' : ''}`}
                  value=""
                  checked={filters.duration === ''}
                  disabled={activityOnlyDisabled}
                  onChange={() => { 
                    const next = { ...filters, duration: '' }; 
                    setFilters(next); 
                    apply(next); 
                  }}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Any</span>
              </label>
            </div>
            {activityOnlyDisabled ? <p className="text-xs text-slate-500">Duration filter applies to activities only.</p> : null}
          </>
        )}

        <div className="pt-2">
          <Button 
            onClick={applyNow} 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------- UI Components -------------------------- */
function HeaderWithCount({ title, count, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-slate-800">
        {title} ({count})
      </h2>
      {children}
    </div>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
      <button 
        onClick={onRemove} 
        className="ml-1 rounded-full p-0.5 hover:bg-slate-200 transition-colors" 
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function RatingPill({ rating, count }) {
  if (!rating && !count) return null;
  const r = rating ? Number(rating).toFixed(1) : 'New';
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-1 text-white text-xs font-semibold">
      <Star className="h-3.5 w-3.5 fill-white" />
      <span>{r}</span>
      {count ? <span className="text-white/90">({count})</span> : null}
    </span>
  );
}

function PerksRow({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
      {items.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          {p}
        </span>
      ))}
    </div>
  );
}

function PriceLine({ amount, per = 'per person' }) {
  if (!amount) return null;
  return (
    <div className="mt-2 flex items-baseline gap-1">
      <span className="text-xs text-slate-500">From</span>
      <span className="text-lg font-extrabold text-slate-800">{amount}</span>
      <span className="text-xs text-slate-500">{per}</span>
    </div>
  );
}

function ActivityCard({ activity, onImageError }) {
  const title = activity?.title || 'Untitled Activity';
  const city = activity?.place?.city || activity?.city;
  const duration = activity?.duration || (activity?.durationMinutes ? formatDuration(activity.durationMinutes) : null);
  const rating = activity?.averageRating || activity?.rating?.avg;
  const count = activity?.totalReviews || activity?.rating?.count;
  const images = getValidImages(activity?.images || []);
  const hasImages = images.length > 0;

  return (
    <Link to={`/activities/${activity._id || activity.id}`} className="group block" aria-label={`Book ${title}`}>
      <Card className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 bg-white">
        <div className="relative h-44 bg-gradient-to-br from-slate-50 to-blue-50">
          {hasImages ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={onImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl">{getCategoryEmoji(activity?.category)}</div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {city ? <Pill>{city}</Pill> : null}
            {activity?.category ? <Pill className="capitalize">{activity.category}</Pill> : null}
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <RatingPill rating={rating} count={count} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {duration ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                {duration}
              </span>
            ) : null}
            {city ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {city}
              </span>
            ) : null}
          </div>

          <PerksRow items={['Free cancellation', 'Reserve now & pay later']} />
          <PriceLine amount={formatINR(activity?.price || activity?.basePrice)} />
        </CardContent>
      </Card>
    </Link>
  );
}

function PlaceCard({ place, onImageError }) {
  const title = place?.title || place?.name || 'Untitled destination';
  const city = place?.city || place?.location?.city || place?.location;
  const rating = place?.averageRating || place?.rating?.avg;
  const count = place?.totalReviews || place?.rating?.count;
  const images = getValidImages(place?.images || []);
  const hasImages = images.length > 0;

  return (
    <Link to={`/places/${place._id || place.id}`} className="group block" aria-label={`Explore ${title}`}>
      <Card className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 bg-white">
        <div className="relative h-52 bg-gradient-to-br from-blue-50 to-indigo-100">
          {hasImages ? (
            <img
              src={images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={onImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl">📍</div>
            </div>
          )}
          
          {place?.featured && (
            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
              <Star className="h-3 w-3 fill-white" />
              Featured
            </div>
          )}
          
          {city && (
            <div className="absolute bottom-3 left-3">
              <Pill><MapPin className="inline h-3.5 w-3.5 mr-1" />{city}</Pill>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <RatingPill rating={rating} count={count} />
          </div>

          <PerksRow items={['Top sights', 'Locals recommend']} />
          <div className="mt-3 inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
            <span className="text-sm">Explore</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Pill({ children, className = '' }) {
  return (
    <span className={`rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ${className}`}>
      {children}
    </span>
  );
}

function EmptySearchResults({ query, onClearFilters, hasActiveFilters }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 mb-4">
        <SearchIcon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-1">No results found</h3>
      <p className="text-slate-600">
        {query ? `Couldn't find matches for "${query}".` : 'Try adjusting your filters.'}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {hasActiveFilters ? (
          <Button variant="outline" onClick={onClearFilters} className="border-slate-300 text-slate-700 hover:bg-slate-50">Clear filters</Button>
        ) : (
          <Link to="/"><Button>Go to Home</Button></Link>
        )}
      </div>
    </div>
  );
}
