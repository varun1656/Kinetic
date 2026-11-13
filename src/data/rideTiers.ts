import { DriverProfile, PaymentMethod, PromoCode, RideTier } from '../types/ride';

export const RIDE_TIERS: RideTier[] = [
  {
    id: 'go',
    name: 'Kinetic Go',
    tagline: 'Compact AC hatchbacks · Everyday',
    capacity: 4,
    baseFare: 45,
    perKmRate: 17,
    etaOffsetMin: 2,
    speedKmh: 26,
    badge: 'Fastest',
  },
  {
    id: 'green',
    name: 'Kinetic Green',
    tagline: 'Zero-emission electric sedans',
    capacity: 4,
    baseFare: 50,
    perKmRate: 18,
    etaOffsetMin: 4,
    speedKmh: 25,
    badge: 'Electric',
    ecoNote: 'Saves 1.4 kg CO₂',
  },
  {
    id: 'auto',
    name: 'Kinetic Auto',
    tagline: 'Direct point-to-point three-wheeler',
    capacity: 3,
    baseFare: 28,
    perKmRate: 12,
    etaOffsetMin: 3,
    speedKmh: 21,
  },
  {
    id: 'premier',
    name: 'Kinetic Premier',
    tagline: 'Executive sedans · Top-rated drivers',
    capacity: 4,
    baseFare: 85,
    perKmRate: 24,
    etaOffsetMin: 5,
    speedKmh: 27,
    badge: 'Top Rated',
  },
  {
    id: 'xl',
    name: 'Kinetic XL',
    tagline: '6-seater SUVs · Extra luggage room',
    capacity: 6,
    baseFare: 115,
    perKmRate: 29,
    etaOffsetMin: 6,
    speedKmh: 25,
  },
];

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'GURGAON20',
    label: '20% off Gurugram rides (up to ₹75)',
    discountPercent: 20,
    maxDiscountInr: 75,
  },
  {
    code: 'CYBER50',
    label: 'Flat 25% off CyberHub & Golf Course Rd (up to ₹90)',
    discountPercent: 25,
    maxDiscountInr: 90,
  },
  {
    code: 'EVGREEN',
    label: '15% eco-mobility credit (up to ₹60)',
    discountPercent: 15,
    maxDiscountInr: 60,
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    label: 'UPI · Instant Pay',
    sublabel: 'varun@okaxis',
    type: 'upi',
  },
  {
    id: 'corp',
    label: 'Kinetic Business',
    sublabel: 'Cyber City Corporate Profile',
    type: 'corporate',
  },
  {
    id: 'card',
    label: 'Visa •••• 4812',
    sublabel: 'Auto-debit enabled',
    type: 'card',
  },
  {
    id: 'cash',
    label: 'Cash',
    sublabel: 'Pay driver at drop-off',
    type: 'cash',
  },
];

export const DRIVER_ROSTER: Record<string, DriverProfile> = {
  go: {
    id: 'drv-go',
    name: 'Rajesh Yadav',
    initials: 'RY',
    rating: 4.92,
    trips: 3420,
    vehicleModel: 'Maruti Suzuki Swift · Arctic White',
    vehicleColor: 'White',
    plate: 'HR 26 DK 4821',
    languages: 'Hindi · English',
  },
  green: {
    id: 'drv-green',
    name: 'Vikram Sharma',
    initials: 'VS',
    rating: 4.96,
    trips: 1890,
    vehicleModel: 'Tata Tigor EV · Pristine White',
    vehicleColor: 'White EV',
    plate: 'HR 26 EV 9042',
    languages: 'Hindi · English',
  },
  auto: {
    id: 'drv-auto',
    name: 'Mahesh Kumar',
    initials: 'MK',
    rating: 4.85,
    trips: 5110,
    vehicleModel: 'Bajaj RE Compact · Kinetic Black',
    vehicleColor: 'Black/Yellow',
    plate: 'HR 55 AC 3174',
    languages: 'Hindi',
  },
  premier: {
    id: 'drv-premier',
    name: 'Harpreet Gill',
    initials: 'HG',
    rating: 4.98,
    trips: 2740,
    vehicleModel: 'Honda City · Obsidian Black',
    vehicleColor: 'Black',
    plate: 'HR 26 EQ 0711',
    languages: 'English · Hindi · Punjabi',
  },
  xl: {
    id: 'drv-xl',
    name: 'Sandeep Chauhan',
    initials: 'SC',
    rating: 4.94,
    trips: 2150,
    vehicleModel: 'Toyota Innova Hycross · Silver',
    vehicleColor: 'Silver',
    plate: 'HR 26 FN 6630',
    languages: 'Hindi · English',
  },
};

export function calculateTierFare(
  tier: RideTier,
  distanceKm: number,
  promo: PromoCode | null
): {
  subtotal: number;
  discount: number;
  total: number;
} {
  const raw = Math.round(tier.baseFare + distanceKm * tier.perKmRate);
  if (!promo) {
    return { subtotal: raw, discount: 0, total: raw };
  }
  const discount = Math.min(promo.maxDiscountInr, Math.round((raw * promo.discountPercent) / 100));
  return {
    subtotal: raw,
    discount,
    total: Math.max(25, raw - discount),
  };
}
