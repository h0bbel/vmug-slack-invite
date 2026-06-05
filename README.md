# Slack Invite Notification — Setup Guide

## How it works

1. Person fills out your WordPress form
2. A notification appears in your admin Slack channel with their name and email (easy to copy)
3. You open Slack → Invite People → paste the email → done in ~20 seconds

---

## Step 1: Create a Slack App

1. Go to https://api.slack.com/apps → **Create New App** → **From scratch**
2. Name it something like "Invite Bot", select your workspace
3. Go to **OAuth & Permissions** in the left sidebar
4. Under **Bot Token Scopes**, add:
   - `chat:write` — to post messages
   - `chat:write.public` — to post in channels without joining first
5. Click **Install to Workspace** at the top → Authorize
6. Copy the **Bot User OAuth Token** (starts with `xoxb-`) — you'll need this later

---

## Step 2: Get Your Admin Channel ID

1. In Slack, right-click your admin channel name → **View channel details**
2. Scroll to the bottom — copy the **Channel ID** (looks like `C0123456789`)

Also make sure to invite your bot to the channel:
- In the admin channel, type `/invite @YourBotName`

---

## Step 3: Deploy to Netlify

1. Create a free account at https://netlify.com
2. Drag and drop the project folder onto Netlify's deploy page
   *(or connect a GitHub repo)*
3. Go to **Project configuration → Environment variables** and add:

   | Variable | Value |
   |---|---|
   | `SLACK_BOT_TOKEN` | `xoxb-...` (from Step 1) |
   | `SLACK_ADMIN_CHANNEL_ID` | `C0123456789` (from Step 2) |

4. Your function URL will be:
   ```
   https://YOUR-SITE.netlify.app/.netlify/functions/signup
   ```

---

## Step 4: Wire up your WordPress form

Point your form to POST to the function URL above. The function expects:
- `email` — required
- `name` or `first_name` — optional

**By form plugin:**

- **WPForms** — use the free "WP Webhooks" plugin, set webhook URL to your function URL
- **Gravity Forms** — Webhooks addon (included in most licenses) → form settings → Webhooks
- **Fluent Forms** — built-in webhook under form settings → Integrations → Webhook
- **Contact Form 7** — use the free "CF7 to Webhook" plugin

---

## What the Slack notification looks like

> 👋 **New signup request**
> **Name:** Jane Doe
> **Email:** `jane@example.com`
>
> *To invite: open Slack → click workspace name → Invite people → paste the email above*

The email is in a code block so it's easy to tap/click to copy.

---

## Troubleshooting

**No message appearing in Slack?**
- Check Netlify function logs under Functions → signup
- Make sure the bot is invited to your admin channel (`/invite @BotName`)
- Double-check the Channel ID is correct (it's the ID, not the channel name)

**"channel_not_found" error?**
- The bot isn't in the channel — run `/invite @YourBotName` in the channel

**Form not triggering the function?**
- Test the endpoint directly with a tool like Postman or hoppscotch.io
- Send a POST to your function URL with body: `{"email":"test@example.com","name":"Test User"}`
