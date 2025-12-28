import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { userId } = await request.json();
  const supabaseServer = await supabaseServerClient();

  const collections = await supabaseServer
    .from("collections")
    .select("*")
    .eq("user_id", userId);

  const links = await supabaseServer
    .from("links")
    .select("*")
    .in(
      "collection_id",
      collections.data.map((c) => c.id)
    );

  const collectionData = collections.data.map((c) => {
    const linksData = links.data.filter((l) => l.collection_id === c.id);
    return {
      ...c,
      items: linksData,
    };
  });

  return Response.json(collectionData);
}
