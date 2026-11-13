import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GOLF_COURSE_METRO_PATH,
  GREEN_ZONES,
  GURUGRAM_EDGES,
  GURUGRAM_LANDMARKS,
  GURUGRAM_NODES,
  RAPID_METRO_PATH,
  URBAN_BLOCKS,
  YELLOW_LINE_METRO_PATH,
  findNearestNode,
  getNodeById,
} from '../data/gurugramGraph';
import {
  AmbientVehicle,
  BookingStage,
  LocationSelection,
  MapPinMode,
  Point,
} from '../types/ride';

interface GurugramVectorMapProps {
  pickup: LocationSelection | null;
  stops: LocationSelection[];
  destination: LocationSelection | null;
  plannedRoute: Point[];
  driverRoute: Point[];
  driverPosition: { point: Point; headingDeg: number } | null;
  ambientVehicles: AmbientVehicle[];
  stage: BookingStage;
  pinMode: MapPinMode;
  onSelectMapPoint: (selection: LocationSelection) => void;
  onSelectLandmark: (landmarkId: string) => void;
  recenterSignal: number;
  zoomDeltaSignal: { seq: number; delta: number };
  isDark: boolean;
}

interface ViewCamera {
  cx: number;
  cy: number;
  zoom: number;
}

const DEFAULT_CAMERA: ViewCamera = { cx: 520, cy: 420, zoom: 1.05 };

