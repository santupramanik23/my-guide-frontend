// Sample data store for development/demo purposes
import { create } from 'zustand';

// ---- Sample Data ----
export const PLACES = [
  { id: '1', name: 'Victoria Memorial', category: 'cultural', city: 'Kolkata', country: 'India', featured: true, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Iconic marble building and museum dedicated to Queen Victoria' },
  { id: '2', name: 'Howrah Bridge', category: 'cultural', city: 'Kolkata', country: 'India', featured: true, images: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41'], description: 'Famous cantilever bridge over Hooghly River' },
  { id: '3', name: 'Prinsep Ghat', category: 'nature', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Scenic riverside ghat with colonial architecture' },
  { id: '4', name: 'Marble Palace', category: 'art', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Neoclassical mansion with art collection' },
  { id: '5', name: 'Jorasanko Thakur Bari', category: 'cultural', city: 'Kolkata', country: 'India', featured: true, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Birthplace of Rabindranath Tagore' },
  { id: '6', name: 'Indian Museum', category: 'art', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Oldest and largest museum in India' },
  { id: '7', name: 'Dakshineswar Kali Temple', category: 'spiritual', city: 'Kolkata', country: 'India', featured: true, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Hindu temple dedicated to Goddess Kali' },
  { id: '8', name: 'Belur Math', category: 'spiritual', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Headquarters of Ramakrishna Mission' },
  { id: '9', name: 'College Street', category: 'cultural', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Famous street of books and educational institutions' },
  { id: '10', name: 'Park Street', category: 'food', city: 'Kolkata', country: 'India', featured: true, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Popular street for restaurants and nightlife' },
  { id: '11', name: 'Metropolitan Building', category: 'cultural', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Historic colonial-era building' },
  { id: '12', name: 'St. Paul\'s Cathedral', category: 'cultural', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Anglican cathedral with Gothic architecture' },
  { id: '13', name: 'Town Hall', category: 'cultural', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Historic building in Greek Revival style' },
  { id: '14', name: 'Writers\' Building', category: 'cultural', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Former office of the Chief Minister of West Bengal' },
  { id: '15', name: 'Kalighat Temple', category: 'spiritual', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Hindu temple dedicated to Goddess Kali' },
  { id: '16', name: 'Pareshnath Jain Temple', category: 'spiritual', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Beautiful Jain temple with intricate glasswork' },
  { id: '17', name: 'Armenian Church of Nazareth', category: 'spiritual', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Oldest Armenian church in Kolkata' },
  { id: '18', name: 'Academy of Fine Arts', category: 'art', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Premier art institution in Kolkata' },
  { id: '19', name: 'Nandan & Rabindra Sadan', category: 'entertainment', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Cultural complex for films and performances' },
  { id: '20', name: 'Birla Planetarium', category: 'entertainment', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Largest planetarium in Asia' },
  { id: '21', name: 'Science City', category: 'entertainment', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Science museum and educational center' },
  { id: '22', name: 'Kolkata Tram Ride', category: 'adventure', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Heritage tram ride through the city' },
  { id: '23', name: 'Maidan', category: 'nature', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Large urban park in central Kolkata' },
  { id: '24', name: 'Botanical Garden (Shibpur)', category: 'nature', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Botanical gardens with the Great Banyan Tree' },
  { id: '25', name: 'Alipore Zoo', category: 'nature', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Oldest zoological park in India' },
  { id: '26', name: 'Eco Park (New Town)', category: 'nature', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Urban ecological park with recreational facilities' },
  { id: '27', name: 'Nicco Park', category: 'entertainment', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Amusement park with rides and attractions' },
  { id: '28', name: 'New Market', category: 'shopping', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Historic shopping destination' },
  { id: '29', name: 'Burrabazar', category: 'shopping', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'One of the largest wholesale markets in India' },
  { id: '30', name: 'Chinatown (Tiretta Bazaar & Tangra)', category: 'food', city: 'Kolkata', country: 'India', featured: false, images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'], description: 'Historic Chinese neighborhood with authentic cuisine' },
];

export const ACTIVITIES = [
  {
    id: '1',
    title: 'Victoria Memorial Heritage Walk',
    category: 'cultural',
    price: 549,
    durationMinutes: 60,
    placeId: '2',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Heritage Walk at the iconic Victoria Memorial'
  },
  {
    id: '2',
    title: 'Howrah Bridge Sunrise Photo Tour',
    category: 'cultural',
    price: 899,
    durationMinutes: 60,
    placeId: '3',
    featured: true,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Sunrise Photo Tour at the iconic Howrah Bridge'
  },
  {
    id: '3',
    title: 'Prinsep Ghat Sunset Boat Ride',
    category: 'nature',
    price: 699,
    durationMinutes: 60,
    placeId: '4',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Sunset Boat Ride at the iconic Prinsep Ghat'
  },
  {
    id: '4',
    title: 'Marble Palace Art & Architecture Tour',
    category: 'art',
    price: 599,
    durationMinutes: 120,
    placeId: '5',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Art & Architecture Tour at the iconic Marble Palace'
  },
  {
    id: '5',
    title: 'College Street Book-Hunting with Chai',
    category: 'cultural',
    price: 499,
    durationMinutes: 120,
    placeId: '6',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Book-Hunting with Chai at the iconic College Street'
  },
  {
    id: '6',
    title: 'Park Street Food Crawl',
    category: 'food',
    price: 999,
    durationMinutes: 90,
    placeId: '7',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Food Crawl at the iconic Park Street'
  },
  {
    id: '7',
    title: 'Belur Math Spiritual Evening Aarti',
    category: 'spiritual',
    price: 399,
    durationMinutes: 120,
    placeId: '8',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Spiritual Evening Aarti at the iconic Belur Math'
  },
  {
    id: '8',
    title: 'Dakshineswar Temple Morning Darshan',
    category: 'spiritual',
    price: 599,
    durationMinutes: 120,
    placeId: '9',
    featured: true,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Morning Darshan at the iconic Dakshineswar Temple'
  },
  {
    id: '9',
    title: 'Kolkata Tram Heritage Ride',
    category: 'adventure',
    price: 699,
    durationMinutes: 90,
    placeId: '10',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Heritage Ride at the iconic Kolkata Tram'
  },
  {
    id: '10',
    title: 'Eco Park Cycling Loop',
    category: 'nature',
    price: 599,
    durationMinutes: 45,
    placeId: '11',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Cycling Loop at the iconic Eco Park'
  },
  {
    id: '11',
    title: 'Science City Curious Minds Tour',
    category: 'entertainment',
    price: 899,
    durationMinutes: 120,
    placeId: '12',
    featured: true,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Curious Minds Tour at the iconic Science City'
  },
  {
    id: '12',
    title: 'New Market Old-World Shopping Tour',
    category: 'shopping',
    price: 799,
    durationMinutes: 90,
    placeId: '13',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Old-World Shopping Tour at the iconic New Market'
  },
  {
    id: '13',
    title: 'Kumartuli Clay Idol Making Workshop',
    category: 'cultural',
    price: 999,
    durationMinutes: 75,
    placeId: '14',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Clay Idol Making Workshop at the iconic Kumartuli'
  },
  {
    id: '14',
    title: 'Alipore Zoo Family Animal Adventure',
    category: 'entertainment',
    price: 599,
    durationMinutes: 120,
    placeId: '15',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Family Animal Adventure at the iconic Alipore Zoo'
  },
  {
    id: '15',
    title: 'Rabindra Sarobar Morning Nature Walk',
    category: 'nature',
    price: 549,
    durationMinutes: 45,
    placeId: '16',
    featured: true,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Morning Nature Walk at the iconic Rabindra Sarobar'
  },
  {
    id: '16',
    title: 'South City Mall Shopping Spree',
    category: 'shopping',
    price: 549,
    durationMinutes: 120,
    placeId: '17',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Shopping Spree at the iconic South City Mall'
  },
  {
    id: '17',
    title: 'Birla Planetarium Star Gazing Show',
    category: 'entertainment',
    price: 599,
    durationMinutes: 45,
    placeId: '18',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Star Gazing Show at the iconic Birla Planetarium'
  },
  {
    id: '18',
    title: 'Jorasanko Thakur Bari Tagore Heritage Tour',
    category: 'cultural',
    price: 599,
    durationMinutes: 90,
    placeId: '19',
    featured: true,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Tagore Heritage Tour at the iconic Jorasanko Thakur Bari'
  },
  {
    id: '19',
    title: 'Indian Museum History Mystery Hunt',
    category: 'cultural',
    price: 999,
    durationMinutes: 45,
    placeId: '20',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'History Mystery Hunt at the iconic Indian Museum'
  },
  {
    id: '20',
    title: 'Salt Lake Stadium Football Fan Experience',
    category: 'sports',
    price: 799,
    durationMinutes: 75,
    placeId: '21',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Football Fan Experience at the iconic Salt Lake Stadium'
  },
  {
    id: '21',
    title: 'St. Pauls Cathedral Architectural Photo Tour',
    category: 'art',
    price: 549,
    durationMinutes: 60,
    placeId: '22',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Architectural Photo Tour at the iconic St. Pauls Cathedral'
  },
  {
    id: '22',
    title: 'Millennium Park Evening Riverside Stroll',
    category: 'nature',
    price: 399,
    durationMinutes: 90,
    placeId: '23',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Evening Riverside Stroll at the iconic Millennium Park'
  },
  {
    id: '23',
    title: 'Elliot Park Picnic & Games',
    category: 'recreation',
    price: 999,
    durationMinutes: 75,
    placeId: '24',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Picnic & Games at the iconic Elliot Park'
  },
  {
    id: '24',
    title: 'Nicco Park Adventure Rides Day',
    category: 'entertainment',
    price: 799,
    durationMinutes: 60,
    placeId: '25',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Adventure Rides Day at the iconic Nicco Park'
  },
  {
    id: '25',
    title: 'Mother House Mother Teresa Legacy Tour',
    category: 'spiritual',
    price: 549,
    durationMinutes: 75,
    placeId: '26',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Mother Teresa Legacy Tour at the iconic Mother House'
  },
  {
    id: '26',
    title: 'Sealdah Market Morning Bazaar Walk',
    category: 'shopping',
    price: 899,
    durationMinutes: 120,
    placeId: '27',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Morning Bazaar Walk at the iconic Sealdah Market'
  },
  {
    id: '27',
    title: 'Sovabazar Rajbari Zamindar Palace Tour',
    category: 'cultural',
    price: 499,
    durationMinutes: 45,
    placeId: '28',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Zamindar Palace Tour at the iconic Sovabazar Rajbari'
  },
  {
    id: '28',
    title: 'Metcalfe Hall Colonial Archives Tour',
    category: 'history',
    price: 999,
    durationMinutes: 90,
    placeId: '29',
    featured: true,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Colonial Archives Tour at the iconic Metcalfe Hall'
  },
  {
    id: '29',
    title: 'Nandan Bengali Film Lovers Meetup',
    category: 'entertainment',
    price: 499,
    durationMinutes: 90,
    placeId: '30',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Bengali Film Lovers Meetup at the iconic Nandan'
  },
  {
    id: '30',
    title: 'Deshapriya Park Morning Yoga & Wellness',
    category: 'wellness',
    price: 599,
    durationMinutes: 45,
    placeId: '31',
    featured: false,
    isPublished: true,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96'],
    description: 'Morning Yoga & Wellness at the iconic Deshapriya Park'
  }
];

// Sample users for demonstration
export const USERS = [
  { id: '1', name: 'Abir Ghosh', email: 'abir.ghosh@example.com', role: 'guide', createdAt: new Date('2024-04-28'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '2', name: 'Koushik Ghosh', email: 'koushik.ghosh@example.com', role: 'admin', createdAt: new Date('2024-08-24'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '3', name: 'Ipsita Pal', email: 'ipsita.pal@example.com', role: 'instructor', createdAt: new Date('2024-06-03'), avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: '4', name: 'Swagata Nandi', email: 'swagata.nandi@example.com', role: 'traveller', createdAt: new Date('2024-06-13'), avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328f9b5b?w=150' },
  { id: '5', name: 'Sougata Banerjee', email: 'sougata.banerjee@example.com', role: 'instructor', createdAt: new Date('2024-05-11'), avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328f9b5b?w=150' },
  { id: '6', name: 'Sourav Saha', email: 'sourav.saha@example.com', role: 'advisor', createdAt: new Date('2024-08-18'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '7', name: 'Trina Sen', email: 'trina.sen@example.com', role: 'admin', createdAt: new Date('2024-08-16'), avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: '8', name: 'Sneha Bhattacharya', email: 'sneha.bhattacharya@example.com', role: 'admin', createdAt: new Date('2024-03-21'), avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328f9b5b?w=150' },
  { id: '9', name: 'Ipsita Bhattacharya', email: 'ipsita.bhattacharya@example.com', role: 'guide', createdAt: new Date('2024-03-20'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '10', name: 'Swagata Mondal', email: 'swagata.mondal@example.com', role: 'instructor', createdAt: new Date('2024-05-09'), avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: '11', name: 'Shreya Dutta', email: 'shreya.dutta@example.com', role: 'admin', createdAt: new Date('2024-07-07'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '12', name: 'Swagata Roy', email: 'swagata.roy@example.com', role: 'advisor', createdAt: new Date('2024-02-14'), avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69b4bd2?w=150' },
  { id: '13', name: 'Subhajit Bose', email: 'subhajit.bose@example.com', role: 'instructor', createdAt: new Date('2024-08-04'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '14', name: 'Shreya Banerjee', email: 'shreya.banerjee@example.com', role: 'guide', createdAt: new Date('2024-01-14'), avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: '15', name: 'Riya Mukherjee', email: 'riya.mukherjee@example.com', role: 'guide', createdAt: new Date('2024-08-07'), avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: '16', name: 'Sayani Chatterjee', email: 'sayani.chatterjee@example.com', role: 'instructor', createdAt: new Date('2024-08-26'), avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328f9b5b?w=150' },
  { id: '17', name: 'Indrani Chatterjee', email: 'indrani.chatterjee@example.com', role: 'admin', createdAt: new Date('2024-06-03'), avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: '18', name: 'Ritwik Sen', email: 'ritwik.sen@example.com', role: 'advisor', createdAt: new Date('2024-06-25'), avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69b4bd2?w=150' },
  { id: '19', name: 'Riya Bose', email: 'riya.bose@example.com', role: 'advisor', createdAt: new Date('2024-06-28'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '20', name: 'Subhajit Biswas', email: 'subhajit.biswas@example.com', role: 'advisor', createdAt: new Date('2024-01-15'), avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: '21', name: 'Moumita Chatterjee', email: 'moumita.chatterjee@example.com', role: 'instructor', createdAt: new Date('2024-06-03'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '22', name: 'Ritika Roy', email: 'ritika.roy@example.com', role: 'admin', createdAt: new Date('2024-07-25'), avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328f9b5b?w=150' },
  { id: '23', name: 'Anirban Bhattacharya', email: 'anirban.bhattacharya@example.com', role: 'traveller', createdAt: new Date('2024-04-17'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '24', name: 'Rajdeep Roy', email: 'rajdeep.roy@example.com', role: 'admin', createdAt: new Date('2024-06-27'), avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: '25', name: 'Sneha Ghosh', email: 'sneha.ghosh@example.com', role: 'instructor', createdAt: new Date('2024-08-19'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '26', name: 'Swagata De', email: 'swagata.de@example.com', role: 'instructor', createdAt: new Date('2024-01-23'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '27', name: 'Sudip Pal', email: 'sudip.pal@example.com', role: 'traveller', createdAt: new Date('2024-04-10'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '28', name: 'Subhajit Saha', email: 'subhajit.saha@example.com', role: 'traveller', createdAt: new Date('2024-01-21'), avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: '29', name: 'Titli Biswas', email: 'titli.biswas@example.com', role: 'traveller', createdAt: new Date('2024-01-18'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '30', name: 'Indrani Chatterjee', email: 'indrani.chatterjee@example.com', role: 'instructor', createdAt: new Date('2024-05-02'), avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69b4bd2?w=150' },
  { id: '31', name: 'Sayani Sarkar', email: 'sayani.sarkar@example.com', role: 'guide', createdAt: new Date('2024-01-08'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '32', name: 'Sougata Banerjee', email: 'sougata.banerjee@example.com', role: 'traveller', createdAt: new Date('2024-07-23'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '33', name: 'Ipsita Chakraborty', email: 'ipsita.chakraborty@example.com', role: 'traveller', createdAt: new Date('2024-08-12'), avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328f9b5b?w=150' },
  { id: '34', name: 'Trina Sen', email: 'trina.sen@example.com', role: 'advisor', createdAt: new Date('2024-07-17'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '35', name: 'Saptarshi Das', email: 'saptarshi.das@example.com', role: 'guide', createdAt: new Date('2024-01-06'), avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150' },
  { id: '36', name: 'Ritwik Roy', email: 'ritwik.roy@example.com', role: 'traveller', createdAt: new Date('2024-02-22'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '37', name: 'Abir Roy', email: 'abir.roy@example.com', role: 'instructor', createdAt: new Date('2024-04-11'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '38', name: 'Shreya Nandi', email: 'shreya.nandi@example.com', role: 'instructor', createdAt: new Date('2024-02-18'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '39', name: 'Ritwik Guha', email: 'ritwik.guha@example.com', role: 'advisor', createdAt: new Date('2024-01-21'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '40', name: 'Subhajit Das', email: 'subhajit.das@example.com', role: 'admin', createdAt: new Date('2024-06-13'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '41', name: 'Koushik Nandi', email: 'koushik.nandi@example.com', role: 'traveller', createdAt: new Date('2024-07-13'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '42', name: 'Suman Banerjee', email: 'suman.banerjee@example.com', role: 'traveller', createdAt: new Date('2024-08-12'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '43', name: 'Abir Ghosh', email: 'abir.ghosh@example.com', role: 'admin', createdAt: new Date('2024-05-08'), avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?w=150' },
  { id: '44', name: 'Ritika Sen', email: 'ritika.sen@example.com', role: 'guide', createdAt: new Date('2024-01-02'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '45', name: 'Anirban Nandi', email: 'anirban.nandi@example.com', role: 'admin', createdAt: new Date('2024-04-15'), avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: '46', name: 'Niladri Mukherjee', email: 'niladri.mukherjee@example.com', role: 'advisor', createdAt: new Date('2024-02-01'), avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: '47', name: 'Payel Chakraborty', email: 'payel.chakraborty@example.com', role: 'advisor', createdAt: new Date('2024-01-30'), avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '48', name: 'Abir Biswas', email: 'abir.biswas@example.com', role: 'guide', createdAt: new Date('2024-01-12'), avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: '49', name: 'Rajdeep Bose', email: 'rajdeep.bose@example.com', role: 'traveller', createdAt: new Date('2024-03-02'), avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
];



// Sample bookings
export const BOOKINGS = [
  { id: '1', userId: '1', activityId: '1', status: 'confirmed', totalAmount: 699, bookingDate: new Date('2024-03-15'), createdAt: new Date('2024-03-10'), paymentId: 'pay_001', paymentMethod: 'UPI' },
  { id: '2', userId: '2', activityId: '6', status: 'confirmed', totalAmount: 999, bookingDate: new Date('2024-03-18'), createdAt: new Date('2024-03-12'), paymentId: 'pay_002', paymentMethod: 'Card' },
  { id: '3', userId: '3', activityId: '3', status: 'pending', totalAmount: 899, bookingDate: new Date('2024-03-20'), createdAt: new Date('2024-03-14'), paymentId: null, paymentMethod: null },
  { id: '4', userId: '1', activityId: '5', status: 'confirmed', totalAmount: 499, bookingDate: new Date('2024-03-22'), createdAt: new Date('2024-03-16'), paymentId: 'pay_004', paymentMethod: 'Net Banking' },
  { id: '5', userId: '4', activityId: '2', status: 'confirmed', totalAmount: 899, bookingDate: new Date('2024-04-10'), createdAt: new Date('2024-04-05'), paymentId: 'pay_005', paymentMethod: 'UPI' },
  { id: '6', userId: '4', activityId: '7', status: 'confirmed', totalAmount: 649, bookingDate: new Date('2024-04-20'), createdAt: new Date('2024-04-14'), paymentId: 'pay_006', paymentMethod: 'Card' },
  { id: '7', userId: '4', activityId: '15', status: 'confirmed', totalAmount: 549, bookingDate: new Date('2024-05-05'), createdAt: new Date('2024-04-28'), paymentId: 'pay_007', paymentMethod: 'UPI' },
  { id: '8', userId: '4', activityId: '18', status: 'cancelled', totalAmount: 599, bookingDate: new Date('2024-05-15'), createdAt: new Date('2024-05-08'), paymentId: 'pay_008', paymentMethod: 'Card' },
];

// Sample reviews
export const REVIEWS = [
  { id: '1', userId: '4', activityId: '2', bookingId: '5', rating: 5, title: 'Absolutely Breathtaking!', comment: 'The sunrise photo tour at Howrah Bridge was incredible. Our guide was knowledgeable and the lighting was perfect. Highly recommend!', createdAt: new Date('2024-04-12'), helpful: 8 },
  { id: '2', userId: '4', activityId: '7', bookingId: '6', rating: 4, title: 'Peaceful and Spiritual', comment: 'Visiting Dakshineswar Kali Temple was a beautiful experience. The guide explained the history very well. Could have been a bit longer.', createdAt: new Date('2024-04-22'), helpful: 5 },
  { id: '3', userId: '4', activityId: '15', bookingId: '7', rating: 5, title: 'Perfect Morning Escape', comment: 'The morning nature walk at Rabindra Sarobar was so refreshing. Great way to start the day. The guide was punctual and friendly.', createdAt: new Date('2024-05-07'), helpful: 12 },
];

// Demo data store using Zustand
export const useSampleDataStore = create((set, get) => ({
  places: PLACES,
  activities: ACTIVITIES,
  users: USERS,
  bookings: BOOKINGS,
  reviews: REVIEWS,

  // Places management
  addPlace: (place) => set((state) => ({
    places: [...state.places, { ...place, id: Date.now().toString() }]
  })),
  updatePlace: (id, updates) => set((state) => ({
    places: state.places.map(place => place.id === id ? { ...place, ...updates } : place)
  })),
  deletePlace: (id) => set((state) => ({
    places: state.places.filter(place => place.id !== id)
  })),

  // Activities management  
  addActivity: (activity) => set((state) => ({
    activities: [...state.activities, { ...activity, id: Date.now().toString() }]
  })),
  updateActivity: (id, updates) => set((state) => ({
    activities: state.activities.map(activity => activity.id === id ? { ...activity, ...updates } : activity)
  })),
  deleteActivity: (id) => set((state) => ({
    activities: state.activities.filter(activity => activity.id !== id)
  })),

  // Users management
  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: Date.now().toString() }]
  })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(user => user.id === id ? { ...user, ...updates } : user)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(user => user.id !== id)
  })),

  // Analytics helpers
  getStats: () => {
    const state = get();
    const totalRevenue = state.bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const featuredPlaces = state.places.filter(p => p.featured).length;
    const publishedActivities = state.activities.filter(a => a.isPublished).length;
    
    return {
      totalUsers: state.users.length,
      totalPlaces: state.places.length,
      featuredPlaces,
      totalActivities: state.activities.length,
      publishedActivities,
      totalBookings: state.bookings.length,
      confirmedBookings: state.bookings.filter(b => b.status === 'confirmed').length,
      totalRevenue,
      avgBookingValue: totalRevenue / Math.max(state.bookings.filter(b => b.status === 'confirmed').length, 1)
    };
  }
}));