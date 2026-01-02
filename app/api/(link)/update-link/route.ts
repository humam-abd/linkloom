import { supabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabaseServer = await supabaseServerClient();

  const { url, description, image, position, id } = await request.json();

  const { data, error } = await supabaseServer
    .from("links")
    .update({
      url,
      description,
      image,
      position,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json(data);
}
