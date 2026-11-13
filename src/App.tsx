import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  LocateFixed,
  Minus,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { ActiveTripPanel } from './components/ActiveTripPanel';
import { GurugramVectorMap } from './components/GurugramVectorMap';
import { LocationComposer } from './components/LocationComposer';
import {
  CancelRideModal,
  DriverMessageModal,
  SafetyModal,
  ScheduleModal,
} from './components/Modals';
import { RideTierSelector } from './components/RideTierSelector';
import {
  GURUGRAM_LANDMARKS,
  computeMultiStopRoute,
  getNeighbors,
  getNodeById,
  interpolateAlongPolyline,
  landmarkToSelection,
  pickDriverDispatchOrigin,
} from './data/gurugramGraph';
import {
  DRIVER_ROSTER,
  PAYMENT_METHODS,
  RIDE_TIERS,
  calculateTierFare,
} from './data/rideTiers';
import {
  AmbientVehicle,
  BookingStage,
  LocationSelection,
  MapPinMode,
  PaymentMethod,
  PromoCode,
  RideTierId,
} from './types/ride';

type SheetSnap = 'peek' | 'mid' | 'full';

function createInitialAmbientVehicles(): AmbientVehicle[] {
  const seeds = [
    { id: 'amb-1', node: 'iffco_chowk' },
    { id: 'amb-2', node: 'cyberhub' },
    { id: 'amb-3', node: 'mg_metro' },
    { id: 'amb-4', node: 'galleria' },
    { id: 'amb-5', node: 'millennium_cc' },
    { id: 'amb-6', node: 'one_horizon' },
    { id: 'amb-7', node: 'sec_44' },
    { id: 'amb-8', node: 'signature_tower' },
  ];

  return seeds.map((s, idx) => {
    const origin = getNodeById(s.node) ?? { id: 'iffco_chowk', x: 455, y: 355 };
    const neighbors = getNeighbors(origin.id);
    const next = neighbors[idx % Math.max(1, neighbors.length)]?.node ?? origin;
    const angle = (Math.atan2(next.y - origin.y, next.x - origin.x) * 180) / Math.PI;
    return {
      id: s.id,
      x: origin.x,
      y: origin.y,
      headingDeg: angle,
      fromNodeId: origin.id,
      toNodeId: next.id,
      t: (idx * 0.17) % 1,
      speed: 0.14 + (idx % 3) * 0.03,
    };
  });
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  // Sync Tailwind v4 `.dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Default pickup at DLF CyberHub for immediate spatial context in Gurugram
  const defaultPickup = useMemo(() => landmarkToSelection(GURUGRAM_LANDMARKS[0]), []);

  const [pickup, setPickup] = useState<LocationSelection | null>(defaultPickup);
  const [stops, setStops] = useState<LocationSelection[]>([]);
  const [destination, setDestination] = useState<LocationSelection | null>(null);
  const [pinMode, setPinMode] = useState<MapPinMode>(null);

  const [stage, setStage] = useState<BookingStage>('planning');
  const [selectedTierId, setSelectedTierId] = useState<RideTierId>('go');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  // Live trip telemetry
  const [boardingPin, setBoardingPin] = useState('4829');
  const [driverOriginNodeId, setDriverOriginNodeId] = useState<string>('iffco_chowk');
  const [driverProgress, setDriverProgress] = useState(0);
  const [tripProgress, setTripProgress] = useState(0);
  const [ambientVehicles, setAmbientVehicles] = useState<AmbientVehicle[]>(createInitialAmbientVehicles);

  // Map camera triggers
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [zoomDeltaSignal, setZoomDeltaSignal] = useState({ seq: 0, delta: 0 });

  // Mobile sheet snap state
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('mid');

  // Modals
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Compute planned multi-stop route across Gurugram road graph
  const computedRoute = useMemo(() => {
    if (!pickup || !destination) return null;
    const waypoints = [pickup, ...stops, destination];
    return computeMultiStopRoute(waypoints);
  }, [destination, pickup, stops]);

  // Sync planning <-> selecting stage automatically when both pickup and destination are ready
  useEffect(() => {
    if (stage === 'planning' && pickup && destination) {
      setStage('selecting');
      setSheetSnap('mid');
    } else if (stage === 'selecting' && (!pickup || !destination)) {
      setStage('planning');
    }
  }, [destination, pickup, stage]);

  // Compute driver approach route (driverOrigin -> pickup)
  const driverApproachRoute = useMemo(() => {
    if (!pickup) return [];
    const originNode = getNodeById(driverOriginNodeId);
    if (!originNode) return [];
    const route = computeMultiStopRoute([
      {
        id: 'drv-origin',
        name: originNode.label ?? 'Driver',
        area: 'Gurugram',
        graphNodeId: originNode.id,
        x: originNode.x,
        y: originNode.y,
      },
      pickup,
    ]);
    return route?.polyline ?? [];
  }, [driverOriginNodeId, pickup]);

  const selectedTier = useMemo(
    () => RIDE_TIERS.find((t) => t.id === selectedTierId) ?? RIDE_TIERS[0],
    [selectedTierId]
  );

  const activeDriver = DRIVER_ROSTER[selectedTierId] ?? DRIVER_ROSTER.go;

  const activeFare = useMemo(() => {
    const dist = computedRoute?.distanceKm ?? 5;
    return calculateTierFare(selectedTier, dist, activePromo);
  }, [activePromo, computedRoute?.distanceKm, selectedTier]);

  // Continuous ambient vehicle movement + live driver / trip progress animation
  const lastFrameRef = useRef<number>(performance.now());

  useEffect(() => {
    let rafId = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.08, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      setAmbientVehicles((prev) =>
        prev.map((cab) => {
          let nextT = cab.t + dt * cab.speed;
          let fromId = cab.fromNodeId;
          let toId = cab.toNodeId;

          if (nextT >= 1) {
            nextT = 0;
            const neighbors = getNeighbors(toId).filter((n) => n.node.id !== fromId);
            const pool = neighbors.length > 0 ? neighbors : getNeighbors(toId);
            const chosen = pool[Math.floor(Math.random() * pool.length)];
            fromId = toId;
            if (chosen) toId = chosen.node.id;
          }

          const a = getNodeById(fromId);
          const b = getNodeById(toId);
          if (!a || !b) return cab;
          const x = a.x + (b.x - a.x) * nextT;
          const y = a.y + (b.y - a.y) * nextT;
          const headingDeg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
          return { ...cab, fromNodeId: fromId, toNodeId: toId, t: nextT, x, y, headingDeg };
        })
      );

      if (stage === 'arriving') {
        setDriverProgress((p) => (p < 1 ? Math.min(1, p + dt * 0.085) : 1));
      } else if (stage === 'in_progress') {
        setTripProgress((p) => {
          const next = p + dt * 0.06;
          if (next >= 1) {
            setStage('completed');
            return 1;
          }
          return next;
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [stage]);

  // Matching timeout -> Driver Assigned
  useEffect(() => {
    if (stage !== 'matching' || !pickup) return;
    const timer = setTimeout(() => {
      const originId = pickDriverDispatchOrigin(pickup.graphNodeId);
      setDriverOriginNodeId(originId);
      setDriverProgress(0);
      setTripProgress(0);
      setBoardingPin(String(Math.floor(1000 + Math.random() * 9000)));
      setStage('arriving');
      setRecenterSignal((s) => s + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [pickup, stage]);

  // Active driver position along approach or trip polyline
  const driverMapPosition = useMemo(() => {
    if (stage === 'arriving' && driverApproachRoute.length > 0) {
      const res = interpolateAlongPolyline(driverApproachRoute, driverProgress);
      return { point: res.point, headingDeg: res.headingDeg };
    }
    if (stage === 'in_progress' && computedRoute && computedRoute.polyline.length > 0) {
      const res = interpolateAlongPolyline(computedRoute.polyline, tripProgress);
      return { point: res.point, headingDeg: res.headingDeg };
    }
    return null;
  }, [computedRoute, driverApproachRoute, driverProgress, stage, tripProgress]);

  const handleSelectMapPoint = useCallback(
    (sel: LocationSelection) => {
      if (pinMode === 'pickup') {
        setPickup(sel);
      } else if (pinMode === 'destination') {
        setDestination(sel);
      } else if (pinMode && typeof pinMode === 'object') {
        setStops((prev) => {
          const next = [...prev];
          next[pinMode.stopIndex] = sel;
          return next;
        });
      }
      setPinMode(null);
      setRecenterSignal((s) => s + 1);
    },
    [pinMode]
  );

  const handleSelectLandmarkOnMap = useCallback(
    (landmarkId: string) => {
      const lm = GURUGRAM_LANDMARKS.find((item) => item.id === landmarkId);
      if (!lm) return;
      const sel = landmarkToSelection(lm);

      if (pinMode === 'pickup') {
        setPickup(sel);
        setPinMode(null);
        return;
      }
      if (pinMode === 'destination') {
        setDestination(sel);
        setPinMode(null);
        return;
      }
      if (pinMode && typeof pinMode === 'object') {
        setStops((prev) => {
          const next = [...prev];
          next[pinMode.stopIndex] = sel;
          return next;
        });
        setPinMode(null);
        return;
      }

      if (stage === 'planning' || stage === 'selecting') {
        if (!pickup) setPickup(sel);
        else setDestination(sel);
      }
    },
    [pickup, pinMode, stage]
  );

  const handleSwapLocations = () => {
    const prevPickup = pickup;
    const prevDest = destination;
    setPickup(prevDest);
    setDestination(prevPickup);
    if (stops.length > 1) {
      setStops([...stops].reverse());
    }
  };

  const handleResetBooking = () => {
    setDestination(null);
    setStops([]);
    setActivePromo(null);
    setScheduledTime(null);
    setDriverProgress(0);
    setTripProgress(0);
    setStage('planning');
    setSheetSnap('mid');
    setRecenterSignal((s) => s + 1);
  };

  const cycleMobileSnap = () => {
    setSheetSnap((prev) => (prev === 'peek' ? 'mid' : prev === 'mid' ? 'full' : 'mid'));
  };

  const mobileSheetHeightClass =
    sheetSnap === 'peek'
      ? 'h-[168px]'
      : sheetSnap === 'mid'
      ? 'h-[56vh]'
      : 'h-[86vh]';

  const stageHeading =
    stage === 'planning'
      ? 'Where to?'
      : stage === 'selecting'
      ? 'Choose a ride'
      : stage === 'matching'
      ? 'Finding your ride'
      : stage === 'arriving'
      ? 'Driver assigned'
      : stage === 'in_progress'
      ? 'On your way'
      : 'Ride summary';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FBF9F9] dark:bg-black text-[#1B1C1C] dark:text-white">
      {/* Full-Bleed Interactive Gurugram Vector Map Canvas */}
      <GurugramVectorMap
        pickup={pickup}
        stops={stops}
        destination={destination}
        plannedRoute={computedRoute?.polyline ?? []}
        driverRoute={driverApproachRoute}
        driverPosition={driverMapPosition}
        ambientVehicles={ambientVehicles}
        stage={stage}
        pinMode={pinMode}
        onSelectMapPoint={handleSelectMapPoint}
        onSelectLandmark={handleSelectLandmarkOnMap}
        recenterSignal={recenterSignal}
        zoomDeltaSignal={zoomDeltaSignal}
        isDark={isDark}
      />

      {/* Mobile Top Brand & Utility Bar */}
      <div className="lg:hidden fixed top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto h-11 px-4 rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center gap-2">
          <span className="font-display text-base font-extrabold tracking-tight text-black dark:text-white">
            Kinetic
          </span>
          <span className="text-xs text-[#767676]">Gurugram</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-11 h-11 rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-black dark:text-white"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowSafetyModal(true)}
            aria-label="Open Safety Hub"
            className="w-11 h-11 rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#05A357]"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRecenterSignal((s) => s + 1)}
            aria-label="Recenter map"
            className="w-11 h-11 rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex items-center justify-center text-black dark:text-white"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Top-Right Floating Map Utility Cluster */}
      <div className="hidden lg:flex fixed top-8 right-8 z-20 flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSafetyModal(true)}
            className="h-11 px-4 rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] flex items-center gap-2 text-xs font-semibold text-[#1B1C1C] dark:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-[#05A357]" />
            <span>Safety Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="w-11 h-11 rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] flex items-center justify-center text-[#1B1C1C] dark:text-white transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Map Zoom & Recenter Controls */}
        <div className="flex flex-col rounded-full bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden">
          <button
            type="button"
            onClick={() => setZoomDeltaSignal((s) => ({ seq: s.seq + 1, delta: 0.22 }))}
            aria-label="Zoom in"
            className="w-11 h-11 flex items-center justify-center hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] text-[#1B1C1C] dark:text-white transition-colors border-b border-[#E2E2E2] dark:border-[#262626]"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomDeltaSignal((s) => ({ seq: s.seq + 1, delta: -0.22 }))}
            aria-label="Zoom out"
            className="w-11 h-11 flex items-center justify-center hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] text-[#1B1C1C] dark:text-white transition-colors border-b border-[#E2E2E2] dark:border-[#262626]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setRecenterSignal((s) => s + 1)}
            aria-label="Recenter map"
            title="Recenter route"
            className="w-11 h-11 flex items-center justify-center hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] text-[#276EF1] transition-colors"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Booking Container: Desktop Left Floating Rail (420px) / Mobile Bottom Sheet */}
      <aside
        aria-label="Ride booking panel"
        className={`fixed z-30 bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] flex flex-col transition-all duration-200 ease-out
          lg:top-8 lg:left-8 lg:bottom-auto lg:right-auto lg:w-[420px] lg:max-h-[calc(100vh-4rem)] lg:rounded-lg lg:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
          bottom-0 left-0 right-0 rounded-t-lg shadow-[0_-4px_24px_rgba(0,0,0,0.1)] ${mobileSheetHeightClass} lg:h-auto`}
      >
        {/* Mobile Sheet Grab Handle & Snap Toggle */}
        <button
          type="button"
          onClick={cycleMobileSnap}
          aria-label="Adjust booking sheet height"
          className="lg:hidden w-full pt-2.5 pb-1 flex flex-col items-center justify-center shrink-0"
        >
          <span className="w-10 h-1 rounded-full bg-[#CFC4C5] dark:bg-[#3F3F46]" />
        </button>

        {/* Panel Header */}
        <div className="px-5 pt-3 lg:pt-5 pb-3 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-[#767676] mb-1">
              <span className="font-display font-bold text-black dark:text-white">Kinetic</span>
              <span aria-hidden="true">·</span>
              <span>Gurugram</span>
            </div>
            <h1 className="font-display text-2xl lg:text-[28px] font-bold tracking-tight leading-tight text-[#1B1C1C] dark:text-white truncate">
              {stageHeading}
            </h1>
          </div>

          <button
            type="button"
            onClick={cycleMobileSnap}
            aria-label={sheetSnap === 'full' ? 'Collapse sheet' : 'Expand sheet'}
            className="lg:hidden w-9 h-9 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-[#1B1C1C] dark:text-white shrink-0"
          >
            {sheetSnap === 'full' ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Panel Body */}
        <div className="px-5 pb-5 flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
          {/* Show LocationComposer during planning & selecting stages */}
          {(stage === 'planning' || stage === 'selecting') && (
            <LocationComposer
              pickup={pickup}
              stops={stops}
              destination={destination}
              pinMode={pinMode}
              onSetPickup={setPickup}
              onSetStops={setStops}
              onSetDestination={setDestination}
              onSwapLocations={handleSwapLocations}
              onTogglePinMode={setPinMode}
            />
          )}

          {/* Stage: Selecting Vehicle Tier */}
          {stage === 'selecting' && computedRoute && (
            <RideTierSelector
              route={computedRoute}
              selectedTierId={selectedTierId}
              onSelectTier={setSelectedTierId}
              selectedPayment={selectedPayment}
              onSelectPayment={setSelectedPayment}
              activePromo={activePromo}
              onSelectPromo={setActivePromo}
              scheduledTime={scheduledTime}
              onOpenSchedule={() => setShowScheduleModal(true)}
              onClearSchedule={() => setScheduledTime(null)}
              onConfirmBooking={() => {
                setPinMode(null);
                setStage('matching');
              }}
            />
          )}

          {/* Stages: Matching -> Arriving -> In Progress -> Completed Receipt */}
          {(stage === 'matching' ||
            stage === 'arriving' ||
            stage === 'in_progress' ||
            stage === 'completed') &&
            pickup &&
            destination &&
            computedRoute && (
              <ActiveTripPanel
                stage={stage}
                tier={selectedTier}
                driver={activeDriver}
                pickup={pickup}
                stops={stops}
                destination={destination}
                route={computedRoute}
                fare={activeFare}
                paymentMethod={selectedPayment}
                activePromo={activePromo}
                boardingPin={boardingPin}
                driverProgress={driverProgress}
                tripProgress={tripProgress}
                driverEtaMin={selectedTier.etaOffsetMin}
                scheduledTime={scheduledTime}
                onCancelRequest={() => setShowCancelModal(true)}
                onBoardAndStartTrip={() => {
                  setTripProgress(0);
                  setStage('in_progress');
                  setRecenterSignal((s) => s + 1);
                }}
                onFastForwardComplete={() => {
                  setTripProgress(1);
                  setStage('completed');
                }}
                onOpenMessageDrawer={() => setShowMessageModal(true)}
                onOpenSafetyHub={() => setShowSafetyModal(true)}
                onResetBooking={handleResetBooking}
              />
            )}
        </div>
      </aside>

      {/* Modals & Drawers */}
      <SafetyModal
        open={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        driver={stage === 'arriving' || stage === 'in_progress' ? activeDriver : null}
        pickup={pickup}
        destination={destination}
      />

      <ScheduleModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirmSchedule={(slot) => setScheduledTime(slot)}
      />

      <DriverMessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        driver={activeDriver}
      />

      <CancelRideModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={() => {
          setDriverProgress(0);
          setTripProgress(0);
          setStage('selecting');
          setRecenterSignal((s) => s + 1);
        }}
      />
    </div>
  );
}
