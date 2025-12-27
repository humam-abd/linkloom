import { supabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabaseServer = await supabaseServerClient();

  const { data, error } = await supabaseServer.auth.getSession();

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json(data);
}
