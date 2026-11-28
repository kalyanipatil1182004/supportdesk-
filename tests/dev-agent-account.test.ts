import bcrypt from "bcrypt";
import {
  createDevAgentAccount,
  type DevAgentUserStore,
} from "../scripts/dev-agent-account";

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

const hashMock = bcrypt.hash as jest.Mock;

function createStore(existingRole: string | null): DevAgentUserStore {
  return {
    findRoleByEmail: jest.fn().mockResolvedValue(
      existingRole ? { role: existingRole } : null
    ),
    createAgent: jest.fn().mockResolvedValue(undefined),
  };
}

describe("development Agent account setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hashMock.mockResolvedValue("test-hash");
  });

  test("creates a missing Agent with a bcrypt-hashed password and agent role", async () => {
    const store = createStore(null);

    await expect(
      createDevAgentAccount(
        "agent@example.test",
        "TestPassword123!",
        store
      )
    ).resolves.toBe("created");

    expect(hashMock).toHaveBeenCalledWith("TestPassword123!", 12);
    expect(store.createAgent).toHaveBeenCalledWith({
      name: "SupportDesk Development Agent",
      email: "agent@example.test",
      passwordHash: "test-hash",
      role: "agent",
    });
  });

  test("does not change an existing Agent account", async () => {
    const store = createStore("agent");

    await expect(
      createDevAgentAccount(
        "agent@example.test",
        "TestPassword123!",
        store
      )
    ).resolves.toBe("already-exists");

    expect(hashMock).not.toHaveBeenCalled();
    expect(store.createAgent).not.toHaveBeenCalled();
  });

  test.each(["customer", "admin"])(
    "refuses to modify an existing %s account",
    async (role) => {
      const store = createStore(role);

      await expect(
        createDevAgentAccount(
          "existing@example.test",
          "TestPassword123!",
          store
        )
      ).rejects.toThrow("different role");

      expect(hashMock).not.toHaveBeenCalled();
      expect(store.createAgent).not.toHaveBeenCalled();
    }
  );
});
