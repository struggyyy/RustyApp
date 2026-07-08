/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2026, @struggyyy                    *
 *
 *                              Project: Rusty                             *
 *
 *                         All Rights Reserved                             *
 *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *
 ************************************************************************** */

// Internal imports
import { formatDate } from "../dateUtils";

describe("dateUtils", () => {
  it("formats date correctly (DD.MM.YYYY)", () => {
    // Note: Month is 0-indexed in JS Date (0 = Jan, 11 = Dec)
    const date = new Date(2023, 9, 5); // Oct 5, 2023
    expect(formatDate(date)).toBe("05.10.2023");
  });

  it("pads single digits correctly", () => {
    const date = new Date(2023, 0, 1); // Jan 1, 2023
    expect(formatDate(date)).toBe("01.01.2023");
  });

  it("handles double digit days and months", () => {
    const date = new Date(2023, 11, 25); // Dec 25, 2023
    expect(formatDate(date)).toBe("25.12.2023");
  });
});
