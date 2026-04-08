import assert from "node:assert/strict";
import test from "node:test";

import {
  formatDateTimeInputValue,
  getDateDistanceInDays,
  getDateOffsetIso,
  getNextWeekdayDate,
  getTodayIsoDate,
} from "@/lib/utils";

test("getDateOffsetIso adds days correctly", () => {
  assert.equal(getDateOffsetIso("2023-01-01", 5), "2023-01-06");
});

test("getDateOffsetIso subtracts days correctly", () => {
  assert.equal(getDateOffsetIso("2023-01-06", -5), "2023-01-01");
});

test("getDateOffsetIso handles month boundary", () => {
  assert.equal(getDateOffsetIso("2023-01-31", 1), "2023-02-01");
});

test("getDateOffsetIso handles year boundary", () => {
  assert.equal(getDateOffsetIso("2023-12-31", 1), "2024-01-01");
});

test("getDateOffsetIso handles leap years", () => {
  assert.equal(getDateOffsetIso("2024-02-28", 1), "2024-02-29");
  assert.equal(getDateOffsetIso("2024-02-29", 1), "2024-03-01");
  assert.equal(getDateOffsetIso("2023-02-28", 1), "2023-03-01");
});

test("getDateOffsetIso returns original date on invalid input", () => {
  assert.equal(getDateOffsetIso("invalid", 5), "invalid");
});

test("getDateDistanceInDays calculates distance correctly", () => {
  assert.equal(getDateDistanceInDays("2023-01-01", "2023-01-01"), 0);
  assert.equal(getDateDistanceInDays("2023-01-01", "2023-01-02"), 1);
  assert.equal(getDateDistanceInDays("2023-01-02", "2023-01-01"), -1);
});

test("getDateDistanceInDays handles leap year distance", () => {
  assert.equal(getDateDistanceInDays("2024-02-28", "2024-03-01"), 2);
});

test("getDateDistanceInDays returns 0 on invalid input", () => {
  assert.equal(getDateDistanceInDays("invalid", "2023-01-01"), 0);
  assert.equal(getDateDistanceInDays("2023-01-01", "invalid"), 0);
});

test("getNextWeekdayDate calculates next weekday correctly", () => {
  // 2023-01-01 is Sunday (0)
  const sunday = new Date("2023-01-01T12:00:00Z"); // Mid-day UTC to avoid edge cases

  // Next Monday (1)
  assert.equal(getNextWeekdayDate(1, sunday), "2023-01-02");

  // Next Saturday (6)
  assert.equal(getNextWeekdayDate(6, sunday), "2023-01-07");
});

test("getNextWeekdayDate returns next week if today is the target weekday", () => {
  // 2023-01-02 is Monday (1)
  const monday = new Date("2023-01-02T12:00:00Z");

  // Next Monday (1) should be 7 days later
  assert.equal(getNextWeekdayDate(1, monday), "2023-01-09");
});

test("getTodayIsoDate returns a valid YYYY-MM-DD string", () => {
  const today = getTodayIsoDate();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);

  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  const expected = localDate.toISOString().split("T")[0];
  assert.equal(today, expected);
});

test("formatDateTimeInputValue formats valid date correctly", () => {
  const date = "2023-01-01T12:00:00Z";
  const result = formatDateTimeInputValue(date);

  const parsed = new Date(date);
  const localDate = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  const expected = localDate.toISOString().slice(0, 16);

  assert.equal(result, expected);
});

test("formatDateTimeInputValue handles null and undefined", () => {
  assert.equal(formatDateTimeInputValue(null), "");
  assert.equal(formatDateTimeInputValue(undefined), "");
});

test("formatDateTimeInputValue handles invalid dates", () => {
  assert.equal(formatDateTimeInputValue("invalid"), "");
});
