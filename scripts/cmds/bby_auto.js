const axios = require("axios");

module.exports = {
  config: {
    name: "bby_auto",
    aliases: [],
    version: "1.1",
    author: "Fahad x GPT",
    countDown: 0,
    role: 0,
    shortDescription: "Auto reply with typing effect",
    longDescription: "Replies to every message with a small typing delay",
    category: "no prefix"
  },

  onStart: async function ({ message, event, api }) {
    try {
      const text = event.body;
      if (!text) return;

      // Simulate typing effect
      api.sendTypingIndicator(event.threadID);

      // Small delay (1.5 seconds)
      await new Promise(res => setTimeout(res, 1500));

      // Fetch AI reply
      const apiUrl = `https://www.noobs-api.rf.gd/dipto/baby?text=${encodeURIComponent(text)}&senderID=${event.senderID}&font=1`;
      const response = await axios.get(apiUrl);

      const reply = response?.data?.reply || "😅 Sorry, ami kichu bujhte parlam na.";

      message.reply(reply);
    } catch (err) {
      console.error(err);
      message.reply("❌ Error: " + err.message);
    }
  }
};
