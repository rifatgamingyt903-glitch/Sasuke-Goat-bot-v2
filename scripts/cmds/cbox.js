module.exports = {
  config: {
    name: "clear",
    aliases: ["cbox"],
    author: "Mueid Mursalin Rifat",
    version: "3.0",
    cooldowns: 5,
    role: 1,
    shortDescription: {
      en: "Clear bot messages"
    },
    longDescription: {
      en: "Unsend bot messages in the chat. Example: .clear 10"
    },
    category: "admin",
    guide: {
      en: "{p}{n} <number>\n\nExample:\n{p}{n} 10 → unsend last 10 bot messages"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const botID = api.getCurrentUserID();

    // Default = 20 if no number given
    let limit = 10;

    // If user gives a number (like .clear 10)
    if (args[0] && !isNaN(args[0])) {
      limit = parseInt(args[0]);
    }

    try {
      // Get chat history with that limit
      const history = await api.getThreadHistory(threadID, limit);

      // Filter messages sent by bot
      const botMessages = history.filter(msg => msg.senderID === botID);

      if (botMessages.length === 0) {
        return api.sendMessage("⚠️ No bot messages found to delete.", threadID);
      }

      // Unsend messages
      for (const msg of botMessages) {
        if (msg.messageID) {
          await api.unsendMessage(msg.messageID);
        }
      }

      api.sendMessage(`✅ Cleared ${botMessages.length} bot message(s).`, threadID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to clear messages.", threadID);
    }
  }
};
