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

// External libraries
import { useRouter } from "expo-router";

// Internal imports
import UserProfilePage from "@/components/features/user/profile-page/UserProfilePage";

export default function Profile(): React.ReactElement {
  const router = useRouter();

  return (
    <UserProfilePage onViewAllReports={() => router.push("/my-reports")} />
  );
}
