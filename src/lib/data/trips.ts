import { unstable_cache } from "next/cache";

import { SEARCH_PAGE_SIZE, SEARCH_REVALIDATE_SECONDS } from "@/lib/constants";
import { hasMapsEnv, hasSupabaseEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { geocodeAddress } from "@/lib/maps/geocode";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { toGeographyPoint, toTrip, toTripSearchResult, type ListingJoinedRecord } from "@/lib/data/mappers";
import { tripSchema, tripUpdateSchema, type TripInput, type TripUpdateInput } from "@/lib/validation/trip";
import type { Trip, TripSearchInput, TripSearchResult } from "@/types/trip";

type SearchRpcRow = {
  listing_id: string;
  match_score: number;
  pickup_distance_km: number;
  dropoff_distance_km: number;
};

function getJoinedTripsQuery() {
  const supabase = createServerSupabaseClient();
  return supabase.from("capacity_listings").select(
    "*, carrier:carriers(*), vehicle:vehicles(*)",
  );
}

async function queryTripsByIds(ids: string[]) {
  if (!ids.length || !hasSupabaseEnv()) {
    return [];
  }

  const query = getJoinedTripsQuery();
  const { data, error } = await query.in("id", ids);

  if (error) {
    throw new AppError(error.message, 500, "trip_query_failed");
  }

  return ((data ?? []) as unknown as ListingJoinedRecord[]).map(toTrip);
}

export async function listPublicTrips(limit = SEARCH_PAGE_SIZE) {
  if (!hasSupabaseEnv()) {
    return [] as Trip[];
  }

  const query = getJoinedTripsQuery();
  const { data, error } = await query
    .in("status", ["active", "booked_partial"])
    .order("trip_date", { ascending: true })
    .limit(limit);

  if (error) {
    throw new AppError(error.message, 500, "trip_query_failed");
  }

  return ((data ?? []) as unknown as ListingJoinedRecord[]).map(toTrip);
}

export async function getTripById(id: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const query = getJoinedTripsQuery();
  const { data, error } = await query.eq("id", id).maybeSingle();

  if (error) {
    throw new AppError(error.message, 500, "trip_query_failed");
  }

  if (!data) {
    return null;
  }

  return toTrip(data as unknown as ListingJoinedRecord);
}

async function geocodeSearchInput(input: TripSearchInput) {
  if (!hasMapsEnv()) {
    return null;
  }

  const [from, to] = await Promise.all([
    geocodeAddress(`${input.from}, Sydney NSW, Australia`),
    geocodeAddress(`${input.to}, Sydney NSW, Australia`),
  ]);

  if (!from[0] || !to[0]) {
    return null;
  }

  return {
    pickupLat: from[0].location.lat,
    pickupLng: from[0].location.lng,
    dropoffLat: to[0].location.lat,
    dropoffLng: to[0].location.lng,
  };
}

const cachedTextSearch = unstable_cache(
  async (from: string, to: string, when?: string) => {
    if (!hasSupabaseEnv()) {
      return [] as TripSearchResult[];
    }

    const query = getJoinedTripsQuery();
    const { data, error } = await query
      .in("status", ["active", "booked_partial"])
      .ilike("origin_suburb", `%${from}%`)
      .ilike("destination_suburb", `%${to}%`)
      .order("trip_date", { ascending: true })
      .limit(SEARCH_PAGE_SIZE);

    if (error) {
      throw new AppError(error.message, 500, "trip_search_failed");
    }

    return ((data ?? []) as unknown as ListingJoinedRecord[])
      .map((record) => toTripSearchResult(toTrip(record), 50))
      .filter((trip) => !when || trip.tripDate === when);
  },
  ["trip-text-search"],
  { revalidate: SEARCH_REVALIDATE_SECONDS },
);

export async function searchTrips(input: TripSearchInput) {
  if (!hasSupabaseEnv()) {
    return [] as TripSearchResult[];
  }

  const geocoded = await geocodeSearchInput(input);

  if (!geocoded) {
    return cachedTextSearch(input.from, input.to, input.when);
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("find_matching_listings", {
    p_pickup_lat: geocoded.pickupLat,
    p_pickup_lng: geocoded.pickupLng,
    p_dropoff_lat: geocoded.dropoffLat,
    p_dropoff_lng: geocoded.dropoffLng,
    p_date: input.when ?? null,
    p_category: input.what ?? null,
    p_limit: SEARCH_PAGE_SIZE,
  });

  if (error) {
    throw new AppError(error.message, 500, "trip_search_failed");
  }

  const matches = (data ?? []) as unknown as SearchRpcRow[];
  const trips = await queryTripsByIds(matches.map((match) => match.listing_id));
  const tripMap = new Map(trips.map((trip) => [trip.id, trip]));

  return matches
    .map((match) => {
      const trip = tripMap.get(match.listing_id);

      if (!trip) {
        return null;
      }

      const routeFit = Math.max(0, 35 - match.pickup_distance_km * 2);
      const destinationFit = Math.max(0, 35 - match.dropoff_distance_km * 2);
      const reliability = Math.max(0, (trip.carrier.averageRating / 5) * 20);
      const priceFit = Math.max(0, 10 - trip.priceCents / 4000);

      return toTripSearchResult(trip, match.match_score, {
        routeFit,
        destinationFit,
        reliability,
        priceFit,
      });
    })
    .filter((trip): trip is TripSearchResult => Boolean(trip));
}

export async function listCarrierTrips(userId: string) {
  if (!hasSupabaseEnv()) {
    return [] as Trip[];
  }

  const supabase = createServerSupabaseClient();
  const { data: carrier } = await supabase
    .from("carriers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!carrier) {
    return [] as Trip[];
  }

  const query = getJoinedTripsQuery();
  const { data, error } = await query
    .eq("carrier_id", carrier.id)
    .order("trip_date", { ascending: true });

  if (error) {
    throw new AppError(error.message, 500, "carrier_trip_query_failed");
  }

  return ((data ?? []) as unknown as ListingJoinedRecord[]).map(toTrip);
}

export async function createTripForCarrier(userId: string, input: TripInput) {
  if (!hasSupabaseEnv()) {
    throw new AppError("Supabase is not configured.", 503, "supabase_unavailable");
  }

  const parsed = tripSchema.safeParse(input);

  if (!parsed.success) {
    throw new AppError("Trip payload is invalid.", 400, "invalid_trip");
  }

  const supabase = createServerSupabaseClient();
  const { data: carrier, error: carrierError } = await supabase
    .from("carriers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (carrierError) {
    throw new AppError(carrierError.message, 500, "carrier_lookup_failed");
  }

  if (!carrier) {
    throw new AppError(
      "Complete carrier onboarding before posting a trip.",
      400,
      "carrier_missing",
    );
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("carrier_id", carrier.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (vehicleError) {
    throw new AppError(vehicleError.message, 500, "vehicle_lookup_failed");
  }

  if (!vehicle) {
    throw new AppError(
      "Add an active vehicle before posting a trip.",
      400,
      "vehicle_missing",
    );
  }

  const insertPayload = {
    carrier_id: carrier.id,
    vehicle_id: vehicle.id,
    origin_suburb: parsed.data.originSuburb,
    origin_postcode: parsed.data.originPostcode,
    origin_point: toGeographyPoint(
      parsed.data.originLongitude,
      parsed.data.originLatitude,
    ),
    destination_suburb: parsed.data.destinationSuburb,
    destination_postcode: parsed.data.destinationPostcode,
    destination_point: toGeographyPoint(
      parsed.data.destinationLongitude,
      parsed.data.destinationLatitude,
    ),
    detour_radius_km: parsed.data.detourRadiusKm,
    trip_date: parsed.data.tripDate,
    time_window: parsed.data.timeWindow,
    space_size: parsed.data.spaceSize,
    available_weight_kg: parsed.data.availableWeightKg,
    available_volume_m3: parsed.data.availableVolumeM3,
    price_cents: parsed.data.priceCents,
    suggested_price_cents: parsed.data.suggestedPriceCents ?? null,
    accepts_furniture: parsed.data.accepts.includes("furniture"),
    accepts_boxes: parsed.data.accepts.includes("boxes"),
    accepts_appliances: parsed.data.accepts.includes("appliance"),
    accepts_fragile: parsed.data.accepts.includes("fragile"),
    stairs_ok: parsed.data.stairsOk,
    stairs_extra_cents: parsed.data.stairsExtraCents,
    helper_available: parsed.data.helperAvailable,
    helper_extra_cents: parsed.data.helperExtraCents,
    special_notes: parsed.data.specialNotes ?? null,
    status: parsed.data.status,
  };

  const { data, error } = await supabase
    .from("capacity_listings")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    throw new AppError(error.message, 500, "trip_create_failed");
  }

  return getTripById(data.id);
}

export async function cancelTripForCarrier(userId: string, tripId: string) {
  if (!hasSupabaseEnv()) {
    throw new AppError("Supabase is not configured.", 503, "supabase_unavailable");
  }

  const supabase = createServerSupabaseClient();
  const carrierTrips = await listCarrierTrips(userId);
  const ownsTrip = carrierTrips.some((trip) => trip.id === tripId);

  if (!ownsTrip) {
    throw new AppError("Trip not found.", 404, "trip_not_found");
  }

  const { error } = await supabase
    .from("capacity_listings")
    .update({ status: "cancelled" })
    .eq("id", tripId);

  if (error) {
    throw new AppError(error.message, 500, "trip_cancel_failed");
  }

  return true;
}

export async function updateTripForCarrier(
  userId: string,
  tripId: string,
  input: TripUpdateInput,
) {
  if (!hasSupabaseEnv()) {
    throw new AppError("Supabase is not configured.", 503, "supabase_unavailable");
  }

  const parsed = tripUpdateSchema.safeParse(input);

  if (!parsed.success) {
    throw new AppError("Trip update payload is invalid.", 400, "invalid_trip_update");
  }

  const supabase = createServerSupabaseClient();
  const { data: carrier, error: carrierError } = await supabase
    .from("carriers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (carrierError) {
    throw new AppError(carrierError.message, 500, "carrier_lookup_failed");
  }

  if (!carrier) {
    throw new AppError("Carrier profile not found.", 404, "carrier_not_found");
  }

  const { data: existingTrip, error: tripError } = await supabase
    .from("capacity_listings")
    .select("id")
    .eq("id", tripId)
    .eq("carrier_id", carrier.id)
    .maybeSingle();

  if (tripError) {
    throw new AppError(tripError.message, 500, "trip_lookup_failed");
  }

  if (!existingTrip) {
    throw new AppError("Trip not found.", 404, "trip_not_found");
  }

  const { error: updateError } = await supabase
    .from("capacity_listings")
    .update({
      trip_date: parsed.data.tripDate,
      time_window: parsed.data.timeWindow,
      space_size: parsed.data.spaceSize,
      available_volume_m3: parsed.data.availableVolumeM3,
      available_weight_kg: parsed.data.availableWeightKg,
      detour_radius_km: parsed.data.detourRadiusKm,
      price_cents: parsed.data.priceCents,
      status: parsed.data.status,
      special_notes: parsed.data.specialNotes?.trim() ? parsed.data.specialNotes.trim() : null,
    })
    .eq("id", tripId)
    .eq("carrier_id", carrier.id);

  if (updateError) {
    throw new AppError(updateError.message, 500, "trip_update_failed");
  }

  return getTripById(tripId);
}
