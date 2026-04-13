import type { RouteAlert } from "@/types/customer";

import {
  createSavedSearch,
  deleteSavedSearch,
  listUserSavedSearches,
  listUserSavedSearchesWithOptions,
  updateSavedSearch,
} from "@/lib/data/saved-searches";

export type AlertInput = {
  fromSuburb: string;
  fromPostcode?: string;
  toSuburb: string;
  toPostcode?: string;
  itemCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  notifyEmail: string;
};

export async function createRouteAlert(userId: string, params: AlertInput): Promise<RouteAlert> {
  return createSavedSearch(userId, params);
}

export async function listUserAlerts(userId: string): Promise<RouteAlert[]> {
  return listUserSavedSearches(userId);
}

export async function listUserAlertsWithOptions(
  userId: string,
  options?: { includeInactive?: boolean },
): Promise<RouteAlert[]> {
  return listUserSavedSearchesWithOptions(userId, options);
}

export async function updateRouteAlert(
  id: string,
  userId: string,
  params: Partial<{
    fromSuburb: string;
    fromPostcode: string;
    toSuburb: string;
    toPostcode: string;
    itemCategory: string;
    dateFrom: string;
    dateTo: string;
    notifyEmail: string;
    isActive: boolean;
  }>,
): Promise<RouteAlert> {
  return updateSavedSearch(id, userId, params);
}

export async function deleteRouteAlert(id: string, userId: string) {
  return deleteSavedSearch(id, userId);
}
