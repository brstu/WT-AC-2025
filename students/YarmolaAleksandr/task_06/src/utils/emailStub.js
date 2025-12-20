/**
 * Email Stub - Mock email sending for development/testing
 * In production, replace with real email service (Nodemailer, SendGrid, etc.)
 */

const sentEmails = []; // Store sent emails in memory for testing

/**
 * Send password reset email (STUB)
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Email details
 */
async function sendPasswordResetEmail(to, resetToken, userName = 'User') {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const emailContent = {
    to,
    subject: 'Password Reset Request - Food Diary',
    text: `
Hello ${userName},

You requested a password reset for your Food Diary account.

Click the link below to reset your password (valid for 1 hour):
${resetUrl}

If you didn't request this, please ignore this email.

Best regards,
Food Diary Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #4CAF50; 
      color: white; 
      text-decoration: none; 
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello ${userName},</p>
    <p>You requested a password reset for your Food Diary account.</p>
    <p>Click the button below to reset your password (valid for 1 hour):</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <div class="footer">
      <p>Best regards,<br>Food Diary Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    sentAt: new Date().toISOString(),
  };

  // Store email for testing/debugging
  sentEmails.push(emailContent);

  // Log email in development mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n=== EMAIL STUB ===');
    console.log('To:', to);
    console.log('Subject:', emailContent.subject);
    console.log('Reset URL:', resetUrl);
    console.log('Reset Token:', resetToken);
    console.log('==================\n');
  }

  return {
    success: true,
    message: 'Email sent successfully (STUB)',
    resetUrl, // Include in response for testing purposes
  };
}

/**
 * Get all sent emails (for testing)
 * @returns {Array} Array of sent emails
 */
function getSentEmails() {
  return sentEmails;
}

/**
 * Clear sent emails (for testing)
 */
function clearSentEmails() {
  sentEmails.length = 0;
}

/**
 * Get last sent email (for testing)
 * @returns {Object|null} Last sent email or null
 */
function getLastSentEmail() {
  return sentEmails.length > 0 ? sentEmails[sentEmails.length - 1] : null;
}

module.exports = {
  sendPasswordResetEmail,
  getSentEmails,
  clearSentEmails,
  getLastSentEmail,
};
