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
import React, { createContext, useContext, useState, ReactNode } from "react";

interface LayoutContextType {
  isMapReady: boolean;
  setMapReady: (ready: boolean) => void;
  isAdminDataReady: boolean;
  setAdminDataReady: (ready: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Layout provider component for managing global layout state (e.g. map readiness)
export const LayoutProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isMapReady, setMapReady] = useState(false);
  const [isAdminDataReady, setAdminDataReady] = useState(false);

  return (
    <LayoutContext.Provider
      value={{ isMapReady, setMapReady, isAdminDataReady, setAdminDataReady }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
