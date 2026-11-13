import {
  ComputedRoute,
  GraphEdge,
  GraphNode,
  GurugramLandmark,
  LocationSelection,
  Point,
} from '../types/ride';

// 100 logical map units ≈ 1.45 km in Gurugram metropolitan scale
const UNITS_TO_KM = 0.0145;

export const GURUGRAM_NODES: GraphNode[] = [
  { id: 'ambience', x: 395, y: 95, label: 'Ambience Mall / Delhi Border' },
  { id: 'udyog_vihar', x: 215, y: 155, label: 'Udyog Vihar Ph IV' },
  { id: 'cyberhub', x: 365, y: 215, label: 'DLF CyberHub' },
  { id: 'dlf_ph2', x: 525, y: 225, label: 'DLF Phase 2' },
  { id: 'iffco_chowk', x: 455, y: 355, label: 'IFFCO Chowk' },
  { id: 'mg_metro', x: 565, y: 325, label: 'MG Road' },
  { id: 'sikanderpur', x: 685, y: 290, label: 'Sikanderpur' },
  { id: 'aravalli', x: 855, y: 210, label: 'Aravalli Park' },
  { id: 'signature_tower', x: 385, y: 455, label: 'Signature Tower' },
  { id: 'sec_29', x: 495, y: 445, label: 'Sector 29' },
  { id: 'leisure_valley', x: 550, y: 405, label: 'Leisure Valley' },
  { id: 'dlf_ph1', x: 740, y: 385, label: 'DLF Phase 1' },
  { id: 'galleria', x: 670, y: 460, label: 'Galleria Market' },
  { id: 'millennium_cc', x: 565, y: 525, label: 'Millennium City Centre' },
  { id: 'sushant_lok', x: 640, y: 545, label: 'Sushant Lok' },
  { id: 'one_horizon', x: 795, y: 520, label: 'One Horizon Center' },
  { id: 'sec_54', x: 845, y: 655, label: 'Sector 54 Chowk' },
  { id: 'rajiv_chowk', x: 265, y: 610, label: 'Rajiv Chowk' },
  { id: 'hero_honda', x: 165, y: 725, label: 'Hero Honda Chowk' },
  { id: 'sec_44', x: 500, y: 625, label: 'Sector 44' },
  { id: 'medanta', x: 380, y: 690, label: 'Medanta Medicity' },
  { id: 'subhash_chowk', x: 495, y: 775, label: 'Subhash Chowk' },
  { id: 'golf_ext', x: 715, y: 775, label: 'Golf Course Ext. Rd' },
  { id: 'sohna_rd', x: 540, y: 850, label: 'Sohna Road' },
  { id: 'palam_vihar_jnc', x: 255, y: 365, label: 'Sheetla Mata Rd' },
  { id: 'sec_14', x: 320, y: 495, label: 'Sector 14' },
];

