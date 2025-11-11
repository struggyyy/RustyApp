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
import { Report } from "@/types/reports";
import colors from "@/theme/colors";
import TouchableButton from "@/components/common/buttons/TouchableButton";

interface ProfileReportsCardProps {
  reports: Report[];
  onViewAllReports: () => void;
  t: (key: string) => string;
}

const styles = StyleSheet.create({
  reportsCard: {
    backgroundColor: colors.componentBackground,
    borderRadius: 24,
    padding: 12,
    marginBottom: 20,
    minHeight: 53,
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
      <TouchableButton onPress={onViewAllReports}>
        <Text style={styles.reportsTitle}>{t("reports.viewAllReports")}</Text>
      </TouchableButton>
    </View>
  );
};

export default ProfileReportsCard;
