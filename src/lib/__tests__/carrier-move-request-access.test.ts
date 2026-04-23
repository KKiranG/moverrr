import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const migrationSql = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/033_carrier_move_request_read_policy.sql"),
  "utf8",
);
const moveRequestsSource = fs.readFileSync(
  path.join(process.cwd(), "src/lib/data/move-requests.ts"),
  "utf8",
);
const carrierRequestPageSource = fs.readFileSync(
  path.join(process.cwd(), "src/app/(carrier)/carrier/requests/[requestId]/page.tsx"),
  "utf8",
);

function getCarrierLoaderSource() {
  const match = moveRequestsSource.match(
    /export async function getMoveRequestByIdForCarrier[\s\S]*?\n}\n\nexport async function listMoveRequestsForCustomer/,
  );

  assert.ok(match, "getMoveRequestByIdForCarrier source should be present.");
  return match[0];
}

test("carrier move-request read policy is scoped through the carrier's booking request", () => {
  assert.match(
    migrationSql,
    /create policy "move_requests_carrier_select_via_booking_request"/,
  );
  assert.match(migrationSql, /on public\.move_requests\s+for select\s+to authenticated/i);
  assert.match(migrationSql, /from public\.booking_requests booking_request/i);
  assert.match(migrationSql, /join public\.carriers carrier_row/i);
  assert.match(migrationSql, /booking_request\.move_request_id = move_requests\.id/i);
  assert.match(migrationSql, /carrier_row\.user_id = auth\.uid\(\)/i);
});

test("carrier move-request loader uses the user-scoped Supabase client", () => {
  const source = getCarrierLoaderSource();

  assert.match(source, /createServerSupabaseClient\(\)/);
  assert.doesNotMatch(source, /createAdminClient\(\)/);
  assert.match(source, /\.from\("move_requests"\)/);
  assert.match(source, /\.eq\("id", moveRequestId\)/);
});

test("carrier request detail page no longer loads move requests through admin access", () => {
  assert.match(carrierRequestPageSource, /getMoveRequestByIdForCarrier/);
  assert.doesNotMatch(carrierRequestPageSource, /getMoveRequestByIdForAdmin/);
});
