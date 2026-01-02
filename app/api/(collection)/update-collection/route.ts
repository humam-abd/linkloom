import { supabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const { name, description, is_public, id } = await request.json();

  const supabaseServer = await supabaseServerClient();

  const { data, error } = await supabaseServer
    .from("collections")
    .update({
      name,
      description,
      is_public,
    })
    .eq("id", id)
    .select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json(data);
}
