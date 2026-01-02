import { supabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const supabaseServer = await supabaseServerClient();

  const { id } = await request.json();

  const { data, error } = await supabaseServer
    .from("links")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json({ details: data, message: "Link deleted successfully" });
}
