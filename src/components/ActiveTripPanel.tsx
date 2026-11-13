import React, { useState } from 'react';
import {
  CheckCircle2,
  FastForward,
  MessageSquare,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  BookingStage,
  ComputedRoute,
  DriverProfile,
  LocationSelection,
  PaymentMethod,
  PromoCode,
  RideTier,
} from '../types/ride';
import { VehicleSilhouette } from './VehicleIcons';

interface ActiveTripPanelProps {
  stage: BookingStage;
  tier: RideTier;
  driver: DriverProfile;
  pickup: LocationSelection;
  stops: LocationSelection[];
  destination: LocationSelection;
  route: ComputedRoute;
  fare: { subtotal: number; discount: number; total: number };
  paymentMethod: PaymentMethod;
  activePromo: PromoCode | null;
  boardingPin: string;
  driverProgress: number;
  tripProgress: number;
  driverEtaMin: number;
  scheduledTime: string | null;
  onCancelRequest: () => void;
  onBoardAndStartTrip: () => void;
  onFastForwardComplete: () => void;
  onOpenMessageDrawer: () => void;
  onOpenSafetyHub: () => void;
  onResetBooking: () => void;
}

const COMPLIMENT_TAGS = [
  'Smooth navigation',
  'Clean cabin',
  'Polite & punctual',
  'Optimal AC',
];

