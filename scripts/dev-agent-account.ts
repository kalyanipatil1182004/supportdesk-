import bcrypt from "bcrypt";

export interface DevAgentUserStore {
  findRoleByEmail(email: string): Promise<{ role: string } | null>;
  createAgent(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: "agent";
  }): Promise<void>;
}

export async function createDevAgentAccount(
  email: string,
  password: string,
  users: DevAgentUserStore
): Promise<"created" | "already-exists"> {
  const existing = await users.findRoleByEmail(email);

  if (existing) {
    if (existing.role === "agent") {
      return "already-exists";
    }

    throw new Error(
      "An account with the requested email already exists with a different role."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await users.createAgent({
    name: "SupportDesk Development Agent",
    email,
    passwordHash,
    role: "agent",
  });

  return "created";
}
