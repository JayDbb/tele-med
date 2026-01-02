import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function POST(request: NextRequest) {
  const { userId, error } = await requireUser(request);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone number is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Build query to check for duplicates
    let query = supabase
      .from("patients")
      .select("id, full_name, email, phone, dob, created_at");

    // Check for email match if provided
    if (email && email.trim()) {
      query = query.or(`email.eq.${email.trim()}`);
    }

    // Fetch all patients to check for duplicates (we need to normalize phone numbers)
    const { data: allPatients, error: fetchError } = await supabase
      .from("patients")
      .select("id, full_name, email, phone, dob, created_at");

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 400 }
      );
    }

    // Normalize phone numbers for comparison (remove spaces, dashes, parentheses, dots)
    const normalizePhone = (phoneNum: string | null): string => {
      if (!phoneNum) return "";
      return phoneNum.replace(/[\s\-\(\)\.]/g, "").replace(/^\+1/, ""); // Remove +1 prefix if present
    };

    const normalizedInputPhone = phone ? normalizePhone(phone) : null;
    const normalizedInputEmail = email ? email.trim().toLowerCase() : null;

    // Filter for duplicates
    const duplicates = (allPatients || []).filter((p: any) => {
      // Check email match (case-insensitive)
      const emailMatch = normalizedInputEmail && p.email && 
        p.email.trim().toLowerCase() === normalizedInputEmail;
      
      // Check phone match (normalized)
      const phoneMatch = normalizedInputPhone && p.phone && 
        normalizePhone(p.phone) === normalizedInputPhone;

      return emailMatch || phoneMatch;
    });

    if (duplicates.length > 0) {
      return NextResponse.json({
        isDuplicate: true,
        patients: duplicates,
      });
    }

    return NextResponse.json({
      isDuplicate: false,
      patients: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to check for duplicates" },
      { status: 500 }
    );
  }
}

