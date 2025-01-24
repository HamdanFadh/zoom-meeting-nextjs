// pages/api/zoom.js
import axios from "axios";

const zoomAccounts = [
  {
    clientId: process.env.ZOOM_CLIENT_ID_1,
    clientSecret: process.env.ZOOM_CLIENT_SECRET_1,
    accountId: process.env.ZOOM_ACCOUNT_ID_1,
  },
//   {
//     clientId: process.env.ZOOM_CLIENT_ID_2,
//     clientSecret: process.env.ZOOM_CLIENT_SECRET_2,
//     accountId: process.env.ZOOM_ACCOUNT_ID_2,
//   },
//   {
//     clientId: process.env.ZOOM_CLIENT_ID_3,
//     clientSecret: process.env.ZOOM_CLIENT_SECRET_3,
//     accountId: process.env.ZOOM_ACCOUNT_ID_3,
//   },
];

// Function to get an OAuth token for a specific account
async function getZoomAccessToken(clientId, clientSecret, accountId) {
  const tokenUrl = `https://zoom.us/oauth/token`;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      tokenUrl,
      `grant_type=account_credentials&account_id=${accountId}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get access token:", error.response?.data || error.message);
    throw new Error(`Could not retrieve Zoom access token for account ${accountId}`);
  }
}

// Function to fetch meetings for an account
async function fetchMeetingsForAccount(accessToken) {
  try {
    const response = await axios.get("https://api.zoom.us/v2/users/me/meetings", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.meetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.topic.includes("Mentoring") ? meeting.topic : "Booked", // Conditional title
        start: meeting.start_time,
        end: meeting.end_time, // Assuming 'end_time' is available in the API response
        duration: meeting.duration,
        joinUrl: meeting.join_url,
      }));
  } catch (error) {
    console.error("Failed to fetch meetings:", error.response?.data || error.message);
    throw new Error("Could not retrieve Zoom meetings.");
  }
}

export default async function handler(req, res) {
  try {
    const allMeetings = [];

    for (const account of zoomAccounts) {
      const accessToken = await getZoomAccessToken(
        account.clientId,
        account.clientSecret,
        account.accountId
      );

      const meetings = await fetchMeetingsForAccount(accessToken);

      allMeetings.push(...meetings);
    }

    res.status(200).json(allMeetings);
  } catch (error) {
    console.error("Error in handler:", error.message);
    res.status(500).json({ error: error.message });
  }
}
