/** *************************************************************************
 *                                                                         *
 *                       Copyright (c) 2026, @struggyyy                    *
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
// Internal imports
import { ReportStatus } from "@/shared/types/reports";

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  createdAt: any;
  updatedAt?: any;
  role?: "user" | "admin";
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    haptics: boolean;
  };
  pushToken?: string;
  language?: string;
  points?: number;
  adminPreferences?: {
    selectedStatuses?: ReportStatus[];
    maxDistance?: number;
  };
}
