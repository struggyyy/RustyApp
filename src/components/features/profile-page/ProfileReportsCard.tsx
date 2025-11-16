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
// React-specific imports
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Internal imports
import { Report } from "@/shared/types/reports";
import colors from "@/core/theme/colors";
import theme from "@/core/theme";
import spacing from "@/core/theme/spacing";
import TouchableButton from "@/components/common/buttons/TouchableButton";

interface ProfileReportsCardProps {
  reports: Report[];
  onViewAllReports: () => void;
  t: (key: string) => string;
}

// Styles for the reports card layout
const styles = StyleSheet.create({
  reportsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.radius.XL,
    padding: spacing.S,
    marginBottom: 20,
    minHeight: 53,
    ...theme.shadows.modal,
  },
  reportsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 0,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

// Main component for displaying reports card
const ProfileReportsCard: React.FC<ProfileReportsCardProps> = ({
  reports,
  onViewAllReports,
  t,
}) => {
  if (reports.length === 0) {
    return <View style={[styles.reportsCard, { opacity: 0 }]} />;
  }

  return (
    <View style={styles.reportsCard}>
      <TouchableButton onPress={onViewAllReports} style={theme.shadows.button}>
        <Text style={styles.reportsTitle}>{t("reports.viewAllReports")}</Text>
      </TouchableButton>
    </View>
  );
};

export default ProfileReportsCard;
