import { describe, expect, it } from "vitest";

import { formatDeadlineCountdown, isAtRisk } from "@/lib/filings/deadline";

describe("formatDeadlineCountdown", () => {
  const now = new Date("2025-07-01T10:00:00Z");

  it("reads 'Due today' when the deadline is later the same day", () => {
    expect(formatDeadlineCountdown("2025-07-01", now)).toBe("Due today");
  });

  it("reads 'Due tomorrow' for a one-day-out deadline", () => {
    expect(formatDeadlineCountdown("2025-07-02", now)).toBe("Due tomorrow");
  });

  it("counts multiple days left", () => {
    expect(formatDeadlineCountdown("2025-07-31", now)).toBe("30 days left");
  });

  it("reports singular overdue day correctly", () => {
    expect(formatDeadlineCountdown("2025-06-30", now)).toBe("Overdue by 1 day");
  });

  it("reports plural overdue days correctly", () => {
    expect(formatDeadlineCountdown("2025-06-01", now)).toBe("Overdue by 30 days");
  });
});

describe("isAtRisk", () => {
  const now = new Date("2025-07-01T10:00:00Z");

  it("flags an already-overdue deadline regardless of threshold", () => {
    expect(isAtRisk("2025-06-01", now, 5)).toBe(true);
  });

  it("flags a deadline exactly at the threshold", () => {
    expect(isAtRisk("2025-07-31", now, 30)).toBe(true);
  });

  it("does not flag a deadline just past the threshold", () => {
    expect(isAtRisk("2025-08-01", now, 30)).toBe(false);
  });

  it("defaults to a 30-day threshold when none is given", () => {
    expect(isAtRisk("2025-07-31", now)).toBe(true);
    expect(isAtRisk("2025-08-01", now)).toBe(false);
  });
});
