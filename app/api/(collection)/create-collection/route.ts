import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { name, description, is_public, user_id } = await request.json();

  const supabaseServer = await supabaseServerClient();

  const { data, error } = await supabaseServer
    .from("collections")
    .insert({
      name,
      description,
      is_public,
      user_id,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json(data);
}