export const GURUGRAM_EDGES: GraphEdge[] = [
  // NH-48 (Delhi-Jaipur Expressway) spine
  { from: 'hero_honda', to: 'rajiv_chowk', roadName: 'NH-48 Expressway', roadClass: 'highway', trafficFactor: 1.15 },
  { from: 'rajiv_chowk', to: 'signature_tower', roadName: 'NH-48 Expressway', roadClass: 'highway', trafficFactor: 1.2 },
  { from: 'signature_tower', to: 'iffco_chowk', roadName: 'NH-48 Expressway', roadClass: 'highway', trafficFactor: 1.15 },
  { from: 'iffco_chowk', to: 'cyberhub', roadName: 'NH-48 Expressway', roadClass: 'highway', trafficFactor: 1.25 },
  { from: 'cyberhub', to: 'ambience', roadName: 'NH-48 Expressway', roadClass: 'highway', trafficFactor: 1.15 },

  // Udyog Vihar & Old Delhi Road
  { from: 'udyog_vihar', to: 'ambience', roadName: 'Old Delhi–Gurugram Rd', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'udyog_vihar', to: 'cyberhub', roadName: 'Shankar Chowk Rd', roadClass: 'arterial', trafficFactor: 1.2 },
  { from: 'udyog_vihar', to: 'palam_vihar_jnc', roadName: 'Old Delhi–Gurugram Rd', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'palam_vihar_jnc', to: 'iffco_chowk', roadName: 'Maharana Pratap Marg', roadClass: 'street', trafficFactor: 1.05 },
  { from: 'palam_vihar_jnc', to: 'sec_14', roadName: 'Old Delhi–Gurugram Rd', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'sec_14', to: 'signature_tower', roadName: 'Sector 14–15 Link Rd', roadClass: 'street', trafficFactor: 1.05 },
  { from: 'sec_14', to: 'rajiv_chowk', roadName: 'Jharsa Rd', roadClass: 'street', trafficFactor: 1.1 },

  // MG Road & Cyber City Loop
  { from: 'cyberhub', to: 'dlf_ph2', roadName: 'Cyber City Loop', roadClass: 'arterial', trafficFactor: 1.15 },
  { from: 'dlf_ph2', to: 'sikanderpur', roadName: 'Rapid Metro Corridor', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'dlf_ph2', to: 'mg_metro', roadName: 'DLF Phase 2 Ave', roadClass: 'street', trafficFactor: 1.05 },
  { from: 'iffco_chowk', to: 'mg_metro', roadName: 'MG Road', roadClass: 'arterial', trafficFactor: 1.25 },
  { from: 'mg_metro', to: 'sikanderpur', roadName: 'MG Road', roadClass: 'arterial', trafficFactor: 1.2 },
  { from: 'sikanderpur', to: 'aravalli', roadName: 'MG Road (Faridabad Link)', roadClass: 'highway', trafficFactor: 1.05 },

  // Golf Course Road
  { from: 'sikanderpur', to: 'dlf_ph1', roadName: 'Golf Course Rd', roadClass: 'highway', trafficFactor: 1.1 },
  { from: 'dlf_ph1', to: 'one_horizon', roadName: 'Golf Course Rd', roadClass: 'highway', trafficFactor: 1.08 },
  { from: 'one_horizon', to: 'sec_54', roadName: 'Golf Course Rd', roadClass: 'highway', trafficFactor: 1.05 },
  { from: 'sec_54', to: 'golf_ext', roadName: 'Golf Course Ext. Rd', roadClass: 'arterial', trafficFactor: 1.08 },

  // Central Gurugram: Sector 29, Leisure Valley, Sushant Lok, Galleria
  { from: 'iffco_chowk', to: 'leisure_valley', roadName: 'IFFCO–Leisure Valley Rd', roadClass: 'street', trafficFactor: 1.1 },
  { from: 'mg_metro', to: 'leisure_valley', roadName: 'Sushant Lok Link', roadClass: 'street', trafficFactor: 1.05 },
  { from: 'leisure_valley', to: 'sec_29', roadName: 'Sector 29 Ring Rd', roadClass: 'street', trafficFactor: 1.1 },
  { from: 'signature_tower', to: 'sec_29', roadName: 'Crowne Plaza Rd', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'sec_29', to: 'millennium_cc', roadName: 'Major Sushil Aima Marg', roadClass: 'arterial', trafficFactor: 1.15 },
  { from: 'millennium_cc', to: 'sushant_lok', roadName: 'Vyapar Kendra Rd', roadClass: 'street', trafficFactor: 1.1 },
  { from: 'sushant_lok', to: 'galleria', roadName: 'Hamilton Court Rd', roadClass: 'street', trafficFactor: 1.08 },
  { from: 'galleria', to: 'dlf_ph1', roadName: 'Galleria Boulevard', roadClass: 'street', trafficFactor: 1.1 },
  { from: 'galleria', to: 'one_horizon', roadName: 'DLF Phase 4–5 Link', roadClass: 'street', trafficFactor: 1.05 },
  { from: 'sushant_lok', to: 'one_horizon', roadName: 'Sector 43–53 Link', roadClass: 'arterial', trafficFactor: 1.08 },

  // Southern Grid: Sector 44, Medanta, Sohna Rd, Golf Course Ext
  { from: 'signature_tower', to: 'sec_44', roadName: 'Sector 30–44 Arterial', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'millennium_cc', to: 'sec_44', roadName: 'Netaji Subhash Marg', roadClass: 'arterial', trafficFactor: 1.12 },
  { from: 'sec_44', to: 'medanta', roadName: 'Sector 38–44 Rd', roadClass: 'street', trafficFactor: 1.05 },
  { from: 'rajiv_chowk', to: 'medanta', roadName: 'Sohna Rd', roadClass: 'arterial', trafficFactor: 1.2 },
  { from: 'medanta', to: 'subhash_chowk', roadName: 'Sohna Rd', roadClass: 'arterial', trafficFactor: 1.22 },
  { from: 'sec_44', to: 'subhash_chowk', roadName: 'Sector 45–47 Spine', roadClass: 'street', trafficFactor: 1.08 },
  { from: 'subhash_chowk', to: 'golf_ext', roadName: 'Golf Course Ext. Rd', roadClass: 'arterial', trafficFactor: 1.1 },
  { from: 'golf_ext', to: 'sushant_lok', roadName: 'Sector 56–43 Link', roadClass: 'street', trafficFactor: 1.08 },
  { from: 'subhash_chowk', to: 'sohna_rd', roadName: 'Badshahpur Elevated Rd', roadClass: 'highway', trafficFactor: 1.1 },
  { from: 'hero_honda', to: 'subhash_chowk', roadName: 'Southern Peripheral Rd', roadClass: 'arterial', trafficFactor: 1.08 },
];

