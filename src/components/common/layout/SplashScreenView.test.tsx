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
import SplashScreenView from "./SplashScreenView";

describe("SplashScreenView", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly with default testID and children", () => {
    const onFinish = jest.fn();
    const { getByTestId, getByText } = render(
      <SplashScreenView onAnimationFinish={onFinish}>
        <Text>Child App Content</Text>
      </SplashScreenView>,
    );
    expect(getByTestId("splash-screen-view")).toBeTruthy();
    expect(getByText("Child App Content")).toBeTruthy();
  });

  it("renders the logo image inside the splash overlay", () => {
    const { getByTestId } = render(<SplashScreenView />);
    expect(getByTestId("splash-logo-image")).toBeTruthy();
  });

  it("renders with custom testID and logoSize", () => {
    const { getByTestId } = render(
      <SplashScreenView testID="custom-splash" logoSize={200} />,
    );
    expect(getByTestId("custom-splash")).toBeTruthy();
  });

  it("handles isLoading state transitions and calls onAnimationFinish", () => {
    const onFinish = jest.fn();
    const { rerender, getByTestId } = render(
      <SplashScreenView isLoading={true} onAnimationFinish={onFinish} />,
    );
    expect(getByTestId("splash-screen-view")).toBeTruthy();

    rerender(
      <SplashScreenView isLoading={false} onAnimationFinish={onFinish} />,
    );
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onFinish).toHaveBeenCalled();
  });
});
