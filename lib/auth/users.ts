import { compare, hash } from "bcryptjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
}

const DATA_DIR = join(process.cwd(), "data");
const USERS_FILE = join(DATA_DIR, "users.json");

function readUsers(): User[] {
  if (!existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(USERS_FILE, "utf8")) as User[];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("An account with this email already exists.");

  const passwordHash = await hash(password, 10);
  const user: User = {
    id: `user_${Date.now().toString(36)}`,
    email: email.toLowerCase().trim(),
    passwordHash,
    name,
    createdAt: new Date().toISOString(),
  };

  const users = readUsers();
  users.push(user);
  writeUsers(users);
  return user;
}

export async function validatePassword(
  user: User,
  password: string
): Promise<boolean> {
  return compare(password, user.passwordHash);
}
