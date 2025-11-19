/**
 * auth.service.ts
 * - Contains server-side auth helpers that interact with Supabase admin APIs.
 * - Functions here will be called from auth.controller.ts
 * - Do not implement logic here in the scaffold; provide signatures + comments only.
 */

/**
 * createUser
 * - Use Supabase Admin to create a user with email + password
 */
export async function createUser(email: string, password: string): Promise<unknown> {
  // TODO: implement Supabase admin create user and return created user object
  throw new Error("createUser not implemented");
}

/**
 * signInUser
 * - Validate credentials and return a session or token representation
 */
export async function signInUser(email: string, password: string): Promise<unknown> {
  // TODO: implement sign-in/token exchange
  throw new Error("signInUser not implemented");
}
