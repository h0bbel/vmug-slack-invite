// netlify/functions/signup.js
// Receives form submission from WordPress and posts a notification to your admin Slack channel

exports.handler = async (event) => {
  console.log("Function triggered");
  console.log("Method:", event.httpMethod);
  console.log("Content-Type:", event.headers["content-type"]);
  console.log("Body:", event.body);

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let email, name;
  const contentType = event.headers["content-type"] || "";

  try {
    if (contentType.includes("application/json")) {
      const body = JSON.parse(event.body);
      console.log("Parsed JSON body:", JSON.stringify(body));
      // Jetpack sends email as a prefixed field like "g366-email", so search by key suffix
      const emailKey = Object.keys(body).find(k => k === 'email' || k === 'Email' || k.endsWith('-email'));
      const nameKey = Object.keys(body).find(k => k === 'name' || k === 'Navn' || k === 'first_name' || k.endsWith('-name'));
      email = emailKey ? body[emailKey] : undefined;
      name = nameKey ? body[nameKey] : "";
    } else {
      const params = new URLSearchParams(event.body);
      console.log("Parsed form params:", Object.fromEntries(params));
      email = params.get("Email") || params.get("email");
      name = params.get("Navn") || params.get("name") || params.get("first_name") || "";
    }
  } catch (err) {
    console.error("Parse error:", err.message);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  console.log("Extracted email:", email);
  console.log("Extracted name:", name);

  if (!email) {
    console.error("No email found in request");
    return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
  }

  const slackMessage = {
    channel: process.env.SLACK_ADMIN_CHANNEL_ID,
    text: `New signup from ${name || "someone"} — invite them to Slack: ${email}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:wave: *New signup request*\n*Name:* ${name || "_not provided_"}\n*Email:* \`${email}\``
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `To invite: open Slack → click workspace name → *Invite people* → paste the email above`
          }
        ]
      }
    ]
  };

  console.log("Posting to Slack channel:", process.env.SLACK_ADMIN_CHANNEL_ID);

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify(slackMessage)
  });

  const data = await response.json();
  console.log("Slack API response:", JSON.stringify(data));

  if (!data.ok) {
    console.error("Slack error:", data.error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to post to Slack", slack_error: data.error }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: "Notification sent to admin channel" })
  };
};
