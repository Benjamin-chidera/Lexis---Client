import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "../page";

// Create mock functions for authStore operations
const mockCheckEmail = vi.fn();
const mockLogin = vi.fn();
const mockSetPassword = vi.fn();

// Mock the Zustand auth store
vi.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    checkEmail: mockCheckEmail,
    login: mockLogin,
    setPassword: mockSetPassword,
  }),
}));

// Mock the react-router-dom navigate function
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast to verify alert triggers
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders corporate email input screen initially", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Verify initial sign in layout is shown
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  test("transitions to login step when email is registered with password", async () => {
    // Mock the checkEmail call to return a user who has a password set
    mockCheckEmail.mockResolvedValueOnce({ name: "Jane Doe", has_password: true });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("you@company.com");
    fireEvent.change(emailInput, { target: { value: "jane@company.com" } });

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    // Verify it calls checkEmail with the entered email
    expect(mockCheckEmail).toHaveBeenCalledWith("jane@company.com");

    // Wait for interface to update and transition to step: login
    await waitFor(() => {
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });
  });

  test("transitions to set-password step when email is registered but has no password set", async () => {
    // Mock the checkEmail call to return a user who has NOT set a password yet
    mockCheckEmail.mockResolvedValueOnce({ name: "Bob New", has_password: false });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("you@company.com");
    fireEvent.change(emailInput, { target: { value: "bob@company.com" } });

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    // Wait for setup password screen to appear
    await waitFor(() => {
      expect(screen.getByText("Hey Bob New")).toBeInTheDocument();
      expect(screen.getByText("Set your password")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument(); // Confirm password input
      expect(screen.getByRole("button", { name: /set password & sign in/i })).toBeInTheDocument();
    });
  });

  test("signs in user successfully and navigates to dashboard", async () => {
    // Step 1: Transition to returning user login state
    mockCheckEmail.mockResolvedValueOnce({ name: "Jane Doe", has_password: true });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("you@company.com");
    fireEvent.change(emailInput, { target: { value: "jane@company.com" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Step 2: Input password and submit login
    await waitFor(() => {
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText("••••••••");
    fireEvent.change(passwordInput, { target: { value: "pass12345" } });

    mockLogin.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify backend is queried and router navigates home
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("jane@company.com", "pass12345");
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
