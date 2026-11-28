import { loginAndNavigateToDashboard } from "../apps/web/src/features/auth/login-navigation";

describe("login dashboard navigation", () => {
  const credentials = {
    email: "customer@example.test",
    password: "local-test-password",
  };

  test("navigates to the dashboard after successful login", async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    const navigate = jest.fn();

    await loginAndNavigateToDashboard(login, credentials, navigate);

    expect(login).toHaveBeenCalledWith(credentials);
    expect(navigate).toHaveBeenCalledWith("#dashboard");
  });

  test("does not navigate when login fails", async () => {
    const login = jest.fn().mockRejectedValue(new Error("Login failed"));
    const navigate = jest.fn();

    await expect(
      loginAndNavigateToDashboard(login, credentials, navigate)
    ).rejects.toThrow("Login failed");

    expect(navigate).not.toHaveBeenCalled();
  });
});
