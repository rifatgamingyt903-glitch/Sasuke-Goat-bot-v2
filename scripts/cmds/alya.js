const axios = require("axios");

const obfuscatedAuthor = String.fromCharCode(65, 110, 116, 104, 111, 110, 121);

module.exports = {
  config: {
    name: "elisa",
    aliases: ["alya", "janvi"],
    version: "1.0",
    author: "Anthony",
    countDown: 5,
    role: 0,
    description: {
      vi: "Tự động tải video và chat AI",
      en: "Auto video download and chat assistant"
    },
    category: "AI",
    guide: {
      vi: "{pn} teach câu hỏi|trả lời hoặc {pn} chat",
      en: "{pn} teach question|answer or {pn} chat"
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      if (this.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name\n\nPlease fix author name to work with this cmd", event.threadID, event.messageID);
      }

      const replyMsg = event.body.trim();
      if (replyMsg) {
        const response = await axios.get(`http://65.109.80.126:20409/sim?ask=${replyMsg}`);
        const resText = response.data.respond;

        api.sendMessage(resText, event.threadID, (err, messageInfo) => {
          if (!err) {
            global.GoatBot.onReply.set(messageInfo.messageID, {
              commandName: this.config.name,
              userID: event.senderID
            });
          }
        }, event.messageID);
      }
    } catch (error) {
      console.error(`Error in reply: ${error.message}`);
      api.sendMessage("❗ An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (this.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
      }

      const msg = args.join(" ").trim();
      if (!msg) {
        return api.sendMessage("Hello! I am Janvi Robot.\n\nHow can I assist you?", event.threadID, event.messageID);
      }

      if (args[0].toLowerCase() === "teach") {
        const input = msg.slice(5).trim();
        const parts = input.split('-');

        if (parts.length === 2) {
          const question = parts[0].trim();
          const answer = parts[1].trim();

          await axios.get(`http://65.109.80.126:20409/teach?ask=${question}&ans=${answer}`);

          return api.sendMessage(
            `📁 Teach added successfully...\n\n➠ Query: "${question}"\n\n➠ Response: "${answer}"`,
            event.threadID,
            event.messageID
          );
        } else {
          return api.sendMessage(
            "📚 Example:\n\n.janvi teach [Query] - [Response]\nTry it!",
            event.threadID,
            event.messageID
          );
        }
      }

      if (args[0].toLowerCase() === "list") {
        try {
          const data = await axios.get(`http://65.109.80.126:20409/info`);

          return api.sendMessage(
            `➠ Total Queries: ${data.data.totalKeys}\n \n➠ Total Responses: ${data.data.totalResponses}`,
            event.threadID,
            event.messageID
          );
        } catch (error) {
          return api.sendMessage("Something went wrong.", event.threadID, event.messageID);
        }
      }

      const response = await axios.get(`http://65.109.80.126:20409/sim?ask=${msg}`);
      const resText = response.data.respond;
      api.sendMessage(resText, event.threadID, (err, messageInfo) => {
        if (!err) {
          global.GoatBot.onReply.set(messageInfo.messageID, {
            commandName: this.config.name,
            userID: event.senderID
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error(`Error in start: ${error.message}`);
      api.sendMessage("❗ An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};
