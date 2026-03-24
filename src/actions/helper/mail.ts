import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendRejectionEmail(
  email: string,
  name: string,
  reason: string,
  rejectLicense: boolean,
  rejectValidId: boolean,
) {
  // which docs are rejected
  const rejectedDocs = [];
  if (rejectLicense) rejectedDocs.push("Driver's License");
  if (rejectValidId) rejectedDocs.push("Secondary Valid ID");

  // email payload
  const mailOptions = {
    from: `"MC Ormoc Car Rental Support" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Action Required: Update on Your Account Verification",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; color: #334155;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-top: 0;">MC Ormoc Car Rental</h2>
      
      <p style="font-size: 16px;">Dear ${name},</p>
      
      <p style="font-size: 16px; line-height: 1.5;">Thank you for registering with MC Ormoc Car Rental. We are currently processing your account verification, but we encountered an issue with the documents you provided.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #991b1b;">Documents requiring your attention:</p>
        <ul style="color: #991b1b; margin: 0; padding-left: 20px;">
          ${rejectedDocs.map((doc) => `<li style="margin-bottom: 4px;">${doc}</li>`).join("")}
        </ul>
      </div>

      <p style="font-size: 16px; line-height: 1.5;"><strong>Message from our Review Team:</strong><br/>
      <span style="color: #475569;">${reason}</span></p>

      <p style="font-size: 16px; line-height: 1.5;">To proceed with your verification and start booking vehicles, please log in to your account and re-upload the requested documents.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documents" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Review & Update Documents</a>
      </div>
      
      <p style="font-size: 14px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        Best regards,<br/>
        <strong>The MC Ormoc Car Rental Team</strong>
      </p>
    </div>
  `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email: string, name: string) {
  const mailOptions = {
    from: `"MC Ormoc Car Rental" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Welcome! Your Account is Verified",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; color: #334155;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-top: 0;">MC Ormoc Car Rental</h2>
      
      <p style="font-size: 16px;">Dear ${name},</p>
      
      <p style="font-size: 16px; line-height: 1.5;">Great news! We have successfully reviewed and verified your identity documents.</p>
      
      <p style="font-size: 16px; line-height: 1.5;">Your account is now fully active. You have full access to our platform and can officially start booking your preferred vehicles from our fleet.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Book a Car Now</a>
      </div>
      
      <p style="font-size: 14px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        We look forward to serving you.<br/><br/>
        Best regards,<br/>
        <strong>The MC Ormoc Car Rental Team</strong>
      </p>
    </div>
  `,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendCustomEmail(
  email: string,
  name: string,
  subject: string,
  body: string,
) {
  const mailOptions = {
    from: `"MC Ormoc Car Rental Support" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: subject,
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; color: #334155;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-top: 0;">MC Ormoc Car Rental</h2>
      
      <p style="font-size: 16px;">Dear ${name},</p>
      
      <div style="font-size: 16px; line-height: 1.6; white-space: pre-wrap; margin: 24px 0; color: #334155;">${body}</div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #f1f5f9; color: #334155; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; border: 1px solid #cbd5e1;">Visit Your Account</a>
      </div>

      <p style="font-size: 14px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        Best regards,<br/>
        <strong>The MC Ormoc Car Rental Team</strong>
      </p>
    </div>
  `,
  };
  await transporter.sendMail(mailOptions);
}
