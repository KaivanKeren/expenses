import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Type assertions to ensure these values are not undefined
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

// Alternatively, you can throw an error if any are undefined
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !JWT_SECRET) {
  throw new Error("Missing environment variables");
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

const createToken = (user: { id: any; email: any }) => {
  return jwt.sign({ user_id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

const authenticate = async (
  c: {
    req: {
      headers: { get: (arg0: string) => any };
      user: string | jwt.JwtPayload;
    };
    json: (arg0: { error: string }, arg1: number) => any;
  },
  next: () => any
) => {
  const authHeader = c.req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.req.user = decoded;
    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

export const authRoute = new Hono()
  .post("/register", zValidator("json", userSchema), async (c) => {
    const { username, email, password } = await c.req.valid("json");
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const { data: existingUser, error: userError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (existingUser) {
      return c.json({ error: "User already exists" }, 409);
    }
    const { data: user, error } = await supabaseClient
      .from("users")
      .insert([{ username, email, password: hashedPassword }])
      .select("*")
      .single();
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    const token = createToken(user);
    return c.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  })
  .post(
    "/login",
    zValidator("json", userSchema.omit({ username: true })),
    async (c) => {
      const { email, password } = await c.req.valid("json");
      const { data: user, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      if (error || !user) {
        return c.json({ error: "Invalid email or password" }, 401);
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return c.json({ error: "Invalid email or password" }, 401);
      }
      const token = createToken(user);
      return c.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    }
  )
  .post("/logout", async (c) => {
    return c.json({ message: "Logged out" });
  });
