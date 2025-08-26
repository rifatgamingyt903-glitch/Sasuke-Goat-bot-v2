const axios = require("axios");

module.exports.config = {
    name: "effect",
    aliases: [],
    version: "1.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    countDown: 3, 
    role: 0,
    longDescription: {
        en: "add various effect to your images"
    },
    category: "tools",
    guide: {
        en: "{pn} reply to an image for effective"
    } 
};

module.exports.onStart = async ({ api, event, args }) => {
    try {
      const effect = args.join(" ") || 1;
        if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
            return api.sendMessage("𝑃𝑙𝑒𝑎𝑠𝑒 𝑟𝑒𝑝𝑙𝑦 𝑡𝑜 𝑎𝑛 𝑖𝑚𝑎𝑔𝑒 𝑤𝑖𝑡ℎ 𝑡ℎ𝑒 𝑐𝑜𝑚𝑚𝑎𝑛𝑑", event.threadID, event.messageID);
        }

        const hasan = event.messageReply.attachments[0].url;
        const baigan = global.GoatBot.config.api.hasan;
        const apiUrl = `${baigan}/effect?effect=${effect}&imageUrl=${encodeURIComponent(hasan)}`;

        const response = await axios.get(apiUrl, {
            responseType: 'stream'
        });

        api.sendMessage({
            body: "🙌| 𝑯𝒆𝒓𝒆 𝒊𝒔 𝒚𝒐𝒖𝒓 𝒆𝒇𝒇𝒆𝒄𝒕𝒊𝒗𝒆 𝒑𝒉𝒐𝒕𝒐",
            attachment: response.data
        }, event.threadID, event.messageID);

    } catch (e) {
        api.sendMessage(`Error: ${e.message}`, event.threadID, event.messageID);
    }
};
