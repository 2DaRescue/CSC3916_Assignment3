const axios = require('axios');
const crypto = require('crypto');

async function trackReviewGA4(movieTitle, genre, userId = null) {
  try {
    const payload = {
      client_id: crypto.randomUUID(),
      user_id: userId || undefined, // optional user tracking
      events: [
        {
          name: "review_posted",
          params: {
            movie_title: movieTitle,
            genre: genre,
            api_route: "/reviews",
            label: "API Request for Movie Review",
            value: 1,
            debug_mode: true // remove in production
          }
        }
      ]
    };

    await axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
      payload
    );

    console.log("✅ GA4 event sent for:", movieTitle);
  } catch (err) {
    console.error("❌ Failed to send GA4 event:", err.message);
  }
}

module.exports = trackReviewGA4;
