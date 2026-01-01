import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) return NextResponse.json({ error }, { status: 401 });

  try {
    const { visit_id, cache_id, path } = await req.json();
    if (!visit_id) return NextResponse.json({ error: 'Missing visit_id' }, { status: 400 });

    const supabase = supabaseServer();

    let usePath = path;
    if (!usePath && cache_id) {
      const { data: cacheRow, error: getErr } = await supabase.rpc('get_cache_entry', { _cache_id: cache_id });
      if (getErr || !cacheRow || !cacheRow[0]) {
        return NextResponse.json({ error: 'Cache entry not found' }, { status: 400 });
      }
      usePath = cacheRow[0].path;
    }

    if (!usePath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

    // Enqueue the transcription job using the SQL SECURITY DEFINER helper
    const { data: jobData, error: jobErr } = await supabase.rpc('enqueue_transcription_job', { _visit_id: visit_id, _path: usePath, _cache_id: cache_id ?? null });
    if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 });

    return NextResponse.json({ job: jobData });
  } catch (err) {
    console.error('Error in /api/transcribe/enqueue POST:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
