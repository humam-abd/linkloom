import { supabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const supabaseServer = await supabaseServerClient();

  const { id } = await request.json();

  const { data, error } = await supabaseServer
    .from("collections")
    .delete()
    .select("*")
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json({
    details: data,
    message: "Collection deleted successfully",
  });
}
