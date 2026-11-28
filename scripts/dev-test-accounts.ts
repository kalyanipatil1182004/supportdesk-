import bcrypt from "bcrypt";

export const developmentTestAccounts = [
  {
    role: "customer",
    name: "SupportDesk Development Test Customer",
    email: "supportdesk.dev.customer.test2026@example.com",
    passwordVariable: "SUPPORTDESK_DEV_CUSTOMER_PASSWORD",
  },
  {
    role: "agent",
    name: "SupportDesk Development Test Agent",
    email: "supportdesk.dev.agent.test2026@example.com",
    passwordVariable: "SUPPORTDESK_DEV_AGENT_PASSWORD",
  },
  {
    role: "admin",
    name: "SupportDesk Development Test Admin",
    email: "supportdesk.dev.admin.test2026@example.com",
    passwordVariable: "SUPPORTDESK_DEV_ADMIN_PASSWORD",
  },
] as const;

export type DevelopmentTestAccountInput = {
  role: (typeof developmentTestAccounts)[number]["role"];
  name: string;
  email: string;
  password: string;
};

export interface DevelopmentTestAccountStore {
  findExistingEmails(emails: string[]): Promise<string[]>;
  createAccounts(
    accounts: Array<Omit<DevelopmentTestAccountInput, "password"> & {
      passwordHash: string;
    }>
  ): Promise<void>;
}

export async function createDevelopmentTestAccounts(
  passwords: Record<
    (typeof developmentTestAccounts)[number]["passwordVariable"],
    string | undefined
  >,
  store: DevelopmentTestAccountStore
): Promise<void> {
  const accounts = developmentTestAccounts.map((account) => {
    const password = passwords[account.passwordVariable];
    if (!password) {
      throw new Error(`Missing ${account.passwordVariable}.`);
    }

    const passwordBytes = Buffer.byteLength(password, "utf8");
    if (passwordBytes < 8 || passwordBytes > 72) {
      throw new Error(
        `${account.passwordVariable} must be 8 to 72 UTF-8 bytes.`
      );
    }

    const { passwordVariable: _passwordVariable, ...accountData } = account;
    return { ...accountData, password };
  });

  const existingEmails = await store.findExistingEmails(
    accounts.map(({ email }) => email)
  );
  if (existingEmails.length > 0) {
    throw new Error(
      "At least one requested test email already exists; no accounts were changed."
    );
  }

  const hashedAccounts = await Promise.all(
    accounts.map(async ({ password, ...account }) => ({
      ...account,
      passwordHash: await bcrypt.hash(password, 12),
    }))
  );

  await store.createAccounts(hashedAccounts);
}
