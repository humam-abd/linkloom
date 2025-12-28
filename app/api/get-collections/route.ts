import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { userId } = await request.json();
  const supabaseServer = await supabaseServerClient();

  const collections = await supabaseServer
    .from("collections")
    .select("*")
    .eq("user_id", userId);
  return Response.json(collections.data);
}
