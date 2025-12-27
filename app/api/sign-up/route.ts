import { supabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabaseServer = await supabaseServerClient();

  const { email, password } = await request.json();

  const { data, error } = await supabaseServer.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message === "User already registered") {
      const { data: loginResponse, error: loginError } =
        await supabaseServer.auth.signInWithPassword({
          email,
          password,
        });
      if (loginError) {
        return Response.json({ error: loginError.message }, { status: 401 });
      }
      return Response.json(loginResponse);
    }
    return Response.json({ error: error.message }, { status: 401 });
  }

  return Response.json(data);
}
