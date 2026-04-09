const SUBURB_COORDS = {
  alexandria: { lat: -33.9105, lng: 151.1983 },
  annandale: { lat: -33.8816, lng: 151.1705 },
  ashfield: { lat: -33.8898, lng: 151.1257 },
  banksmeadow: { lat: -33.9428, lng: 151.2173 },
  bondi: { lat: -33.8931, lng: 151.2629 },
  "bondi beach": { lat: -33.8915, lng: 151.2767 },
  "bondi junction": { lat: -33.8912, lng: 151.2482 },
  mascot: { lat: -33.9288, lng: 151.1931 },
  botany: { lat: -33.9463, lng: 151.1972 },
  burwood: { lat: -33.8731, lng: 151.1048 },
  camperdown: { lat: -33.8886, lng: 151.1805 },
  camperdown_nsw: { lat: -33.8886, lng: 151.1805 },
  chatswood: { lat: -33.7963, lng: 151.1832 },
  coogee: { lat: -33.9205, lng: 151.2554 },
  cronulla: { lat: -34.0533, lng: 151.1528 },
  darlinghurst: { lat: -33.8786, lng: 151.2196 },
  double_bay: { lat: -33.8782, lng: 151.2426 },
  drummoyne: { lat: -33.8524, lng: 151.1544 },
  erskineville: { lat: -33.8993, lng: 151.1852 },
  glebe: { lat: -33.8795, lng: 151.1856 },
  haymarket: { lat: -33.8792, lng: 151.2054 },
  homebush: { lat: -33.8667, lng: 151.0833 },
  hurstville: { lat: -33.9675, lng: 151.1017 },
  kingsford: { lat: -33.9243, lng: 151.2266 },
  leichhardt: { lat: -33.8831, lng: 151.1565 },
  manly: { lat: -33.7969, lng: 151.2869 },
  marrickville: { lat: -33.9106, lng: 151.1550 },
  mosman: { lat: -33.8282, lng: 151.2440 },
  newtown: { lat: -33.8978, lng: 151.1791 },
  north_sydney: { lat: -33.8390, lng: 151.2070 },
  paddington: { lat: -33.8842, lng: 151.2310 },
  parramatta: { lat: -33.8136, lng: 151.0034 },
  petersham: { lat: -33.8946, lng: 151.1548 },
  pyrmont: { lat: -33.8708, lng: 151.1949 },
  randwick: { lat: -33.9153, lng: 151.2412 },
  redfern: { lat: -33.8922, lng: 151.2040 },
  rhodes: { lat: -33.8276, lng: 151.0852 },
  rozelle: { lat: -33.8625, lng: 151.1717 },
  surry_hills: { lat: -33.8845, lng: 151.2094 },
  stanmore: { lat: -33.8947, lng: 151.1649 },
  strathfield: { lat: -33.8721, lng: 151.0943 },
  summer_hill: { lat: -33.8917, lng: 151.1399 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  ultimo: { lat: -33.8785, lng: 151.1997 },
  waterloo: { lat: -33.9020, lng: 151.2100 },
  waverton: { lat: -33.8389, lng: 151.1995 },
  wolli_creek: { lat: -33.9281, lng: 151.1543 },
  woollahra: { lat: -33.8874, lng: 151.2365 },
  zetland: { lat: -33.9063, lng: 151.2108 },
} as const;

function normalizeSuburbKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\bnsw\b/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

export function getSydneySuburbCoords(suburb: string) {
  const direct = SUBURB_COORDS[normalizeSuburbKey(suburb) as keyof typeof SUBURB_COORDS];

  if (direct) {
    return direct;
  }

  const spacedKey = normalizeSuburbKey(suburb).replaceAll("_", " ");
  return SUBURB_COORDS[spacedKey as keyof typeof SUBURB_COORDS] ?? null;
}
