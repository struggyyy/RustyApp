/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2025, @struggyyy                    *
 *                                                                         *
 *                             Project: Rusty                              *
 *                                                                         *
 *                         All Rights Reserved                             *
 *                                                                         *
 *         This is unpublished proprietary source code of @struggyyy.      *
 *        The copyright notice above does not evidence any actual          *
 *              or intended publication of such source code.               *
 *                                                                         *
 ************************************************************************** */
// React specific imports
import { useState, useRef } from "react";

// External libraries
import { useRouter } from "expo-router";
import * as Location from "expo-location";

// Internal imports
import { useAuth } from "@/core/context/AuthContext";
import { useTranslation } from "@/shared/hooks/common/useTranslation";
import { useAlert } from "@/core/context/AlertContext";
import { createReport, uploadReportImage } from "@/lib/firebase/reports";

export function useReportForm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [description, setDescription] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (
    imageUri: string | null,
    location: Location.LocationObject | null
  ) => {
    if (isSubmittingRef.current) return;

    if (
      !user ||
      !imageUri ||
      !location ||
      !description.trim() ||
      description.trim().length < 5 ||
      description.trim().length > 150
    ) {
      showAlert(t("common.error"), t("reports.descriptionRequired"));
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const reportId = `report_${Date.now()}`;
      const imageUrl = await uploadReportImage(imageUri, user.uid, reportId);

      await createReport({
        userId: user.uid,
        userEmail: user.email || "Unknown User",
        imageUrl,
        description,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });

      showAlert(t("common.success"), t("reports.reportSubmittedSuccess"), [
        { text: t("common.ok"), onPress: () => router.replace("/my-reports") },
      ]);
    } catch (error) {
      showAlert(t("common.error"), t("reports.deleteReportError"));
      // On failure, release the lock and reset the button
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const isFormReady = (
    imageUri: string | null,
    location: Location.LocationObject | null
  ) =>
    !!imageUri &&
    !!description.trim() &&
    description.trim().length >= 5 &&
    description.trim().length <= 150 &&
    !!location;

  return {
    description,
    setDescription,
    showInstructions,
    setShowInstructions,
    isSubmitting,
    handleSubmit,
    isFormReady,
  };
}
