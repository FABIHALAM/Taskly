const nodemailer = require('nodemailer')

/**
 * Creates nodemailer transporter.
 * Uses environment variables EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.
 * If credentials are not set, falls back to non-blocking simulation logging.
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = Number(process.env.EMAIL_PORT) || 587
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    return null // Return null if SMTP credentials not configured
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

/**
 * Sends automated email notification when a task is assigned to a user.
 * @param {Object} params
 * @param {string} params.to - Recipient user email
 * @param {string} params.assigneeName - Member name
 * @param {string} params.managerName - Manager name who assigned the task
 * @param {string} params.taskTitle - Title of the task
 * @param {string} params.projectName - Project name
 * @param {string} params.priority - Task priority (Low, Medium, High)
 * @param {string} [params.dueDate] - Optional task due date
 * @param {string} [params.taskUrl] - Direct task URL link
 */
const sendTaskAssignedEmail = async ({
  to,
  assigneeName,
  managerName,
  taskTitle,
  projectName,
  priority,
  dueDate,
  taskUrl,
}) => {
  try {
    const transporter = createTransporter()

    const subject = `[Taskly] 📌 New Task Assigned: "${taskTitle}"`
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date set'

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0c0d14; color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #131522; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 28px; }
          .greeting { font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
          .message { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
          .card { background: #1a1c2e; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; p-16px; padding: 20px; margin-bottom: 24px; }
          .task-title { font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          .meta-item { font-size: 13px; color: #cbd5e1; margin-bottom: 8px; display: flex; justify-content: space-between; }
          .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; }
          .pill { background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 3px 10px; border-radius: 999px; font-weight: 700; font-size: 11px; }
          .btn { display: inline-block; background: #6366f1; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 10px; text-align: center; }
          .footer { padding: 20px 28px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Taskly Workspace Notification</h1>
          </div>
          <div class="content">
            <div class="greeting">Hi ${assigneeName || 'there'},</div>
            <div class="message">
              Manager <strong>${managerName || 'Your Project Manager'}</strong> has assigned a new task to you in project <strong>${projectName || 'Workspace'}</strong>.
            </div>

            <div class="card">
              <div class="task-title">📌 ${taskTitle}</div>
              <div class="meta-item">
                <span class="meta-label">Project</span>
                <span style="font-weight:600; color:#ffffff;">${projectName || 'General'}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Priority</span>
                <span class="pill">${priority || 'Medium'}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Due Date</span>
                <span style="color:#f43f5e; font-weight:600;">${formattedDueDate}</span>
              </div>
            </div>

            ${taskUrl ? `<div style="text-align:center;"><a href="${taskUrl}" class="btn">Open Task in Taskly &rarr;</a></div>` : ''}
          </div>
          <div class="footer">
            Sent automatically by Taskly Workspace System • Do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `

    if (!transporter) {
      console.log(`\n📧 [EMAIL SIMULATION] Sending Email to ${to}:`)
      console.log(`   Subject: ${subject}`)
      console.log(`   Manager: ${managerName} | Task: "${taskTitle}" | Due: ${formattedDueDate}\n`)
      return { success: true, simulated: true }
    }

    const info = await transporter.sendMail({
      from: `"Taskly Workspace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlBody,
    })

    console.log(`📧 [EMAIL SENT] MessageId: ${info.messageId} to ${to}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email dispatch error:', error.message)
    return { success: false, error: error.message }
  }
}

module.exports = { sendTaskAssignedEmail }