export const GURUGRAM_LANDMARKS: GurugramLandmark[] = [
  {
    id: 'lm-cyberhub',
    name: 'DLF CyberHub',
    area: 'DLF Cyber City, Phase 2',
    category: 'hub',
    graphNodeId: 'cyberhub',
    x: 365,
    y: 215,
    popular: true,
  },
  {
    id: 'lm-millennium',
    name: 'Millennium City Centre',
    area: 'Sector 29 · Yellow Line Metro',
    category: 'metro',
    graphNodeId: 'millennium_cc',
    x: 565,
    y: 525,
    popular: true,
  },
  {
    id: 'lm-one-horizon',
    name: 'One Horizon Center',
    area: 'Golf Course Rd, Sector 43',
    category: 'hub',
    graphNodeId: 'one_horizon',
    x: 795,
    y: 520,
    popular: true,
  },
  {
    id: 'lm-galleria',
    name: 'Galleria Market',
    area: 'DLF Phase 4',
    category: 'mall',
    graphNodeId: 'galleria',
    x: 670,
    y: 460,
    popular: true,
  },
  {
    id: 'lm-ambience',
    name: 'Ambience Mall',
    area: 'NH-48, DLF Phase 3',
    category: 'mall',
    graphNodeId: 'ambience',
    x: 395,
    y: 95,
    popular: true,
  },
  {
    id: 'lm-sec29',
    name: 'Sector 29 Market',
    area: 'Leisure Valley Precinct',
    category: 'hub',
    graphNodeId: 'sec_29',
    x: 495,
    y: 445,
    popular: true,
  },
  {
    id: 'lm-iffco',
    name: 'IFFCO Chowk Metro',
    area: 'NH-48 · MG Road Junction',
    category: 'metro',
    graphNodeId: 'iffco_chowk',
    x: 455,
    y: 355,
  },
  {
    id: 'lm-sikanderpur',
    name: 'Sikanderpur Metro',
    area: 'Rapid Metro Interchange',
    category: 'metro',
    graphNodeId: 'sikanderpur',
    x: 685,
    y: 290,
  },
  {
    id: 'lm-mgroad',
    name: 'MG Road Mall Mile',
    area: 'MGF Metropolitan · City Centre',
    category: 'mall',
    graphNodeId: 'mg_metro',
    x: 565,
    y: 325,
  },
  {
    id: 'lm-udyog',
    name: 'Udyog Vihar Phase IV',
    area: 'Industrial & Tech Corridor',
    category: 'hub',
    graphNodeId: 'udyog_vihar',
    x: 215,
    y: 155,
  },
  {
    id: 'lm-medanta',
    name: 'Medanta The Medicity',
    area: 'Sector 38, Sohna Road',
    category: 'medical',
    graphNodeId: 'medanta',
    x: 380,
    y: 690,
  },
  {
    id: 'lm-sec54',
    name: 'Sector 54 Chowk',
    area: 'Golf Course Rd · Rapid Metro',
    category: 'metro',
    graphNodeId: 'sec_54',
    x: 845,
    y: 655,
  },
  {
    id: 'lm-aravalli',
    name: 'Aravalli Biodiversity Park',
    area: 'Mehrauli–Gurugram Border',
    category: 'park',
    graphNodeId: 'aravalli',
    x: 855,
    y: 210,
  },
  {
    id: 'lm-subhash',
    name: 'Subhash Chowk',
    area: 'Sohna Road · Sector 47',
    category: 'residential',
    graphNodeId: 'subhash_chowk',
    x: 495,
    y: 775,
  },
  {
    id: 'lm-sec44',
    name: 'Sector 44 Institutional Hub',
    area: 'Apparel House · Epicentre',
    category: 'hub',
    graphNodeId: 'sec_44',
    x: 500,
    y: 625,
  },
];

