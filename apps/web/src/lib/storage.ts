import { supabaseBrowser } from "./supabaseBrowser";
import { createSignedUploadUrl } from "./api";

/**
 * Uploads a file to a private Supabase bucket using a signed URL scoped to the user.
 * Returns the storage path of the uploaded object.
 */
export async function uploadToPrivateBucket(file: File) {
  const contentType = file.type || "application/octet-stream";
  const { path, token, bucket } = await createSignedUploadUrl({
    filename: file.name,
    contentType
  });

  const supabase = supabaseBrowser();
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType });

  if (error) throw new Error(error.message);
  return { path, bucket };
}

