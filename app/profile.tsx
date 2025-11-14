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
import ProfilePage from "../src/components/common/profile-page/ProfilePage";

export default function Profile() {
  const router = useRouter();

  return (
    <ProfilePage
      variant="user"
      onViewAllReports={() => router.push("/my-reports")}
    />
  );
}