// Decorative & geographic map features for Gurugram vector canvas
export const RAPID_METRO_PATH: Point[] = [
  { x: 685, y: 290 }, // Sikanderpur
  { x: 615, y: 255 },
  { x: 525, y: 225 }, // DLF Ph 2
  { x: 430, y: 215 },
  { x: 365, y: 215 }, // CyberHub
  { x: 395, y: 155 },
  { x: 465, y: 150 },
  { x: 525, y: 225 },
];

export const GOLF_COURSE_METRO_PATH: Point[] = [
  { x: 685, y: 290 }, // Sikanderpur
  { x: 740, y: 385 }, // DLF Ph 1
  { x: 795, y: 520 }, // One Horizon
  { x: 845, y: 655 }, // Sec 54
];

export const YELLOW_LINE_METRO_PATH: Point[] = [
  { x: 760, y: 195 },
  { x: 685, y: 290 }, // Sikanderpur
  { x: 565, y: 325 }, // MG Rd
  { x: 455, y: 355 }, // IFFCO Chowk
  { x: 565, y: 525 }, // Millennium City Centre
];

export const GREEN_ZONES = [
  {
    id: 'aravalli-park',
    name: 'ARAVALLI BIODIVERSITY PARK',
    points: '760,90 980,75 1030,245 875,265 785,205',
    labelX: 905,
    labelY: 168,
  },
  {
    id: 'leisure-valley-park',
    name: 'LEISURE VALLEY',
    points: '515,380 590,375 595,440 520,442',
    labelX: 554,
    labelY: 410,
  },
  {
    id: 'dlf-golf-links',
    name: 'DLF GOLF & COUNTRY CLUB',
    points: '790,395 935,385 950,565 825,570',
    labelX: 872,
    labelY: 478,
  },
  {
    id: 'tau-devi-lal',
    name: 'TAU DEVI LAL PARK',
    points: '355,635 435,630 440,680 358,682',
    labelX: 398,
    labelY: 657,
  },
];

export const URBAN_BLOCKS = [
  { x: 245, y: 115, w: 95, h: 72, label: 'UDYOG VIHAR' },
  { x: 345, y: 175, w: 85, h: 65, label: 'CYBER CITY' },
  { x: 445, y: 175, w: 120, h: 85, label: 'DLF PHASE II' },
  { x: 605, y: 360, w: 115, h: 120, label: 'DLF PHASE IV' },
  { x: 455, y: 425, w: 92, h: 78, label: 'SECTOR 29' },
  { x: 462, y: 565, w: 110, h: 95, label: 'SECTOR 44' },
  { x: 600, y: 525, w: 130, h: 110, label: 'SUSHANT LOK' },
  { x: 270, y: 450, w: 90, h: 95, label: 'SECTOR 14' },
  { x: 545, y: 695, w: 145, h: 95, label: 'SECTOR 47–50' },
  { x: 755, y: 605, w: 135, h: 115, label: 'SECTOR 54' },
];

