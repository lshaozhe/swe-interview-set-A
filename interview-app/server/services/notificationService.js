const axios = require('axios')
const config = require('../config')

// [SA-T3] Tight coupling — this service directly calls Email, Slack, and SMS
//         in a single synchronous function. Problems:
//
//         1. A Slack API outage causes report creation to fail entirely.
//         2. Adding a new notification channel (e.g. Teams) requires editing
//            this file and redeploying.
//         3. No retry logic — a transient failure silently drops notifications.
//         4. Notification delivery is on the critical path of report creation.
//
//         Should publish an event to a queue (e.g. SQS, BullMQ) and have
//         separate consumers handle each channel independently.

const SLACK_WEBHOOK = 'https://hooks.slack.com/services/T00/B00/XXXXX'
const SENDGRID_KEY = 'SG.hardcoded-key-here'   // also a DSO-T1 issue

async function send(event, payload) {
  const { report, userId } = payload

  // Direct Slack call — outage here breaks report creation
  await axios.post(SLACK_WEBHOOK, {
    text: `New report created: ${report.title} by user ${userId}`
  })

  // Direct email call — another external dependency on the critical path
  await axios.post('https://api.sendgrid.com/v3/mail/send', {
    to: payload.orgAdminEmail,
    subject: `Report created: ${report.title}`,
    content: `User ${userId} created a new report.`
  }, {
    headers: { Authorization: `Bearer ${SENDGRID_KEY}` }
  })

  // Direct SMS call
  await axios.post('https://api.twilio.com/sms', {
    to: payload.adminPhone,
    body: `New report: ${report.title}`
  })
}

module.exports = { send }
