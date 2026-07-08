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
import {
  getStatusTranslationKey,
  getStatusNoteTranslationKey,
} from "../statusTranslation";

describe("statusTranslation", () => {
  describe("getStatusTranslationKey", () => {
    it("returns correct key for 'Submitted'", () => {
      expect(getStatusTranslationKey("Submitted")).toBe(
        "reports.statusSubmitted",
      );
    });

    it("returns correct key for 'Accepted'", () => {
      expect(getStatusTranslationKey("Accepted")).toBe(
        "reports.statusAccepted",
      );
    });

    it("returns correct key for 'Completed'", () => {
      expect(getStatusTranslationKey("Completed")).toBe(
        "reports.statusCompleted",
      );
    });

    it("returns correct key for 'Canceled'", () => {
      expect(getStatusTranslationKey("Canceled")).toBe(
        "reports.statusCanceled",
      );
    });

    it("returns default key for unknown status", () => {
      expect(getStatusTranslationKey("Unknown")).toBe(
        "reports.statusSubmitted",
      );
    });

    it("returns default key for undefined status", () => {
      expect(getStatusTranslationKey(undefined)).toBe(
        "reports.statusSubmitted",
      );
    });
  });

  describe("getStatusNoteTranslationKey", () => {
    it("returns correct key for 'Submitted' note", () => {
      expect(getStatusNoteTranslationKey("Submitted")).toBe(
        "reports.reportSubmittedNote",
      );
    });

    it("returns default key for unknown status", () => {
      expect(getStatusNoteTranslationKey("Unknown")).toBe(
        "reports.reportSubmittedNote",
      );
    });
  });
});
