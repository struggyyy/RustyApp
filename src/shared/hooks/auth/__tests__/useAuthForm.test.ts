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
// Test-specific imports
import { renderHook, act } from "@testing-library/react-native";

// Internal imports
import { useAuthForm } from "../useAuthForm";

describe("useAuthForm", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() =>
      useAuthForm({ initialValues: { email: "" } }),
    );
    expect(result.current.values).toEqual({ email: "" });
    expect(result.current.errors).toEqual({});
  });

  it("updates values on change", () => {
    const { result } = renderHook(() =>
      useAuthForm({ initialValues: { email: "" } }),
    );

    act(() => {
      result.current.handleChange("email")("test@example.com");
    });

    expect(result.current.values.email).toBe("test@example.com");
  });

  it("validates required fields", async () => {
    const { result } = renderHook(() =>
      useAuthForm({ initialValues: { email: "", password: "" } }),
    );

    await act(async () => {
      result.current.validate();
    });

    expect(result.current.errors.email).toBe("Email is required");
    expect(result.current.errors.password).toBe("Password is required");
  });

  it("validates email format", async () => {
    const { result } = renderHook(() =>
      useAuthForm({ initialValues: { email: "invalid-email" } }),
    );

    await act(async () => {
      result.current.validate();
    });

    expect(result.current.errors.email).toBe("Invalid email format");
  });

  it("calls onSubmit when valid", async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useAuthForm({
        initialValues: { email: "test@example.com", password: "password123" },
        onSubmit,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("does not call onSubmit when invalid", async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useAuthForm({
        initialValues: { email: "", password: "" },
        onSubmit,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
