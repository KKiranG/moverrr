export async function getDistanceMatrix(params: {
  origins: string[];
  destinations: string[];
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_KEY.");
  }

  const search = new URLSearchParams({
    origins: params.origins.join("|"),
    destinations: params.destinations.join("|"),
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?${search.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load distance matrix.");
  }

  return response.json();
}
