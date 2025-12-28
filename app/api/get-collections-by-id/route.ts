import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { id } = await request.json();
  const supabaseServer = await supabaseServerClient();

  const collections = await supabaseServer
    .from("collections")
    .select("*")
    .eq("id", id);
  return Response.json(collections.data);
}
