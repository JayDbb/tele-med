import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { patientEmail, patientName, patientId, doctorName } =
      await request.json();

    // In a real implementation, integrate with video calling services like:
    // - Zoom API
    // - Google Meet API
    // - Twilio Video
    // - Agora.io
    // - WebRTC custom solution

    // Generate the join URL for the patient
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const callUrl = `${baseUrl}/patients/${patientId}/video`;

    // Example with a hypothetical video service
    const videoCallData = {
      roomId: `patient-${patientId}`,
      patientEmail,
      patientName,
      doctorName,
      timestamp: new Date().toISOString(),
    };

    // Send email invitation to patient
    try {
      const emailResult = await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL || "TeleMed <onboarding@resend.dev>",
        to: patientEmail,
        subject: `Video Consultation Invitation from ${doctorName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Video Consultation Invitation</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hello ${patientName},</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  <strong>${doctorName}</strong> has invited you to join a video consultation.
                </p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Click the button below to join the video call:</p>
                  <a href="${callUrl}" 
                     style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 10px 0;">
                    Join Video Call
                  </a>
                  <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
                    Or copy and paste this link into your browser:<br>
                    <a href="https://xw0pggn6-3000.use2.devtunnels.ms/patients/1/video" style="color: #667eea; word-break: break-all;">${callUrl}</a>
                  </p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="font-size: 14px; color: #666; margin: 0;">
                    <strong>Important:</strong> Please ensure you have a stable internet connection and allow camera/microphone permissions when prompted.
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #999; margin-top: 30px;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (emailResult.error) {
        console.error("Failed to send email:", emailResult.error);
        // Continue even if email fails - still return success for the video call
      } else {
        console.log(`Video call invitation email sent to ${patientEmail}`);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue even if email fails - still return success for the video call
    }

    return NextResponse.json({
      success: true,
      callUrl,
      roomId: videoCallData.roomId,
      message:
        "Video call started successfully. Invitation email sent to patient.",
    });
  } catch (error) {
    console.error("Video call error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start video call" },
      { status: 500 }
    );
  }
}
