import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabaseServer = await supabaseServerClient();

  const { url, description, image, collection_id, position, user_id } =
    await request.json();

  const { data, error } = await supabaseServer
    .from("links")
    .insert({
      url,
      description,
      image,
      collection_id,
      position,
      user_id,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json(data);
}
