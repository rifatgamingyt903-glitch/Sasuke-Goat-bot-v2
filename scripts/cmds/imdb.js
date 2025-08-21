module.exports = {
  config: {
    name: "imdb",
    aliases: ["movieinfo"],
    version: "1.0",
    role: 0,
    author: "Mueid Mursalin Rifat",
    cooldowns: 5,
    shortdescription: "Get IMDb information about a movie or series",
    longdescription: "Fetches IMDb data for a movie or TV series using the provided API.",
    category: "info",
    usages: "{pn} imdb (movie or series name)",
    dependencies: {
      "axios": "",
    }
  },

  onStart: async ({ api, event }) => {
    const axios = require("axios");

    // Get the movie/series name from the input
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("🚨 Please provide a movie or series name. 🚨", event.threadID);
    }

    data.shift();
    const movieName = data.join(" ");

    try {
      // Fetch IMDb data using the provided API
      const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(movieName)}`);

      const {
        title,
        year,
        rating,
        ratings,
        plot,
        director,
        writer,
        actors,
        languages,
        country,
        awards,
        poster,
        imdburl
      } = res.data;

      // Construct the message with IMDb information
      const message = `
🎬 **Movie/Series Info** 🎬

❏ **Title**: ${title}
❏ **Year**: ${year}
❏ **Rating**: ${rating}/10 ⭐
❏ **Metascore**: ${ratings.find(item => item.source === "Metacritic")?.value || "N/A"} 🎯
❏ **IMDb Rating**: ${ratings.find(item => item.source === "Internet Movie Database")?.value || "N/A"} 📊
❏ **Rotten Tomatoes Rating**: ${ratings.find(item => item.source === "Rotten Tomatoes")?.value || "N/A"} 🍅
❏ **Plot**: ${plot}
❏ **Director**: ${director} 🎬
❏ **Writer**: ${writer} ✍️
❏ **Actors**: ${actors} 👥
❏ **Languages**: ${languages} 🌍
❏ **Country**: ${country} 🌎
❏ **Awards**: ${awards} 🏆
❏ **IMDB URL**: ${imdburl} 🔗

📸 **Poster**: ![Poster](${poster})

🔧 **API Powered By**: Mueid Mursalin Rifat ⚙️
      `;

      api.sendMessage(message, event.threadID);

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage("❌ Could not fetch data for the movie/series. Please try again later. ❌", event.threadID);
    }
  }
};
