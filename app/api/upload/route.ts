import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) {
    return NextResponse.json(
      { error: "Missing STORAGE_BUCKET env" },
      { status: 500 }
    );
  }

  const { filename, contentType } = await req.json();
  const ext = filename?.includes(".")
    ? filename.split(".").pop()
    : (contentType?.split("/").pop() || "bin");

  const objectPath = `clinician/${userId}/${Date.now()}-${crypto
    .randomUUID()
    .slice(0, 8)}.${ext}`;

  const supabase = supabaseServer();
  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath, { upsert: false });

  if (signError || !data) {
    return NextResponse.json(
      { error: signError?.message || "Failed to create signed upload URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    path: objectPath,
    signedUrl: data.signedUrl,
    token: data.token,
    bucket
  });
}

