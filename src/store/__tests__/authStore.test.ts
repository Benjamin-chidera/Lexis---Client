import { describe, test, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../authStore";

// Helper to mock a successful JSON response from fetch
const mockFetchResponse = (data: unknown, ok = true) => {
  (globalThis.fetch as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({
    ok,
    json: async () => data,
    status: ok ? 200 : 400,
  });
};

// Helper to mock a failed response with a detail message
const mockFetchError = (detail: string, status = 400) => {
  (globalThis.fetch as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({
    ok: false,
    json: async () => ({ detail }),
    status,
  });
};

describe("AuthStore", () => {
  beforeEach(() => {
    // Clear mock history before each test
    vi.clearAllMocks();
    
    // Reset Zustand store state to initial values
    useAuthStore.setState({
      user: null,
      isLoading: false,
      sessionChecked: false,
    });
  });

  test("should have correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.sessionChecked).toBe(false);
    expect(state.isAuthenticated()).toBe(false);
    expect(state.isAdmin()).toBe(false);
  });

  test("checkEmail calls API and returns registration details", async () => {
    const mockResponse = { name: "John Doe", has_password: true };
    mockFetchResponse(mockResponse);

    const result = await useAuthStore.getState().checkEmail("john@example.com");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/check-email"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ corporate_email: "john@example.com" }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  test("login updates store user on success", async () => {
    const mockUserResponse = {
      user_id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "employee",
    };
    mockFetchResponse(mockUserResponse);

    await useAuthStore.getState().login("john@example.com", "password123");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUserResponse);
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated()).toBe(true);
    expect(state.isAdmin()).toBe(false);
  });

  test("login handles failure by setting isLoading false and throwing error", async () => {
    mockFetchError("Invalid email or password.", 401);

    await expect(
      useAuthStore.getState().login("john@example.com", "wrongpassword")
    ).rejects.toThrow("Invalid email or password.");

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  test("setPassword saves new password and signs user in", async () => {
    const mockUserResponse = {
      user_id: 2,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    };
    mockFetchResponse(mockUserResponse);

    await useAuthStore.getState().setPassword("admin@example.com", "newpass123", "newpass123");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUserResponse);
    expect(state.isAuthenticated()).toBe(true);
    expect(state.isAdmin()).toBe(true);
  });

  test("logout clears user state", async () => {
    // Pre-populate store with a user
    useAuthStore.setState({
      user: {
        user_id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "employee",
      },
    });

    mockFetchResponse({ message: "Logged out successfully" });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
  });

  test("checkSession restores session if cookie/token is valid", async () => {
    const mockMeResponse = {
      user_id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "employee",
      is_active: true,
    };
    mockFetchResponse(mockMeResponse);

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toEqual({
      user_id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "employee",
    });
    expect(state.sessionChecked).toBe(true);
  });

  test("checkSession resets user to null if endpoint fails", async () => {
    // Start with logged in state
    useAuthStore.setState({
      user: {
        user_id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "employee",
      },
    });

    mockFetchError("Unauthorized", 401);

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.sessionChecked).toBe(true);
  });
});
