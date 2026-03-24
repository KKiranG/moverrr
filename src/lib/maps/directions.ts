export async function getDirections(params: {
  origin: string;
  destination: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_KEY.");
  }

  const search = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${search.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load directions.");
  }

  return response.json();
}
