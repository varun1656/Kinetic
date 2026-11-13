import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Crosshair, MapPin, Plus, Search, X } from 'lucide-react';
import { GURUGRAM_LANDMARKS, landmarkToSelection } from '../data/gurugramGraph';
import { LocationSelection, MapPinMode } from '../types/ride';

interface LocationComposerProps {
  pickup: LocationSelection | null;
  stops: LocationSelection[];
  destination: LocationSelection | null;
  pinMode: MapPinMode;
  onSetPickup: (loc: LocationSelection | null) => void;
  onSetStops: (stops: LocationSelection[]) => void;
  onSetDestination: (loc: LocationSelection | null) => void;
  onSwapLocations: () => void;
  onTogglePinMode: (mode: MapPinMode) => void;
}

type ActiveField = null | 'pickup' | 'destination' | { stopIndex: number };

export const LocationComposer: React.FC<LocationComposerProps> = ({
  pickup,
  stops,
  destination,
  pinMode,
  onSetPickup,
  onSetStops,
  onSetDestination,
  onSwapLocations,
  onTogglePinMode,
}) => {
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [pickupQuery, setPickupQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [stopQueries, setStopQueries] = useState<Record<number, string>>({});
  const [showStopSlot, setShowStopSlot] = useState(false);

  const activeQuery = useMemo(() => {
    if (activeField === 'pickup') return pickupQuery;
    if (activeField === 'destination') return destQuery;
    if (activeField && typeof activeField === 'object') {
      return stopQueries[activeField.stopIndex] ?? '';
    }
    return '';
  }, [activeField, destQuery, pickupQuery, stopQueries]);

  const filteredLandmarks = useMemo(() => {
    const q = activeQuery.trim().toLowerCase();
    if (!q) return GURUGRAM_LANDMARKS.slice(0, 7);
    return GURUGRAM_LANDMARKS.filter(
      (lm) =>
        lm.name.toLowerCase().includes(q) ||
        lm.area.toLowerCase().includes(q) ||
        lm.category.toLowerCase().includes(q)
    );
  }, [activeQuery]);

  const popularDestinations = useMemo(
    () =>
      GURUGRAM_LANDMARKS.filter(
        (lm) => lm.popular && lm.id !== pickup?.id && lm.id !== destination?.id
      ).slice(0, 5),
    [destination?.id, pickup?.id]
  );

  const handleSelectLandmark = (lmId: string) => {
    const lm = GURUGRAM_LANDMARKS.find((item) => item.id === lmId);
    if (!lm) return;
    const sel = landmarkToSelection(lm);

    if (activeField === 'pickup') {
      onSetPickup(sel);
      setPickupQuery('');
      setActiveField(destination ? null : 'destination');
    } else if (activeField === 'destination') {
      onSetDestination(sel);
      setDestQuery('');
      setActiveField(null);
    } else if (activeField && typeof activeField === 'object') {
      const nextStops = [...stops];
      nextStops[activeField.stopIndex] = sel;
      onSetStops(nextStops);
      setStopQueries((prev) => ({ ...prev, [activeField.stopIndex]: '' }));
      setShowStopSlot(false);
      setActiveField(null);
    } else {
      // Quick-pick from popular list when no input is focused
      if (!pickup) onSetPickup(sel);
      else onSetDestination(sel);
    }
  };

  const handleAddStopSlot = () => {
    if (stops.length >= 2) return;
    setShowStopSlot(true);
    setActiveField({ stopIndex: stops.length });
  };

  const handleRemoveStop = (index: number) => {
    const next = stops.filter((_, i) => i !== index);
    onSetStops(next);
    setShowStopSlot(false);
    setActiveField(null);
  };

  const totalStopRows = stops.length + (showStopSlot && stops.length < 2 ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Stacked Vertical Trip Container */}
      <div className="relative flex gap-3">
        {/* Visual Trip Line Thread (6px black square -> dashed thread -> 6px black dot) */}
        <div className="flex flex-col items-center pt-[18px] pb-[18px] w-3 shrink-0" aria-hidden="true">
          <span className="w-2 h-2 bg-black dark:bg-white shrink-0" />
          <span className="w-[1.5px] flex-1 border-l border-dashed border-[#767676] my-1" />
          {Array.from({ length: totalStopRows }).map((_, idx) => (
            <React.Fragment key={`thread-stop-${idx}`}>
              <span className="w-2 h-2 rotate-45 border-[1.5px] border-black dark:border-white bg-white dark:bg-[#121212] shrink-0" />
              <span className="w-[1.5px] flex-1 border-l border-dashed border-[#767676] my-1" />
            </React.Fragment>
          ))}
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0" />
        </div>

        {/* Inputs Stack */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Pickup Input */}
          <div
            className={`relative flex items-center h-11 px-3 rounded transition-colors ${
              activeField === 'pickup'
                ? 'bg-[#F6F6F6] dark:bg-[#1A1A1A] ring-1 ring-black dark:ring-white'
                : 'bg-[#F6F6F6] dark:bg-[#1A1A1A]'
            }`}
          >
            <input
              type="text"
              value={activeField === 'pickup' ? pickupQuery : pickup?.name ?? ''}
              placeholder="Enter pickup in Gurugram"
              onFocus={() => {
                setActiveField('pickup');
                setPickupQuery('');
              }}
              onChange={(e) => {
                setActiveField('pickup');
                setPickupQuery(e.target.value);
              }}
              aria-label="Pickup location"
              className="w-full bg-transparent text-sm font-medium text-[#1B1C1C] dark:text-white placeholder:text-[#767676] focus:outline-none truncate pr-1"
            />
            {pickup && (
              <button
                type="button"
                onClick={() => {
                  onSetPickup(null);
                  setPickupQuery('');
                  setActiveField('pickup');
                }}
                aria-label="Clear pickup"
                className="p-1.5 text-[#767676] hover:text-black dark:hover:text-white transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onTogglePinMode(pinMode === 'pickup' ? null : 'pickup')}
              title="Set pickup on map"
              aria-label="Set pickup on map"
              className={`p-1.5 rounded transition-colors shrink-0 ${
                pinMode === 'pickup'
                  ? 'bg-[#276EF1] text-white'
                  : 'text-[#767676] hover:text-black dark:hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Optional Intermediate Stop Inputs */}
          {Array.from({ length: totalStopRows }).map((_, idx) => {
            const stopLoc = stops[idx];
            const isActive =
              activeField && typeof activeField === 'object' && activeField.stopIndex === idx;
            return (
              <div
                key={`stop-input-${idx}`}
                className={`relative flex items-center h-11 px-3 rounded transition-colors ${
                  isActive
                    ? 'bg-[#F6F6F6] dark:bg-[#1A1A1A] ring-1 ring-black dark:ring-white'
                    : 'bg-[#F6F6F6] dark:bg-[#1A1A1A]'
                }`}
              >
                <input
                  type="text"
                  value={isActive ? stopQueries[idx] ?? '' : stopLoc?.name ?? ''}
                  placeholder={`Add stop ${idx + 1} in Gurugram`}
                  onFocus={() => setActiveField({ stopIndex: idx })}
                  onChange={(e) => {
                    setActiveField({ stopIndex: idx });
                    setStopQueries((prev) => ({ ...prev, [idx]: e.target.value }));
                  }}
                  aria-label={`Stop ${idx + 1}`}
                  className="w-full bg-transparent text-sm font-medium text-[#1B1C1C] dark:text-white placeholder:text-[#767676] focus:outline-none truncate pr-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStop(idx)}
                  aria-label={`Remove stop ${idx + 1}`}
                  className="p-1.5 text-[#767676] hover:text-[#E11900] transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Destination Input */}
          <div
            className={`relative flex items-center h-11 px-3 rounded transition-colors ${
              activeField === 'destination'
                ? 'bg-[#F6F6F6] dark:bg-[#1A1A1A] ring-1 ring-black dark:ring-white'
                : 'bg-[#F6F6F6] dark:bg-[#1A1A1A]'
            }`}
          >
            <input
              type="text"
              value={activeField === 'destination' ? destQuery : destination?.name ?? ''}
              placeholder="Where to?"
              onFocus={() => {
                setActiveField('destination');
                setDestQuery('');
              }}
              onChange={(e) => {
                setActiveField('destination');
                setDestQuery(e.target.value);
              }}
              aria-label="Destination location"
              className="w-full bg-transparent text-sm font-medium text-[#1B1C1C] dark:text-white placeholder:text-[#767676] focus:outline-none truncate pr-1"
            />
            {destination && (
              <button
                type="button"
                onClick={() => {
                  onSetDestination(null);
                  setDestQuery('');
                  setActiveField('destination');
                }}
                aria-label="Clear destination"
                className="p-1.5 text-[#767676] hover:text-black dark:hover:text-white transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onTogglePinMode(pinMode === 'destination' ? null : 'destination')}
              title="Set destination on map"
              aria-label="Set destination on map"
              className={`p-1.5 rounded transition-colors shrink-0 ${
                pinMode === 'destination'
                  ? 'bg-[#276EF1] text-white'
                  : 'text-[#767676] hover:text-black dark:hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Trailing Swap Button */}
        <div className="flex flex-col justify-center shrink-0">
          <button
            type="button"
            onClick={onSwapLocations}
            disabled={!pickup && !destination}
            title="Swap pickup and destination"
            aria-label="Swap pickup and destination"
            className="w-9 h-9 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#E2E2E2] dark:hover:bg-[#2A2A2A] disabled:opacity-40 flex items-center justify-center text-[#1B1C1C] dark:text-white transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Strip: Add Stop + Drop Pin helper */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {stops.length < 2 && !showStopSlot ? (
          <button
            type="button"
            onClick={handleAddStopSlot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F3F3] dark:bg-[#1A1A1A] hover:bg-[#E2E2E2] dark:hover:bg-[#262626] text-xs font-semibold text-black dark:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add stop</span>
          </button>
        ) : (
          <span className="text-xs text-[#767676]">
            {stops.length > 0 ? `${stops.length} stop${stops.length > 1 ? 's' : ''} added` : 'Select stop from list'}
          </span>
        )}

        <button
          type="button"
          onClick={() => onTogglePinMode(pinMode ? null : destination ? 'pickup' : 'destination')}
          className={`text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            pinMode !== null
              ? 'text-[#276EF1] font-semibold'
              : 'text-[#767676] hover:text-black dark:hover:text-white'
          }`}
        >
          {pinMode !== null ? 'Cancel pin mode' : 'Drop pin on map'}
        </button>
      </div>

      {/* Autocomplete Suggestions Dropdown when an input is focused */}
      {activeField !== null && (
        <div className="border-t border-[#E2E2E2] dark:border-[#262626] pt-2 max-h-60 overflow-y-auto kinetic-scroll space-y-0.5">
          {filteredLandmarks.length === 0 ? (
            <div className="py-5 text-center text-xs text-[#767676]">
              No matching Gurugram locations. Try CyberHub, MG Road, Galleria, or drop a map pin.
            </div>
          ) : (
            filteredLandmarks.map((lm) => (
              <button
                key={lm.id}
                type="button"
                onClick={() => handleSelectLandmark(lm.id)}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] text-left transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-[#EEEEEE] dark:bg-[#242424] flex items-center justify-center shrink-0 text-[#1B1C1C] dark:text-white">
                  {lm.category === 'metro' ? (
                    <span className="text-[11px] font-bold text-[#276EF1]">M</span>
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#1B1C1C] dark:text-white truncate">
                    {lm.name}
                  </div>
                  <div className="text-xs text-[#767676] truncate">{lm.area}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Quick Destinations when in planning mode & no input focused */}
      {activeField === null && (!pickup || !destination) && (
        <div className="border-t border-[#E2E2E2] dark:border-[#262626] pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#767676]">
            <span className="font-medium flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Popular in Gurugram
            </span>
          </div>
          <div className="divide-y divide-[#EFEFEF] dark:divide-[#222222]">
            {popularDestinations.map((lm) => (
              <button
                key={lm.id}
                type="button"
                onClick={() => handleSelectLandmark(lm.id)}
                className="w-full flex items-center justify-between gap-3 py-2.5 px-1 hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] text-left transition-colors rounded"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-[#F3F3F3] dark:bg-[#222222] flex items-center justify-center shrink-0 text-[#1B1C1C] dark:text-white">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#1B1C1C] dark:text-white truncate">
                      {lm.name}
                    </div>
                    <div className="text-xs text-[#767676] truncate">{lm.area}</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#767676] shrink-0">Select</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
