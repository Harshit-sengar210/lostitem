export type ItemStatus =
  | 'LOST'
  | 'FOUND'
  | 'VERIFIED_PENDING'
  | 'CLAIMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED';

export type ItemCategory =
  | 'phone'
  | 'wallet'
  | 'bag'
  | 'document'
  | 'keys'
  | 'jewellery'
  | 'electronics'
  | 'other';

export interface TimelineEvent {
  status: string;
  time: string;
  completed: boolean;
}

export interface ClaimAnswers {
  lostTime: string;
  lastSeen: string;
  color: string;
  uniqueDetail: string;
  identifier?: string;
}

export interface DeliveryPartner {
  name: string;
  rating: number;
  vehicle: string;
  eta: number; // in minutes
  avatar?: string;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  status: ItemStatus;
  location: string;
  distance: number; // in km
  date: string;
  description: string;
  uniqueDetails: string; // Private detail used for validation check
  image: string;
  finderName: string;
  finderRating: number;
  isVerified: boolean;
  deliveryPartner: DeliveryPartner | null;
  address: string | null;
  paymentMethod: string | null;
  recoveryId: string | null;
  timeline: TimelineEvent[];
  claimAnswers: ClaimAnswers | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  link: string;
}

export const CATEGORIES: { value: ItemCategory; label: string; icon: string }[] = [
  { value: 'phone', label: 'Phones', icon: 'Smartphone' },
  { value: 'wallet', label: 'Wallets', icon: 'Wallet' },
  { value: 'bag', label: 'Bags', icon: 'ShoppingBag' },
  { value: 'document', label: 'Documents', icon: 'FileText' },
  { value: 'keys', label: 'Keys', icon: 'Key' },
  { value: 'jewellery', label: 'Jewellery', icon: 'Gem' },
  { value: 'electronics', label: 'Electronics', icon: 'Laptop' },
  { value: 'other', label: 'Other', icon: 'HelpCircle' },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    name: 'Apple AirPods Pro',
    category: 'electronics',
    status: 'FOUND',
    location: 'Shipra Mall, Indirapuram, Ghaziabad',
    distance: 1.4,
    date: 'Today, 2:35 PM',
    description: 'Found inside the food court area. Case has a small scratch near the charging indicator LED. Sounds perfectly fine and shows 68% battery.',
    uniqueDetails: 'A small red sticker of a lightning bolt is on the back of the case near the hinge.',
    image: '/images/airpods.jpg',
    finderName: 'Rahul Verma',
    finderRating: 4.8,
    isVerified: true,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-2',
    name: 'Black Leather Wallet',
    category: 'wallet',
    status: 'LOST',
    location: 'Aditya Mall, Indirapuram, Ghaziabad',
    distance: 0.8,
    date: 'Yesterday, 8:15 PM',
    description: 'Lost a black Woodland brand leather wallet. Contains minor cash and some cards. It is quite worn around the edges.',
    uniqueDetails: 'Has my old college ID card from Amity and a Metro card with a sticker of a cartoon.',
    image: '/images/wallet.jpg',
    finderName: 'You (Lost Report)',
    finderRating: 5.0,
    isVerified: false,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-3',
    name: 'Blue American Tourister Backpack',
    category: 'bag',
    status: 'FOUND',
    location: 'Sector 62 Metro Station, Noida',
    distance: 2.5,
    date: 'August 19, 11:00 AM',
    description: 'Found left on the platform seating near Gate 2. It contains some textbooks and notebooks. Standard size bag.',
    uniqueDetails: 'The name "Amit" is written in black permanent marker on the internal laptop sleeve.',
    image: '/images/backpack.jpg',
    finderName: 'Inspector S.K. Sharma',
    finderRating: 4.9,
    isVerified: true,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-4',
    name: 'iPhone 15 Pro Max',
    category: 'phone',
    status: 'LOST',
    location: 'Vaishali Metro Station Parking, Ghaziabad',
    distance: 1.9,
    date: 'August 18, 5:40 PM',
    description: 'Lost titanium blue iPhone 15 Pro Max. Had a clear Spigen case on it. Phone is locked and has been put on Lost Mode.',
    uniqueDetails: 'Wallpaper is a picture of a white Samoyed dog. Back glass is slightly cracked in the bottom left corner.',
    image: '/images/iphone.jpg',
    finderName: 'You (Lost Report)',
    finderRating: 5.0,
    isVerified: false,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-5',
    name: 'House Keys with Red Carabiner',
    category: 'keys',
    status: 'FOUND',
    location: 'Swarna Jayanti Park, Indirapuram',
    distance: 0.5,
    date: 'August 18, 9:20 AM',
    description: 'Found a bunch of keys on the jogging track. Included is one large silver key, two small brass keys, and a metallic keyring.',
    uniqueDetails: 'A small blue keychain shaped like a miniature guitar is attached next to the red carabiner.',
    image: '/images/keys.jpg',
    finderName: 'Priya Joshi',
    finderRating: 4.7,
    isVerified: true,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-6',
    name: 'Black Ray-Ban Sunglasses',
    category: 'other',
    status: 'FOUND',
    location: 'Pacific Mall Food Court, Anand Vihar',
    distance: 4.2,
    date: 'August 17, 3:15 PM',
    description: 'Left on a table near the burger outlet. Classic aviator style. Currently kept safe with Mall security.',
    uniqueDetails: 'The right side temple arm is missing the little rubber tip, exposing the bare metal end.',
    image: '/images/sunglasses.jpg',
    finderName: 'Mall Security Office',
    finderRating: 4.9,
    isVerified: true,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-7',
    name: 'Brown Leather Laptop Bag',
    category: 'bag',
    status: 'LOST',
    location: 'Wave City Main Road, Ghaziabad',
    distance: 6.8,
    date: 'August 16, 7:10 PM',
    description: 'Lost a dark brown leather laptop bag. Contains a charger, some office diaries, and custom stationery.',
    uniqueDetails: 'Has a small metallic initial badge "R.K." engraved near the front latch.',
    image: '/images/laptop_bag.jpg',
    finderName: 'You (Lost Report)',
    finderRating: 5.0,
    isVerified: false,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
  {
    id: 'item-8',
    name: 'Student ID Card (Amity)',
    category: 'document',
    status: 'FOUND',
    location: 'Sector 125 Main Gate, Noida',
    distance: 8.5,
    date: 'August 15, 12:40 PM',
    description: 'Found a student ID card on the pavement outside Gate 3. Name and enrollment number are visible.',
    uniqueDetails: 'The card is placed in a transparent plastic cardholder with a red lanyard.',
    image: '/images/id_card.jpg',
    finderName: 'Vikram Singh',
    finderRating: 4.6,
    isVerified: true,
    deliveryPartner: null,
    address: null,
    paymentMethod: null,
    recoveryId: null,
    timeline: [],
    claimAnswers: null,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to FoundBack!',
    description: 'Your recovery platform is ready. Set your location to browse nearby lost and found items.',
    time: '2 hours ago',
    unread: true,
    link: '/location',
  },
  {
    id: 'notif-2',
    title: 'Verification Approved',
    description: 'Your claim verification for Blue American Tourister Backpack has passed. Continue to recovery setup.',
    time: '1 day ago',
    unread: false,
    link: '/recovery/item-3',
  },
];
