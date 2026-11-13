export interface Point {
  x: number;
  y: number;
}

export type LandmarkCategory =
  | 'hub'
  | 'metro'
  | 'mall'
  | 'park'
  | 'medical'
  | 'residential';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  roadName: string;
  roadClass: 'highway' | 'arterial' | 'street';
  trafficFactor?: number;
}

export interface GurugramLandmark {
  id: string;
  name: string;
  area: string;
  category: LandmarkCategory;
  graphNodeId: string;
  x: number;
  y: number;
  popular?: boolean;
}

export interface LocationSelection {
  id: string;
  name: string;
  area: string;
  graphNodeId: string;
  x: number;
  y: number;
  isCustomPin?: boolean;
}

export type BookingStage =
  | 'planning'
  | 'selecting'
  | 'matching'
  | 'arriving'
  | 'in_progress'
  | 'completed';

export type RideTierId = 'go' | 'auto' | 'green' | 'premier' | 'xl';

export interface RideTier {
  id: RideTierId;
  name: string;
  tagline: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
  etaOffsetMin: number;
  speedKmh: number;
  badge?: string;
  ecoNote?: string;
}

export interface PromoCode {
  code: string;
  label: string;
  discountPercent: number;
  maxDiscountInr: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  sublabel: string;
  type: 'upi' | 'card' | 'corporate' | 'cash';
}

export interface DriverProfile {
  id: string;
  name: string;
  initials: string;
  rating: number;
  trips: number;
  vehicleModel: string;
  vehicleColor: string;
  plate: string;
  languages: string;
}

export interface ComputedRoute {
  polyline: Point[];
  nodeIds: string[];
  distanceKm: number;
  durationMin: number;
  primaryCorridors: string[];
}

export interface AmbientVehicle {
  id: string;
  x: number;
  y: number;
  headingDeg: number;
  fromNodeId: string;
  toNodeId: string;
  t: number;
  speed: number;
}

export type MapPinMode = null | 'pickup' | 'destination' | { stopIndex: number };
