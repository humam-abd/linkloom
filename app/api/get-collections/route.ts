import supabase from "@/supabase.config";

export async function GET(request: Request) {
  const { userId } = await request.json();

  const collections = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId);
  return Response.json(collections.data);
}
