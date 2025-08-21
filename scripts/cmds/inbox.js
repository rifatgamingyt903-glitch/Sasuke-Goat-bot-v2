module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "RIFAT",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "INBOX"
    },
    longDescription: {
      en: ""
    },
    category: "fun",
    guide: {
      en: ""
    }
  },
  langs: {
    en: {
      gg: ""
    },
    id: {
      gg: ""
    }
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const query = encodeURIComponent(args.join(' '));
      message.reply("MSG SENT SUCCESSFUL,PLEASE CHECK INBOX🎉", event.threadID);
      api.sendMessage("Kire Dakli Kn😵‍💫", event.senderID);
    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
}
