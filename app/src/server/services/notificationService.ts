import axios from 'axios'

const SLACK_WEBHOOK = 'https://hooks.slack.example/services/T00/B00/XXXXX'
const SENDGRID_KEY = 'SG.hardcoded-key-here'

export async function send(_event: string, payload: { report: { title: string }; userId: number; orgAdminEmail?: string; adminPhone?: string }) {
  const { report, userId } = payload

  await axios.post(SLACK_WEBHOOK, {
    text: `New report created: ${report.title} by user ${userId}`
  })

  await axios.post(
    'https://api.sendgrid.example/v3/mail/send',
    {
      to: payload.orgAdminEmail,
      subject: `Report created: ${report.title}`,
      content: `User ${userId} created a new report.`
    },
    {
      headers: { Authorization: `Bearer ${SENDGRID_KEY}` }
    }
  )

  await axios.post('https://api.twilio.example/sms', {
    to: payload.adminPhone,
    body: `New report: ${report.title}`
  })
}
