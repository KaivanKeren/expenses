import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(100),
  amount: z.number().int().positive(),
  user_id: z.string().uuid(),
});

const createPostSchema = expenseSchema.omit({ id: true });
const updatePutSchema = expenseSchema;

export const expensesRoute = new Hono()
  .get("/", async (c) => {
    const { data: expenses, error } = await supabaseClient
      .from("expenses")
      .select("*");

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({ expenses });
  })
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const expense = await c.req.valid("json");
    const { data, error } = await supabaseClient
      .from("expenses")
      .insert([expense])
      .select("*")
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    c.status(201);
    return c.json(data);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const { data: expense, error } = await supabaseClient
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    if (!expense) {
      return c.notFound();
    }

    return c.json({ expense });
  })
  .put("/:id", zValidator("json", updatePutSchema), async (c) => {
    const id = c.req.param("id");
    const updatedExpense = await c.req.valid("json");

    const { data, error } = await supabaseClient
      .from("expenses")
      .update(updatedExpense)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    if (!data) {
      return c.notFound();
    }

    return c.json({ expense: data });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const { data, error } = await supabaseClient
      .from("expenses")
      .delete()
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    if (!data) {
      return c.notFound();
    }

    return c.json({ expense: data });
  });
