
import bcrypt from "bcrypt";
import { authService } from "../apps/api/src/services/auth.service";
import { usersRepository } from "../apps/api/src/repositories/users.repository";

jest.mock("../apps/api/src/config/env", () => ({
  env: {
    JWT_SECRET: "test-only-secret-key-at-least-32-characters",
    JWT_EXPIRES_IN: "24h",
  },
}));

jest.mock("../apps/api/src/repositories/users.repository", () => ({
  usersRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
  },
}));

const findByEmailMock = usersRepository.findByEmail as jest.Mock;
const createMock = usersRepository.create as jest.Mock;

const password = "TestPassword123!";

const existingUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  passwordHash: "",
  role: "customer",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Authentication Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("hashes password and compares it correctly", async () => {
    const hash = await bcrypt.hash(password, 4);

    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("WrongPassword123!", hash)).toBe(false);
  });

  test("registers a new user successfully", async () => {
    findByEmailMock.mockResolvedValue(null);

    const safeUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createMock.mockResolvedValue(safeUser);

    const result = await authService.register({
      name: "Test User",
      email: "test@example.com",
      password,
    });

    expect(result.success).toBe(true);
    expect(createMock).toHaveBeenCalledTimes(1);

    const savedData = createMock.mock.calls[0][0];

    expect(savedData.passwordHash).not.toBe(password);
    expect(await bcrypt.compare(password, savedData.passwordHash)).toBe(true);

    if (result.success) {
      expect(result.user).not.toHaveProperty("passwordHash");
    }
  });

  test("rejects duplicate email registration", async () => {
    findByEmailMock.mockResolvedValue(existingUser);

    const result = await authService.register({
      name: "Test User",
      email: "test@example.com",
      password,
    });

    expect(result.success).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  test("logs in successfully with correct password", async () => {
    const passwordHash = await bcrypt.hash(password, 4);

    findByEmailMock.mockResolvedValue({
      ...existingUser,
      passwordHash,
    });

    const result = await authService.login({
      email: "test@example.com",
      password,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.token).toBeTruthy();
      expect(result.user.email).toBe("test@example.com");
      expect(result.user).not.toHaveProperty("passwordHash");
    }
  });

  test("rejects login with an incorrect password", async () => {
    const passwordHash = await bcrypt.hash(password, 4);

    findByEmailMock.mockResolvedValue({
      ...existingUser,
      passwordHash,
    });

    const result = await authService.login({
      email: "test@example.com",
      password: "WrongPassword123!",
    });

    expect(result.success).toBe(false);
  });
});