const nodeMap = new Map<string, GraphNode>(GURUGRAM_NODES.map((n) => [n.id, n]));

export function getNodeById(id: string): GraphNode | undefined {
  return nodeMap.get(id);
}

export function landmarkToSelection(lm: GurugramLandmark): LocationSelection {
  return {
    id: lm.id,
    name: lm.name,
    area: lm.area,
    graphNodeId: lm.graphNodeId,
    x: lm.x,
    y: lm.y,
  };
}

export function findNearestNode(x: number, y: number): GraphNode {
  let best = GURUGRAM_NODES[0];
  let bestDist = Infinity;
  for (const node of GURUGRAM_NODES) {
    const d = Math.hypot(node.x - x, node.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = node;
    }
  }
  return best;
}

export function getNeighbors(nodeId: string): Array<{ node: GraphNode; edge: GraphEdge; length: number }> {
  const results: Array<{ node: GraphNode; edge: GraphEdge; length: number }> = [];
  const origin = nodeMap.get(nodeId);
  if (!origin) return results;

  for (const edge of GURUGRAM_EDGES) {
    let targetId: string | null = null;
    if (edge.from === nodeId) targetId = edge.to;
    else if (edge.to === nodeId) targetId = edge.from;

    if (targetId) {
      const target = nodeMap.get(targetId);
      if (target) {
        const length = Math.hypot(target.x - origin.x, target.y - origin.y);
        results.push({ node: target, edge, length });
      }
    }
  }
  return results;
}

function dijkstraSegment(
  startId: string,
  endId: string
): { nodeIds: string[]; distanceUnits: number; roadNames: string[] } {
  if (startId === endId) {
    return { nodeIds: [startId], distanceUnits: 0, roadNames: [] };
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, { id: string; roadName: string } | null>();
  const unvisited = new Set<string>();

  for (const node of GURUGRAM_NODES) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
    unvisited.add(node.id);
  }
  dist.set(startId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let smallest = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id) ?? Infinity;
      if (d < smallest) {
        smallest = d;
        current = id;
      }
    }

    if (!current || smallest === Infinity || current === endId) break;
    unvisited.delete(current);

    for (const neighbor of getNeighbors(current)) {
      if (!unvisited.has(neighbor.node.id)) continue;
      const weighted = neighbor.length * (neighbor.edge.trafficFactor ?? 1);
      const alt = smallest + weighted;
      if (alt < (dist.get(neighbor.node.id) ?? Infinity)) {
        dist.set(neighbor.node.id, alt);
        prev.set(neighbor.node.id, { id: current, roadName: neighbor.edge.roadName });
      }
    }
  }

  const nodeIds: string[] = [];
  const roadNames: string[] = [];
  let cursor: string | null = endId;

  while (cursor) {
    nodeIds.unshift(cursor);
    const parent = prev.get(cursor);
    if (parent) {
      roadNames.unshift(parent.roadName);
      cursor = parent.id;
    } else {
      cursor = null;
    }
  }

  let rawDistance = 0;
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const a = nodeMap.get(nodeIds[i]);
    const b = nodeMap.get(nodeIds[i + 1]);
    if (a && b) rawDistance += Math.hypot(b.x - a.x, b.y - a.y);
  }

  return {
    nodeIds,
    distanceUnits: rawDistance,
    roadNames: Array.from(new Set(roadNames)),
  };
}

