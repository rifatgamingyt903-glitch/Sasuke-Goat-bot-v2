const axios = require("axios");

const baseApiUrl = async () => {
  return "https://www.noobs-api.rf.gd/dipto";
};

module.exports = {
  config: {
    name: "bby_auto",
    version: "1.0.0",
    author: "dipto",
    countDown: 0,
    role: 0,
    category: "auto",
    shortDescription: "Auto reply to all messages",
    longDescription: "Replies to every message via API"
  },

  onChat: async function ({ api, event, message }) {
    try {
      const body = event.body ? event.body : "";
      if (!body) return;  // যদি message খালি হয়, কিছু না করা

      // API কল করার URL
      const apiUrl = `${await baseApiUrl()}/baby?text=${encodeURIComponent(body)}&senderID=${event.senderID}&font=1`;
      const response = await axios.get(apiUrl);
      const replyText = response.data.reply;

      await api.sendMessage(replyText, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }, event.messageID);

    } catch (err) {
      return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event }) {
    try {
      const apiUrl = `${await baseApiUrl()}/baby?text=${encodeURIComponent(
        event.body
      )}&senderID=${event.senderID}&font=1`;
      const response = await axios.get(apiUrl);
      const replyText = response.data.reply;

      await api.sendMessage(replyText, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID
        });
      }, event.messageID);
    } catch (err) {
      return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