export const GurugramVectorMap: React.FC<GurugramVectorMapProps> = ({
  pickup,
  stops,
  destination,
  plannedRoute,
  driverRoute,
  driverPosition,
  ambientVehicles,
  stage,
  pinMode,
  onSelectMapPoint,
  onSelectLandmark,
  recenterSignal,
  zoomDeltaSignal,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [camera, setCamera] = useState<ViewCamera>(DEFAULT_CAMERA);
  const targetCameraRef = useRef<ViewCamera>(DEFAULT_CAMERA);
  const cameraRef = useRef<ViewCamera>(DEFAULT_CAMERA);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean }>({
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
    moved: false,
  });
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  // Measure container size for accurate projection and desktop left-rail offset framing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      setViewport({ width: el.clientWidth || 1280, height: el.clientHeight || 800 });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute target camera to neatly frame active waypoints / route
  const computeAutoCamera = useCallback((): ViewCamera => {
    const points: Point[] = [];
    if (plannedRoute.length > 0) points.push(...plannedRoute);
    if (driverRoute.length > 0 && (stage === 'arriving' || stage === 'matching')) {
      points.push(...driverRoute);
    }
    if (driverPosition && (stage === 'arriving' || stage === 'in_progress')) {
      points.push(driverPosition.point);
    }
    if (pickup) points.push({ x: pickup.x, y: pickup.y });
    stops.forEach((s) => points.push({ x: s.x, y: s.y }));
    if (destination) points.push({ x: destination.x, y: destination.y });

    if (points.length === 0) {
      // Slightly offset center leftwards on desktop so right-hand map stage centers Gurugram Core
      const isDesktop = viewport.width >= 1024;
      return { cx: isDesktop ? 445 : 535, cy: 420, zoom: isDesktop ? 1.08 : 0.92 };
    }

    if (points.length === 1) {
      const p = points[0];
      const isDesktop = viewport.width >= 1024;
      return {
        cx: isDesktop ? p.x - 140 : p.x,
        cy: isDesktop ? p.y : p.y + 70,
        zoom: 1.35,
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    const isDesktop = viewport.width >= 1024;
    const availW = isDesktop ? Math.max(360, viewport.width - 520) : Math.max(260, viewport.width - 48);
    const availH = isDesktop ? Math.max(340, viewport.height - 140) : Math.max(240, viewport.height * 0.48);

    const spanX = Math.max(140, maxX - minX + 120);
    const spanY = Math.max(140, maxY - minY + 120);
    const fitZoom = Math.max(0.68, Math.min(1.85, Math.min(availW / spanX, availH / spanY)));

    // Offset camera center so points sit squarely in the unobstructed area beside the rail/sheet
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const offsetX = isDesktop ? -220 / fitZoom : 0;
    const offsetY = isDesktop ? 0 : 120 / fitZoom;

    return {
      cx: midX + offsetX,
      cy: midY + offsetY,
      zoom: fitZoom,
    };
  }, [destination, driverPosition, driverRoute, pickup, plannedRoute, stage, stops, viewport.height, viewport.width]);

  // Auto-frame when route or recenter triggers
  useEffect(() => {
    targetCameraRef.current = computeAutoCamera();
  }, [computeAutoCamera, recenterSignal]);

  // Apply external +/- zoom controls
  useEffect(() => {
    if (zoomDeltaSignal.seq === 0) return;
    targetCameraRef.current = {
      ...targetCameraRef.current,
      zoom: Math.max(0.62, Math.min(2.4, targetCameraRef.current.zoom + zoomDeltaSignal.delta)),
    };
  }, [zoomDeltaSignal]);

  // Smooth camera lerp loop
  useEffect(() => {
    let rafId = 0;
    const step = () => {
      if (!isDraggingRef.current) {
        const cur = cameraRef.current;
        const tgt = targetCameraRef.current;
        const dx = tgt.cx - cur.cx;
        const dy = tgt.cy - cur.cy;
        const dz = tgt.zoom - cur.zoom;
        if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15 || Math.abs(dz) > 0.001) {
          const next = {
            cx: cur.cx + dx * 0.14,
            cy: cur.cy + dy * 0.14,
            zoom: cur.zoom + dz * 0.14,
          };
          cameraRef.current = next;
          setCamera(next);
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const screenToMap = useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 520, y: 420 };
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const cur = cameraRef.current;
      return {
        x: cur.cx + (sx - rect.width / 2) / cur.zoom,
        y: cur.cy + (sy - rect.height / 2) / cur.zoom,
      };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-map-interactive="true"]')) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cx: cameraRef.current.cx,
      cy: cameraRef.current.cy,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) {
      dragStartRef.current.moved = true;
    }
    const z = cameraRef.current.zoom;
    const next = {
      cx: Math.max(80, Math.min(1080, dragStartRef.current.cx - dx / z)),
      cy: Math.max(50, Math.min(880, dragStartRef.current.cy - dy / z)),
      zoom: z,
    };
    cameraRef.current = next;
    targetCameraRef.current = next;
    setCamera(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    // If user clicked map while in pin-drop mode (without dragging)
    if (!dragStartRef.current.moved && pinMode !== null) {
      const pt = screenToMap(e.clientX, e.clientY);
      const nearest = findNearestNode(pt.x, pt.y);
      onSelectMapPoint({
        id: `pin-${Date.now()}`,
        name: nearest.label ? `Near ${nearest.label}` : 'Pinned Gurugram Street',
        area: 'Dropped map pin · Gurugram',
        graphNodeId: nearest.id,
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        isCustomPin: true,
      });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.12 : -0.12;
    const nextZoom = Math.max(0.62, Math.min(2.4, targetCameraRef.current.zoom + factor));
    targetCameraRef.current = { ...targetCameraRef.current, zoom: nextZoom };
  };

  const toPolylineAttr = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

  // Compute viewBox from camera state
  const viewBox = useMemo(() => {
    const w = viewport.width / camera.zoom;
    const h = viewport.height / camera.zoom;
    const x = camera.cx - w / 2;
    const y = camera.cy - h / 2;
    return `${x} ${y} ${w} ${h}`;
  }, [camera.cx, camera.cy, camera.zoom, viewport.height, viewport.width]);

  // Street label placements along major Gurugram corridors
  const roadLabels = useMemo(
    () => [
      { text: 'NH-48 DELHI–JAIPUR EXPY', x: 315, y: 540, angle: -52 },
      { text: 'MG ROAD', x: 525, y: 332, angle: -15 },
      { text: 'GOLF COURSE ROAD', x: 775, y: 455, angle: 66 },
      { text: 'SOHNA ROAD', x: 438, y: 735, angle: 37 },
      { text: 'GOLF COURSE EXT. RD', x: 615, y: 770, angle: 0 },
      { text: 'CYBER CITY LOOP', x: 445, y: 214, angle: 4 },
    ],
    []
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none touch-none transition-colors duration-200 ${
        isDark ? 'bg-[#0B0B0C]' : 'bg-[#F3F2F0]'
      } ${pinMode !== null ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Pin Placement Banner when active */}
      {pinMode !== null && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-full text-xs font-semibold tracking-tight shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#276EF1]" />
          <span>
            Click anywhere on the Gurugram map to set{' '}
            {pinMode === 'pickup'
              ? 'pickup location'
              : pinMode === 'destination'
              ? 'destination'
              : `stop ${pinMode.stopIndex + 1}`}
          </span>
        </div>
      )}

      <svg
        viewBox={viewBox}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid slice"
        aria-label="Interactive Gurugram city vector map"
      >
        <defs>
          <pattern
            id="grid-sub"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke={isDark ? '#161618' : '#E8E6E3'}
              strokeWidth="0.7"
            />
          </pattern>
        </defs>

        {/* Base architectural grid */}
        <rect x="-600" y="-600" width="2400" height="2200" fill="url(#grid-sub)" />

        {/* Urban Sector / District Blocks */}
        {URBAN_BLOCKS.map((b) => (
          <g key={b.label}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={4}
              fill={isDark ? '#141416' : '#ECEAE6'}
              stroke={isDark ? '#1E1E22' : '#E2DFDA'}
              strokeWidth="1"
            />
            <text
              x={b.x + b.w / 2}
              y={b.y + b.h / 2 + 3}
              textAnchor="middle"
              fill={isDark ? '#3F3F46' : '#A8A49E'}
              fontSize="8.5"
              fontWeight="600"
              letterSpacing="0.14em"
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* Gurugram Greenbelts & Parks */}
        {GREEN_ZONES.map((gz) => (
          <g key={gz.id}>
            <polygon
              points={gz.points}
              fill={isDark ? '#111D15' : '#E1ECE3'}
              stroke={isDark ? '#1C3022' : '#CFE0D2'}
              strokeWidth="1.2"
            />
            <text
              x={gz.labelX}
              y={gz.labelY}
              textAnchor="middle"
              fill={isDark ? '#3F724F' : '#587860'}
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.12em"
            >
              {gz.name}
            </text>
          </g>
        ))}

        {/* Road Network Casing (outer hairline border for crisp architectural roads) */}
        {GURUGRAM_EDGES.map((edge, idx) => {
          const from = getNodeById(edge.from);
          const to = getNodeById(edge.to);
          if (!from || !to) return null;
          const width = edge.roadClass === 'highway' ? 14 : edge.roadClass === 'arterial' ? 9.5 : 6.5;
          return (
            <line
              key={`casing-${idx}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isDark ? '#242428' : '#DCD9D4'}
              strokeWidth={width}
              strokeLinecap="round"
            />
          );
        })}

        {/* Road Network Inner Fill */}
        {GURUGRAM_EDGES.map((edge, idx) => {
          const from = getNodeById(edge.from);
          const to = getNodeById(edge.to);
          if (!from || !to) return null;
          const width = edge.roadClass === 'highway' ? 10.5 : edge.roadClass === 'arterial' ? 6.8 : 4.2;
          return (
            <line
              key={`fill-${idx}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={
                edge.roadClass === 'highway'
                  ? isDark
                    ? '#1C1C20'
                    : '#FFFFFF'
                  : isDark
                  ? '#18181B'
                  : '#FAF9F7'
              }
              strokeWidth={width}
              strokeLinecap="round"
            />
          );
        })}

        {/* NH-48 Highway Median */}
        {GURUGRAM_EDGES.filter((e) => e.roadClass === 'highway').map((edge, idx) => {
          const from = getNodeById(edge.from);
          const to = getNodeById(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`median-${idx}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isDark ? '#2E2E34' : '#E6E4E0'}
              strokeWidth="1"
              strokeDasharray="6 4"
            />
          );
        })}

        {/* Rapid Metro & Yellow Line Subtle Transit Tracks */}
        <polyline
          points={toPolylineAttr(RAPID_METRO_PATH)}
          fill="none"
          stroke={isDark ? '#2E3A4D' : '#CBD5E1'}
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />
        <polyline
          points={toPolylineAttr(GOLF_COURSE_METRO_PATH)}
          fill="none"
          stroke={isDark ? '#2E3A4D' : '#CBD5E1'}
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />
        <polyline
          points={toPolylineAttr(YELLOW_LINE_METRO_PATH)}
          fill="none"
          stroke={isDark ? '#3F3520' : '#E2D4A6'}
          strokeWidth="1.8"
          strokeDasharray="5 4"
        />

        {/* Road Corridor Labels */}
        {roadLabels.map((lbl) => (
          <text
            key={lbl.text}
            x={lbl.x}
            y={lbl.y}
            transform={`rotate(${lbl.angle} ${lbl.x} ${lbl.y})`}
            textAnchor="middle"
            fill={isDark ? '#71717A' : '#555555'}
            fontSize="8.2"
            fontWeight="700"
            letterSpacing="0.09em"
            style={{ pointerEvents: 'none' }}
          >
            {lbl.text}
          </text>
        ))}

        {/* Junction Micro-nodes */}
        {GURUGRAM_NODES.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="2.2"
            fill={isDark ? '#2C2C32' : '#D2CFC9'}
          />
        ))}

        {/* Planned Route Polyline (Primary Jet Black in Light / Crisp White in Dark) */}
        {plannedRoute.length > 1 && (
          <g>
            <polyline
              points={toPolylineAttr(plannedRoute)}
              fill="none"
              stroke={isDark ? '#000000' : '#FFFFFF'}
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
            <polyline
              points={toPolylineAttr(plannedRoute)}
              fill="none"
              stroke={isDark ? '#FFFFFF' : '#000000'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Active Driver Approach Segment (#276EF1 Secondary Accent) */}
        {driverRoute.length > 1 && (stage === 'arriving' || stage === 'matching') && (
          <g>
            <polyline
              points={toPolylineAttr(driverRoute)}
              fill="none"
              stroke="#276EF1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={stage === 'matching' ? '6 6' : undefined}
            />
          </g>
        )}

        {/* Interactive Gurugram Landmarks */}
        {GURUGRAM_LANDMARKS.map((lm) => {
          const isSelectedPickup = pickup?.id === lm.id;
          const isSelectedDest = destination?.id === lm.id;
          const isStop = stops.some((s) => s.id === lm.id);
          if (isSelectedPickup || isSelectedDest || isStop) return null;

          const isHovered = hoveredLandmarkId === lm.id;
          return (
            <g
              key={lm.id}
              data-map-interactive="true"
              onMouseEnter={() => setHoveredLandmarkId(lm.id)}
              onMouseLeave={() => setHoveredLandmarkId(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLandmark(lm.id);
              }}
              className="cursor-pointer"
            >
              <circle cx={lm.x} cy={lm.y} r="13" fill="transparent" />
              <circle
                cx={lm.x}
                cy={lm.y}
                r={isHovered ? 5.5 : 3.8}
                fill={isDark ? '#27272A' : '#FFFFFF'}
                stroke={isDark ? '#E4E4E7' : '#1B1C1C'}
                strokeWidth="1.6"
              />
              {lm.category === 'metro' && (
                <text
                  x={lm.x}
                  y={lm.y - 8}
                  textAnchor="middle"
                  fill="#276EF1"
                  fontSize="7"
                  fontWeight="700"
                >
                  M
                </text>
              )}
              <text
                x={lm.x + 8}
                y={lm.y + 3}
                fill={isHovered ? (isDark ? '#FFFFFF' : '#000000') : isDark ? '#A1A1AA' : '#3F3F46'}
                fontSize={isHovered ? '10.5' : '9.2'}
                fontWeight={isHovered ? '700' : '600'}
                paintOrder="stroke"
                stroke={isDark ? '#0B0B0C' : '#F3F2F0'}
                strokeWidth="3"
                strokeLinejoin="round"
              >
                {lm.name}
              </text>
            </g>
          );
        })}

        {/* Ambient Cruising Vehicles */}
        {stage !== 'in_progress' &&
          ambientVehicles.map((cab) => (
            <g
              key={cab.id}
              transform={`translate(${cab.x}, ${cab.y}) rotate(${cab.headingDeg})`}
              opacity={stage === 'arriving' ? 0.45 : 0.85}
            >
              <rect
                x="-7.5"
                y="-4.2"
                width="15"
                height="8.4"
                rx="2.5"
                fill={isDark ? '#E4E4E7' : '#1B1C1C'}
                stroke={isDark ? '#09090B' : '#FFFFFF'}
                strokeWidth="1.2"
              />
              <rect
                x="1.5"
                y="-3"
                width="3.2"
                height="6"
                rx="0.8"
                fill={isDark ? '#18181B' : '#FFFFFF'}
                opacity="0.7"
              />
            </g>
          ))}

        {/* Assigned Active Driver Vehicle Glyph */}
        {driverPosition && (stage === 'arriving' || stage === 'in_progress') && (
          <g
            transform={`translate(${driverPosition.point.x}, ${driverPosition.point.y})`}
          >
            {/* Active GPS beacon ring */}
            <circle r="15" fill="#276EF1" fillOpacity="0.16" />
            <circle r="10" fill="#276EF1" fillOpacity="0.28" />
            <g transform={`rotate(${driverPosition.headingDeg})`}>
              <rect
                x="-10"
                y="-5.5"
                width="20"
                height="11"
                rx="3"
                fill="#000000"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              <rect x="2" y="-3.8" width="4.5" height="7.6" rx="1" fill="#276EF1" />
            </g>
          </g>
        )}

        {/* Intermediate Stop Pins */}
        {stops.map((stop, idx) => (
          <g key={stop.id} transform={`translate(${stop.x}, ${stop.y})`}>
            <circle
              r="11"
              fill={isDark ? '#FFFFFF' : '#000000'}
              stroke={isDark ? '#000000' : '#FFFFFF'}
              strokeWidth="2"
            />
            <text
              y="3.5"
              textAnchor="middle"
              fill={isDark ? '#000000' : '#FFFFFF'}
              fontSize="10"
              fontWeight="700"
            >
              {idx + 1}
            </text>
            <g transform="translate(15, -10)">
              <rect
                x="0"
                y="0"
                width={Math.max(76, stop.name.length * 6.4 + 16)}
                height="21"
                rx="4"
                fill={isDark ? '#18181B' : '#FFFFFF'}
                stroke={isDark ? '#3F3F46' : '#E2E2E2'}
                strokeWidth="1"
              />
              <text
                x="8"
                y="14"
                fill={isDark ? '#FFFFFF' : '#000000'}
                fontSize="9.5"
                fontWeight="600"
              >
                {stop.name}
              </text>
            </g>
          </g>
        ))}

        {/* Pickup Pin (Square anchor inside crisp circular disc + #276EF1 beacon) */}
        {pickup && (
          <g transform={`translate(${pickup.x}, ${pickup.y})`}>
            <circle r="18" fill="#276EF1" fillOpacity="0.14" />
            <circle
              r="12"
              fill={isDark ? '#FFFFFF' : '#000000'}
              stroke={isDark ? '#000000' : '#FFFFFF'}
              strokeWidth="2"
            />
            <rect
              x="-3.5"
              y="-3.5"
              width="7"
              height="7"
              fill={isDark ? '#000000' : '#FFFFFF'}
            />
            <g transform="translate(16, -12)">
              <rect
                x="0"
                y="0"
                width={Math.max(92, pickup.name.length * 6.5 + 18)}
                height="24"
                rx="4"
                fill={isDark ? '#FFFFFF' : '#000000'}
              />
              <text
                x="9"
                y="15.5"
                fill={isDark ? '#000000' : '#FFFFFF'}
                fontSize="10"
                fontWeight="700"
              >
                {pickup.name}
              </text>
            </g>
          </g>
        )}

        {/* Destination Pin (Circular anchor inside crisp disc) */}
        {destination && (
          <g transform={`translate(${destination.x}, ${destination.y})`}>
            <circle
              r="12"
              fill={isDark ? '#FFFFFF' : '#000000'}
              stroke={isDark ? '#000000' : '#FFFFFF'}
              strokeWidth="2"
            />
            <circle r="3.8" fill={isDark ? '#000000' : '#FFFFFF'} />
            <g transform="translate(16, -12)">
              <rect
                x="0"
                y="0"
                width={Math.max(96, destination.name.length * 6.5 + 18)}
                height="24"
                rx="4"
                fill={isDark ? '#18181B' : '#FFFFFF'}
                stroke={isDark ? '#FFFFFF' : '#000000'}
                strokeWidth="1.5"
              />
              <text
                x="9"
                y="15.5"
                fill={isDark ? '#FFFFFF' : '#000000'}
                fontSize="10"
                fontWeight="700"
              >
                {destination.name}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
