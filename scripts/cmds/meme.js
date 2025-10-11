const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "meme",
    aliases: ["memes"],
    version: "1.7",
    author: "MahMUD (No Prefix by @tas33n)",
    countDown: 10,
    role: 0,
    category: "fun",
    guide: "{pn}"
  },

  // Prefix দিয়ে ব্যবহার করলে
  onStart: async function ({ message, event, api }) {
    await sendMeme({ message, event, api });
  },

  // ✅ No Prefix (Auto Trigger)
  onChat: async function ({ event, message, api }) {
    if (!event.body) return;
    const text = event.body.toLowerCase();

    // এই শব্দগুলো থাকলে auto মিম পাঠাবে
    if (
      text.includes("meme") ||
      text.includes("send meme") ||
      text.includes("funny meme") ||
      text.includes("😂") ||
      text.includes("🤣")
    ) {
      await sendMeme({ message, event, api });
    }
  },
};

// 🧠 Helper Function
async function sendMeme({ message, event, api }) {
  try {
    const apiUrl = await mahmud();
    const res = await axios.get(`${apiUrl}/api/meme`);
    const imageUrl = res.data?.imageUrl;

    if (!imageUrl) {
      return message.reply("😅 Could not fetch meme. Please try again later.");
    }

    const stream = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    await api.sendMessage({
      body: "🐸 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐦𝐞𝐦𝐞 🤣",
      attachment: stream.data
    }, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return message.reply("❌ Error fetching meme, please try again later!");
  }
}
