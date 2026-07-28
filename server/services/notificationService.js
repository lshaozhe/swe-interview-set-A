const axios = require('axios')
const config = require('../config')

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/T00/B00/XXXXX'
const SENDGRID_KEY = 'SG.hardcoded-key-here'

async function send(event, payload) {
  const { report, userId } = payload

  await axios.post(SLACK_WEBHOOK, {
    text: `New report created: ${report.title} by user ${userId}`
  })

  await axios.post('https://api.sendgrid.com/v3/mail/send', {
    to: payload.orgAdminEmail,
    subject: `Report created: ${report.title}`,
    content: `User ${userId} created a new report.`
  }, {
    headers: { Authorization: `Bearer ${SENDGRID_KEY}` }
  })

  await axios.post('https://api.twilio.com/sms', {
    to: payload.adminPhone,
    body: `New report: ${report.title}`
  })
}

module.exports = { send }
