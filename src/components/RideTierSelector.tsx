import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Tag,
  Users,
  Check,
  X,
} from 'lucide-react';
import {
  PAYMENT_METHODS,
  PROMO_CODES,
  RIDE_TIERS,
  calculateTierFare,
} from '../data/rideTiers';
import {
  ComputedRoute,
  PaymentMethod,
  PromoCode,
  RideTierId,
} from '../types/ride';
import { VehicleSilhouette } from './VehicleIcons';

interface RideTierSelectorProps {
  route: ComputedRoute;
  selectedTierId: RideTierId;
  onSelectTier: (tierId: RideTierId) => void;
  selectedPayment: PaymentMethod;
  onSelectPayment: (pm: PaymentMethod) => void;
  activePromo: PromoCode | null;
  onSelectPromo: (promo: PromoCode | null) => void;
  scheduledTime: string | null;
  onOpenSchedule: () => void;
  onClearSchedule: () => void;
  onConfirmBooking: () => void;
}

export const RideTierSelector: React.FC<RideTierSelectorProps> = ({
  route,
  selectedTierId,
  onSelectTier,
  selectedPayment,
  onSelectPayment,
  activePromo,
  onSelectPromo,
  scheduledTime,
  onOpenSchedule,
  onClearSchedule,
  onConfirmBooking,
}) => {
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [showPromoDrawer, setShowPromoDrawer] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const selectedTier = RIDE_TIERS.find((t) => t.id === selectedTierId) ?? RIDE_TIERS[0];
  const selectedPricing = calculateTierFare(selectedTier, route.distanceKm, activePromo);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customCodeInput.trim().toUpperCase();
    const match = PROMO_CODES.find((p) => p.code === cleaned);
    if (match) {
      onSelectPromo(match);
      setCustomCodeInput('');
      setPromoError('');
      setShowPromoDrawer(false);
    } else {
      setPromoError('Try GURGAON20, CYBER50, or EVGREEN');
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Route Telemetry Summary Strip */}
      <div className="flex items-center justify-between gap-2 py-2.5 border-y border-[#E2E2E2] dark:border-[#262626] text-xs">
        <div className="flex items-center gap-2 text-[#4C4546] dark:text-[#A1A1AA] min-w-0">
          <span className="font-mono-tabular font-semibold text-[#1B1C1C] dark:text-white shrink-0">
            {route.distanceKm.toFixed(1)} km
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular shrink-0">{route.durationMin} min</span>
          {route.primaryCorridors.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">via {route.primaryCorridors[0]}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={scheduledTime ? onClearSchedule : onOpenSchedule}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F3F3] dark:bg-[#1A1A1A] hover:bg-[#E2E2E2] dark:hover:bg-[#262626] text-xs font-semibold text-black dark:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Clock className="w-3 h-3" />
          <span>{scheduledTime ? scheduledTime : 'Now'}</span>
          {scheduledTime ? (
            <X className="w-3 h-3 ml-0.5 text-[#767676]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#767676]" />
          )}
        </button>
      </div>

      {/* Scrollable Ride Selection Cards */}
      <div className="flex-1 overflow-y-auto kinetic-scroll py-2 -mx-1 px-1 space-y-1">
        {RIDE_TIERS.map((tier) => {
          const isSelected = tier.id === selectedTierId;
          const fare = calculateTierFare(tier, route.distanceKm, activePromo);
          const tripMins = Math.max(4, Math.round((route.distanceKm / tier.speedKmh) * 60));

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className={`w-full flex items-center gap-3 p-3 rounded text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-white dark:bg-[#1A1A1A] ring-2 ring-black dark:ring-white'
                  : 'bg-white dark:bg-[#121212] hover:bg-[#F9F9F9] dark:hover:bg-[#181818] border-b border-[#EFEFEF] dark:border-[#202020]'
              }`}
            >
              {/* Vehicle Silhouette */}
              <div className="w-14 shrink-0 flex items-center justify-center text-black dark:text-white">
                <VehicleSilhouette tierId={tier.id} className="w-14 h-9" />
              </div>

              {/* Tier Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-[15px] font-semibold text-[#1B1C1C] dark:text-white">
                    {tier.name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-[#767676] font-medium tabular-nums">
                    <Users className="w-3 h-3" />
                    {tier.capacity}
                  </span>
                  {tier.badge && (
                    <span
                      className={`inline-flex items-center px-1.5 h-5 rounded text-[11px] font-semibold whitespace-nowrap ${
                        tier.id === 'green'
                          ? 'bg-[#E6F4EA] text-[#05A357] dark:bg-[#05A357]/15 dark:text-[#5EDE8B]'
                          : 'bg-[#F3F3F3] text-black dark:bg-[#262626] dark:text-white'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#767676] mt-0.5">
                  <span className="font-mono-tabular font-medium text-[#1B1C1C] dark:text-[#D4D4D8]">
                    {tier.etaOffsetMin} min away
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{tripMins} min ride</span>
                </div>

                <div className="text-xs text-[#767676] truncate mt-0.5">
                  {tier.ecoNote ? (
                    <span className="text-[#05A357] dark:text-[#5EDE8B] font-medium">
                      {tier.ecoNote}
                    </span>
                  ) : (
                    tier.tagline
                  )}
                </div>
              </div>

              {/* Dynamic INR Fare */}
              <div className="text-right shrink-0">
                <div className="font-mono-tabular text-base font-bold text-[#1B1C1C] dark:text-white">
                  ₹{fare.total}
                </div>
                {fare.discount > 0 && (
                  <div className="font-mono-tabular text-xs text-[#767676] line-through">
                    ₹{fare.subtotal}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment & Promo Strip + Primary Booking CTA */}
      <div className="border-t border-[#E2E2E2] dark:border-[#262626] pt-3 space-y-2.5 bg-white dark:bg-[#121212]">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setShowPaymentDrawer((v) => !v);
              setShowPromoDrawer(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] text-left transition-colors min-w-0"
          >
            <CreditCard className="w-4 h-4 text-[#1B1C1C] dark:text-white shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1B1C1C] dark:text-white truncate">
                {selectedPayment.label}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#767676] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPromoDrawer((v) => !v);
              setShowPaymentDrawer(false);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activePromo
                ? 'bg-[#E6F4EA] text-[#05A357] dark:bg-[#05A357]/20 dark:text-[#5EDE8B]'
                : 'bg-[#F3F3F3] text-black hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:text-white dark:hover:bg-[#262626]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{activePromo ? `${activePromo.code} (-₹${selectedPricing.discount})` : 'Apply promo'}</span>
          </button>
        </div>

        {/* Inline Payment Selector Drawer */}
        {showPaymentDrawer && (
          <div className="p-2 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] space-y-1">
            {PAYMENT_METHODS.map((pm) => {
              const active = pm.id === selectedPayment.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => {
                    onSelectPayment(pm);
                    setShowPaymentDrawer(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded hover:bg-white dark:hover:bg-[#242424] text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#1B1C1C] dark:text-white">
                      {pm.label}
                    </div>
                    <div className="text-[11px] text-[#767676]">{pm.sublabel}</div>
                  </div>
                  {active && <Check className="w-4 h-4 text-black dark:text-white" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Inline Promo Code Drawer */}
        {showPromoDrawer && (
          <div className="p-2.5 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] space-y-2">
            <form onSubmit={handleApplyCode} className="flex gap-2">
              <input
                type="text"
                value={customCodeInput}
                onChange={(e) => {
                  setCustomCodeInput(e.target.value);
                  setPromoError('');
                }}
                placeholder="Enter promo code"
                className="flex-1 h-9 px-2.5 rounded bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#333333] text-xs font-semibold uppercase tracking-wider text-[#1B1C1C] dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded bg-black text-white dark:bg-white dark:text-black text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Apply
              </button>
            </form>
            {promoError && <p className="text-[11px] text-[#E11900]">{promoError}</p>}
            <div className="space-y-1">
              {PROMO_CODES.map((p) => {
                const isApplied = activePromo?.code === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => {
                      onSelectPromo(isApplied ? null : p);
                      setShowPromoDrawer(false);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white dark:hover:bg-[#242424] text-left transition-colors"
                  >
                    <div>
                      <span className="font-mono-tabular text-xs font-bold text-[#1B1C1C] dark:text-white">
                        {p.code}
                      </span>
                      <span className="text-[11px] text-[#767676] ml-2">{p.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#05A357]">
                      {isApplied ? 'Remove' : 'Use'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Confirm CTA */}
        <button
          type="button"
          onClick={onConfirmBooking}
          className="w-full h-[52px] rounded bg-black hover:bg-[#262626] dark:bg-white dark:hover:bg-[#E4E4E7] text-white dark:text-black font-display text-[15px] font-semibold tracking-tight transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>
            {scheduledTime ? `Schedule ${selectedTier.name}` : `Confirm ${selectedTier.name}`}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">₹{selectedPricing.total}</span>
        </button>
      </div>
    </div>
  );
};