export function computeMultiStopRoute(waypoints: LocationSelection[]): ComputedRoute | null {
  if (waypoints.length < 2) return null;

  const fullNodeIds: string[] = [];
  const allRoadNames: string[] = [];
  let totalUnits = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const seg = dijkstraSegment(waypoints[i].graphNodeId, waypoints[i + 1].graphNodeId);
    totalUnits += seg.distanceUnits;
    for (const r of seg.roadNames) {
      if (!allRoadNames.includes(r)) allRoadNames.push(r);
    }
    if (i === 0) {
      fullNodeIds.push(...seg.nodeIds);
    } else {
      fullNodeIds.push(...seg.nodeIds.slice(1));
    }
  }

  const polyline: Point[] = [];
  for (const id of fullNodeIds) {
    const node = nodeMap.get(id);
    if (node) polyline.push({ x: node.x, y: node.y });
  }

  // If pickup or dropoff was a custom map click slightly offset from a node, prepend/append exact point
  const first = waypoints[0];
  const last = waypoints[waypoints.length - 1];
  if (first.isCustomPin && polyline.length > 0) {
    const d0 = Math.hypot(first.x - polyline[0].x, first.y - polyline[0].y);
    if (d0 > 4) {
      polyline.unshift({ x: first.x, y: first.y });
      totalUnits += d0;
    }
  }
  if (last.isCustomPin && polyline.length > 0) {
    const lastPt = polyline[polyline.length - 1];
    const dEnd = Math.hypot(last.x - lastPt.x, last.y - lastPt.y);
    if (dEnd > 4) {
      polyline.push({ x: last.x, y: last.y });
      totalUnits += dEnd;
    }
  }

  const distanceKm = Math.max(1.2, Number((totalUnits * UNITS_TO_KM).toFixed(1)));
  // Average Gurugram urban speed ~ 24 km/h including junction dwell
  const durationMin = Math.max(5, Math.round((distanceKm / 24) * 60 + (waypoints.length - 2) * 3));

  return {
    polyline,
    nodeIds: fullNodeIds,
    distanceKm,
    durationMin,
    primaryCorridors: allRoadNames.slice(0, 3),
  };
}

export function interpolateAlongPolyline(
  polyline: Point[],
  progress: number
): { point: Point; headingDeg: number; segmentIndex: number } {
  if (polyline.length === 0) {
    return { point: { x: 455, y: 355 }, headingDeg: 0, segmentIndex: 0 };
  }
  if (polyline.length === 1) {
    return { point: polyline[0], headingDeg: 0, segmentIndex: 0 };
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const segLengths: number[] = [];
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const len = Math.hypot(polyline[i + 1].x - polyline[i].x, polyline[i + 1].y - polyline[i].y);
    segLengths.push(len);
    total += len;
  }

  if (total === 0) {
    return { point: polyline[0], headingDeg: 0, segmentIndex: 0 };
  }

  const target = clamped * total;
  let accum = 0;

  for (let i = 0; i < segLengths.length; i++) {
    const len = segLengths[i];
    if (accum + len >= target || i === segLengths.length - 1) {
      const localT = len === 0 ? 0 : (target - accum) / len;
      const a = polyline[i];
      const b = polyline[i + 1];
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      return {
        point: {
          x: a.x + (b.x - a.x) * localT,
          y: a.y + (b.y - a.y) * localT,
        },
        headingDeg: angle,
        segmentIndex: i,
      };
    }
    accum += len;
  }

  const last = polyline[polyline.length - 1];
  return { point: last, headingDeg: 0, segmentIndex: polyline.length - 2 };
}

export function pickDriverDispatchOrigin(pickupNodeId: string): string {
  const candidates = ['iffco_chowk', 'mg_metro', 'sec_29', 'dlf_ph2', 'galleria', 'sec_44'];
  const originNode = nodeMap.get(pickupNodeId);
  if (!originNode) return 'iffco_chowk';

  let best = 'iffco_chowk';
  let bestScore = Infinity;
  for (const id of candidates) {
    if (id === pickupNodeId) continue;
    const node = nodeMap.get(id);
    if (!node) continue;
    const d = Math.hypot(node.x - originNode.x, node.y - originNode.y);
    // Prefer a driver 120–280 units away so the arrival polyline looks crisp
    const penalty = Math.abs(d - 180);
    if (penalty < bestScore) {
      bestScore = penalty;
      best = id;
    }
  }
  return best;
}
