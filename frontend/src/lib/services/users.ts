import "server-only";
import { apiFetch } from "@/lib/api/http";
import type { Paginated, Role, User, UserDetails, UserQuery } from "@/lib/api/types";

export async function listUsers(query: UserQuery = {}): Promise<Paginated<User>> {
  const res = await apiFetch<{ users: Paginated<User> }>("/users", { query });
  return res.users;
}

export async function getUser(id: number | string): Promise<UserDetails> {
  const res = await apiFetch<{ user: UserDetails }>(`/users/${encodeURIComponent(String(id))}`);
  return res.user;
}

export async function listRoles(): Promise<Role[]> {
  const res = await apiFetch<{ roles: Role[] }>("/roles");
  return res.roles;
}