export const ActiveTripPanel: React.FC<ActiveTripPanelProps> = ({
  stage,
  tier,
  driver,
  pickup,
  stops,
  destination,
  route,
  fare,
  paymentMethod,
  activePromo,
  boardingPin,
  driverProgress,
  tripProgress,
  driverEtaMin,
  scheduledTime,
  onCancelRequest,
  onBoardAndStartTrip,
  onFastForwardComplete,
  onOpenMessageDrawer,
  onOpenSafetyHub,
  onResetBooking,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>(['Smooth navigation']);
  const [callSimulated, setCallSimulated] = useState(false);

  const toggleCompliment = (tag: string) => {
    setSelectedCompliments((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  if (stage === 'matching') {
    return (
      <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#1B1C1C] dark:text-white">
              Connecting you to a driver
            </h2>
            <p className="text-sm text-[#767676]">
              Searching nearby {tier.name} vehicles around {pickup.name}
            </p>
          </div>

          {/* Architectural progress bar */}
          <div className="w-full h-1.5 bg-[#EFEFEF] dark:bg-[#242424] rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#276EF1] animate-pulse rounded-full" />
          </div>

          <div className="p-4 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VehicleSilhouette tierId={tier.id} className="w-12 h-8 text-black dark:text-white" />
              <div>
                <div className="text-sm font-semibold text-[#1B1C1C] dark:text-white">
                  {tier.name}
                </div>
                <div className="text-xs text-[#767676] font-mono-tabular">
                  {route.distanceKm.toFixed(1)} km · ₹{fare.total}
                </div>
              </div>
            </div>
            {scheduledTime && (
              <span className="px-2 py-1 rounded bg-white dark:bg-[#121212] text-xs font-semibold text-[#1B1C1C] dark:text-white">
                {scheduledTime}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onCancelRequest}
          className="w-full h-11 rounded bg-[#FDF2F2] hover:bg-[#FEE2E2] dark:bg-[#E11900]/15 dark:hover:bg-[#E11900]/25 text-[#E11900] text-sm font-semibold transition-colors"
        >
          Cancel request
        </button>
      </div>
    );
  }

  if (stage === 'arriving') {
    const remainingArrivingMin = Math.max(1, Math.ceil(driverEtaMin * (1 - driverProgress)));
    const isDriverAtPickup = driverProgress >= 0.96;

    return (
      <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto kinetic-scroll pr-0.5">
        <div className="space-y-4">
          {/* Status Headline */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#276EF1] tracking-tight">
                {isDriverAtPickup ? 'Driver has arrived at pickup' : 'Driver en route to pickup'}
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#1B1C1C] dark:text-white mt-0.5">
                {isDriverAtPickup ? (
                  'Meet at pickup pin'
                ) : (
                  <span className="font-mono-tabular">
                    Arriving in {remainingArrivingMin} min
                  </span>
                )}
              </h2>
            </div>

            {/* 4-Digit Boarding PIN */}
            <div className="px-3 py-1.5 rounded bg-black text-white dark:bg-white dark:text-black text-center shrink-0">
              <div className="text-[10px] font-medium opacity-75 uppercase tracking-wider">PIN</div>
              <div className="font-mono-tabular text-base font-bold tracking-[0.14em]">
                {boardingPin}
              </div>
            </div>
          </div>

          {/* Driver & Vehicle Identity Card */}
          <div className="p-3.5 rounded border border-[#E2E2E2] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-display text-sm font-bold shrink-0">
                  {driver.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-[#1B1C1C] dark:text-white truncate">
                      {driver.name}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1B1C1C] dark:text-white font-mono-tabular">
                      <Star className="w-3 h-3 fill-current" />
                      {driver.rating.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-[#767676] truncate">
                    {driver.trips.toLocaleString()} trips · {driver.languages}
                  </div>
                </div>
              </div>

              <VehicleSilhouette tierId={tier.id} className="w-14 h-9 text-black dark:text-white shrink-0" />
            </div>

            <div className="pt-2.5 border-t border-[#EFEFEF] dark:border-[#2A2A2A] flex items-center justify-between gap-2">
              <div className="text-xs text-[#4C4546] dark:text-[#A1A1AA] truncate">
                {driver.vehicleModel}
              </div>
              <span className="font-mono-tabular text-xs font-bold uppercase tracking-[0.08em] px-2 py-1 rounded bg-[#F3F3F3] dark:bg-[#262626] text-black dark:text-white shrink-0">
                {driver.plate}
              </span>
            </div>
          </div>

          {/* Quick Contact & Safety Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onOpenMessageDrawer}
              className="h-11 rounded bg-[#F6F6F6] hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:hover:bg-[#262626] text-xs font-semibold text-[#1B1C1C] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCallSimulated(true);
                setTimeout(() => setCallSimulated(false), 2400);
              }}
              className="h-11 rounded bg-[#F6F6F6] hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:hover:bg-[#262626] text-xs font-semibold text-[#1B1C1C] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{callSimulated ? 'Calling...' : 'Call'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSafetyHub}
              className="h-11 rounded bg-[#F6F6F6] hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:hover:bg-[#262626] text-xs font-semibold text-[#05A357] dark:text-[#5EDE8B] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety</span>
            </button>
          </div>

          {/* Trip Summary */}
          <div className="text-xs text-[#767676] space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-black dark:bg-white shrink-0" />
              <span className="font-medium text-[#1B1C1C] dark:text-white truncate">{pickup.name}</span>
            </div>
            {stops.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rotate-45 border border-black dark:border-white shrink-0" />
                <span className="truncate">{s.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0" />
              <span className="font-medium text-[#1B1C1C] dark:text-white truncate">{destination.name}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#E2E2E2] dark:border-[#262626]">
          <button
            type="button"
            onClick={onBoardAndStartTrip}
            className="w-full h-12 rounded bg-black hover:bg-[#262626] dark:bg-white dark:hover:bg-[#E4E4E7] text-white dark:text-black text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>{isDriverAtPickup ? 'Verify PIN & Start Trip' : 'Simulate Driver Arrival & Board'}</span>
          </button>
          <button
            type="button"
            onClick={onCancelRequest}
            className="w-full h-10 rounded bg-transparent hover:bg-[#FDF2F2] dark:hover:bg-[#E11900]/15 text-[#E11900] text-xs font-semibold transition-colors"
          >
            Cancel ride
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'in_progress') {
    const remainingKm = Math.max(0.1, Number((route.distanceKm * (1 - tripProgress)).toFixed(1)));
    const remainingMin = Math.max(1, Math.ceil(route.durationMin * (1 - tripProgress)));
    const pct = Math.min(100, Math.round(tripProgress * 100));

    return (
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-[#05A357] dark:text-[#5EDE8B]">
                Trip in progress
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#1B1C1C] dark:text-white mt-0.5 font-mono-tabular">
                {remainingMin} min · {remainingKm.toFixed(1)} km left
              </h2>
            </div>
            <span className="font-mono-tabular text-xs font-bold px-2 py-1 rounded bg-[#F3F3F3] dark:bg-[#242424] text-black dark:text-white">
              {pct}%
            </span>
          </div>

          {/* Route Progress Track */}
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-[#EFEFEF] dark:bg-[#242424] rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-150"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#767676]">
              <span className="truncate max-w-[45%]">{pickup.name}</span>
              <span className="truncate max-w-[45%] text-right font-medium text-[#1B1C1C] dark:text-white">
                {destination.name}
              </span>
            </div>
          </div>

          {/* Active Corridor Info */}
          <div className="p-3.5 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-[#767676]">Heading towards</div>
              <div className="text-sm font-semibold text-[#1B1C1C] dark:text-white truncate mt-0.5">
                {destination.name}
              </div>
              {route.primaryCorridors.length > 0 && (
                <div className="text-xs text-[#767676] mt-0.5 truncate">
                  Corridor: {route.primaryCorridors.join(' → ')}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono-tabular text-sm font-bold text-[#1B1C1C] dark:text-white">
                ₹{fare.total}
              </div>
              <div className="text-[11px] text-[#767676]">{paymentMethod.label}</div>
            </div>
          </div>

          {/* Driver Mini Strip */}
          <div className="flex items-center justify-between py-2 border-y border-[#E2E2E2] dark:border-[#262626] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[11px] shrink-0">
                {driver.initials}
              </span>
              <span className="font-semibold text-[#1B1C1C] dark:text-white truncate">
                {driver.name}
              </span>
              <span className="text-[#767676] font-mono-tabular">{driver.plate}</span>
            </div>
            <button
              type="button"
              onClick={onOpenSafetyHub}
              className="inline-flex items-center gap-1 font-semibold text-[#05A357] dark:text-[#5EDE8B] shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety Hub</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onFastForwardComplete}
            className="w-full h-11 rounded bg-[#EEEEEE] hover:bg-[#E2E2E2] dark:bg-[#222222] dark:hover:bg-[#2E2E2E] text-black dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Complete trip now</span>
          </button>
        </div>
      </div>
    );
  }

  // stage === 'completed'
  const distanceCharge = Math.max(0, fare.subtotal - tier.baseFare);

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto kinetic-scroll pr-0.5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#05A357] dark:text-[#5EDE8B]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Arrived at {destination.name}</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#1B1C1C] dark:text-white mt-1">
              Trip complete
            </h2>
          </div>
          <div className="font-mono-tabular text-2xl font-bold text-[#1B1C1C] dark:text-white">
            ₹{fare.total}
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="p-3.5 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] space-y-2 text-xs">
          <div className="flex justify-between text-[#4C4546] dark:text-[#A1A1AA]">
            <span>{tier.name} base fare</span>
            <span className="font-mono-tabular">₹{tier.baseFare}</span>
          </div>
          <div className="flex justify-between text-[#4C4546] dark:text-[#A1A1AA]">
            <span>Distance ({route.distanceKm.toFixed(1)} km)</span>
            <span className="font-mono-tabular">₹{distanceCharge}</span>
          </div>
          {fare.discount > 0 && activePromo && (
            <div className="flex justify-between text-[#05A357] dark:text-[#5EDE8B] font-semibold">
              <span>Promo ({activePromo.code})</span>
              <span className="font-mono-tabular">-₹{fare.discount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#E2E2E2] dark:border-[#2C2C2C] flex justify-between font-semibold text-sm text-[#1B1C1C] dark:text-white">
            <span>Paid via {paymentMethod.label}</span>
            <span className="font-mono-tabular">₹{fare.total}</span>
          </div>
        </div>

        {/* Driver Rating */}
        <div className="space-y-2.5 pt-1">
          <div className="text-xs font-semibold text-[#1B1C1C] dark:text-white">
            Rate your ride with {driver.name}
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} stars`}
                className="p-1.5 rounded hover:bg-[#F3F3F3] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? 'fill-black text-black dark:fill-white dark:text-white'
                      : 'text-[#CFC4C5] dark:text-[#3F3F46]'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMPLIMENT_TAGS.map((tag) => {
              const active = selectedCompliments.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleCompliment(tag)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-[#F3F3F3] text-[#4C4546] hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:text-[#A1A1AA]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onResetBooking}
        className="w-full h-[52px] rounded bg-black hover:bg-[#262626] dark:bg-white dark:hover:bg-[#E4E4E7] text-white dark:text-black font-display text-[15px] font-semibold transition-colors"
      >
        Book another ride
      </button>
    </div>
  );
};
