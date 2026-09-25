import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lhkxoyrlxdozcmrhejuq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_K-UdDxlQvt1y7kYuhF4MCw_71MhuQ5f";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Consulta mínima: no inserta, modifica ni borra ningún registro.
    // Su única finalidad es generar actividad periódica en la base de datos.
    const { error } = await supabase
      .from("registros_limpieza")
      .select("id", { head: true, count: "exact" });

    // Aunque RLS impida leer la tabla sin sesión, la petición ya ha llegado a
    // Supabase. Devolvemos 200 para que Vercel no marque el cron como fallido.
    return Response.json({
      ok: true,
      supabaseReached: true,
      queryAllowed: !error,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "No se pudo contactar con Supabase" },
      { status: 500 }
    );
  }
}
