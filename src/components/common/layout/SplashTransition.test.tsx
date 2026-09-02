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
import { Text } from "react-native";

// External libraries
import { render, act } from "@testing-library/react-native";

// Internal imports
import { SplashTransition } from "./SplashTransition";

describe("SplashTransition", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders children directly and does not show overlay on cold start mount", () => {
    const { queryByTestId, getByText } = render(
      <SplashTransition isLoading={true}>
        <Text>App Content</Text>
      </SplashTransition>,
    );

    expect(getByText("App Content")).toBeTruthy();
    // SplashTransition overlay & spinner should not be visible on initial cold start mount
    expect(queryByTestId("splash-transition-overlay")).toBeNull();
    expect(queryByTestId("splash-transition-spinner")).toBeNull();
  });

  it("transitions smoothly from cold start to ready without triggering circular overlay", () => {
    const { rerender, queryByTestId, getByText } = render(
      <SplashTransition isLoading={true}>
        <Text>App Content</Text>
      </SplashTransition>,
    );

    expect(getByText("App Content")).toBeTruthy();

    // Finish cold start loading
    rerender(
      <SplashTransition isLoading={false}>
        <Text>App Content</Text>
      </SplashTransition>,
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText("App Content")).toBeTruthy();
    expect(queryByTestId("splash-transition-overlay")).toBeNull();
  });

  it("triggers circular transition for subsequent in-app loading states", () => {
    const { rerender, getByText, queryByTestId } = render(
      <SplashTransition isLoading={false}>
        <Text>App Content</Text>
      </SplashTransition>,
    );

    // Initial mount completed
    expect(getByText("App Content")).toBeTruthy();
    expect(queryByTestId("splash-transition-overlay")).toBeNull();

    // Subsequent in-app loading triggered (e.g. admin redirect)
    rerender(
      <SplashTransition isLoading={true}>
        <Text>App Content</Text>
      </SplashTransition>,
    );

    // Spinner and overlay are now present for in-app loading
    expect(queryByTestId("splash-transition-overlay")).toBeTruthy();
    expect(queryByTestId("splash-transition-spinner")).toBeTruthy();

    // Loading completes
    rerender(
      <SplashTransition isLoading={false}>
        <Text>App Content</Text>
      </SplashTransition>,
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Overlay unmounts after circular animation completes
    expect(queryByTestId("splash-transition-overlay")).toBeNull();
    expect(getByText("App Content")).toBeTruthy();
  });
});
