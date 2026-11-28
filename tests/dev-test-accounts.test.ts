import bcrypt from "bcrypt";
import {
  createDevelopmentTestAccounts,
  developmentTestAccounts,
  type DevelopmentTestAccountStore,
} from "../scripts/dev-test-accounts";

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(async (password: string) => `hashed:${password}`),
  },
}));

const hashMock = bcrypt.hash as jest.Mock;

function createStore(existingEmails: string[] = []): DevelopmentTestAccountStore {
  return {
    findExistingEmails: jest.fn().mockResolvedValue(existingEmails),
    createAccounts: jest.fn().mockResolvedValue(undefined),
  };
}

describe("development dashboard test account setup", () => {
  const passwords = {
    SUPPORTDESK_DEV_CUSTOMER_PASSWORD: "customer-test-password",
    SUPPORTDESK_DEV_AGENT_PASSWORD: "agent-test-password",
    SUPPORTDESK_DEV_ADMIN_PASSWORD: "admin-test-password",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates the three fixed role accounts with bcrypt hashes", async () => {
    const store = createStore();

    await createDevelopmentTestAccounts(passwords, store);

    expect(store.findExistingEmails).toHaveBeenCalledWith(
      developmentTestAccounts.map(({ email }) => email)
    );
    expect(hashMock).toHaveBeenCalledTimes(3);

    const created = (store.createAccounts as jest.Mock).mock.calls[0][0];
    expect(created).toEqual([
      {
        role: "customer",
        name: "SupportDesk Development Test Customer",
        email: "supportdesk.dev.customer.test2026@example.com",
        passwordHash: "hashed:customer-test-password",
      },
      {
        role: "agent",
        name: "SupportDesk Development Test Agent",
        email: "supportdesk.dev.agent.test2026@example.com",
        passwordHash: "hashed:agent-test-password",
      },
      {
        role: "admin",
        name: "SupportDesk Development Test Admin",
        email: "supportdesk.dev.admin.test2026@example.com",
        passwordHash: "hashed:admin-test-password",
      },
    ]);
  });

  test("refuses the whole setup if any account email already exists", async () => {
    const store = createStore(["supportdesk.dev.agent.test2026@example.com"]);

    await expect(
      createDevelopmentTestAccounts(passwords, store)
    ).rejects.toThrow("no accounts were changed");

    expect(hashMock).not.toHaveBeenCalled();
    expect(store.createAccounts).not.toHaveBeenCalled();
  });

  test("refuses missing or invalid-length passwords before database lookups", async () => {
    const missingPassword = {
      ...passwords,
      SUPPORTDESK_DEV_ADMIN_PASSWORD: undefined,
    };
    const store = createStore();

    await expect(
      createDevelopmentTestAccounts(missingPassword, store)
    ).rejects.toThrow("SUPPORTDESK_DEV_ADMIN_PASSWORD");
    expect(store.findExistingEmails).not.toHaveBeenCalled();

    await expect(
      createDevelopmentTestAccounts({
        ...passwords,
        SUPPORTDESK_DEV_CUSTOMER_PASSWORD: "short",
      }, store)
    ).rejects.toThrow("8 to 72 UTF-8 bytes");
    expect(store.findExistingEmails).not.toHaveBeenCalled();
  });
});
