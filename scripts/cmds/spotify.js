const a = require("axios");
const b = require("fs");
const d = require("path");
const e = d.join(__dirname, "cache");

module.exports = {
  config: {
    name: "spotify",
    aliases: ["sp"],
    version: "3.2",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Search & download song from SoundCloud"
    },
    longDescription: {
      en: "Search and download audio from SoundCloud"
    },
    category: "media",
    guide: {
      en: "{pn} <song name>\n\nExample:\n{pn} dil"
    },
  },

  onStart: async function ({ api: f, args: g, event: h }) {
    if (!g[0]) return f.sendMessage("❌ Please provide a song name.", h.threadID, h.messageID);
    f.setMessageReaction("🎶", h.messageID, () => {}, true);

    try {
      const i = g.join(" ");
      const searchAPI = `https://apis-toop.vercel.app/aryan/soundcloud-search?title=${encodeURIComponent(i)}`;
      const searchRes = await a.get(searchAPI);
      const k = searchRes.data.results?.[0];

      if (!k) return f.sendMessage("❌ No results found on SoundCloud.", h.threadID, h.messageID);

      const downloadAPI = `https://apis-toop.vercel.app/aryan/soundcloud?url=${encodeURIComponent(k.url)}`;
      const downloadRes = await a.get(downloadAPI);
      const n = downloadRes.data;

      if (!n?.download_url) return f.sendMessage("❌ Failed to get audio link.", h.threadID, h.messageID);

      const o = d.join(e, `${k.title}.mp3`);
      const p = await a.get(n.download_url, { responseType: 'stream' });

      p.data.pipe(b.createWriteStream(o)).on("finish", async () => {
        f.sendMessage({
          body: `🎵 𝗧𝗶𝘁𝗹𝗲: ${n.title}\n\n𝗘𝗻𝗷𝗼𝘆 𝘆𝗼𝘂𝗿 𝘀𝗼𝗻𝗴. ❣️`,
          attachment: b.createReadStream(o)
        }, h.threadID, () => b.unlinkSync(o), h.messageID);

        f.setMessageReaction("✅", h.messageID, () => {}, true);
      });

    } catch (z) {
      console.error("❌ An unexpected error occurred:", z.message);
      f.sendMessage("❌ An unexpected error occurred.", h.threadID, h.messageID);
      f.setMessageReaction("❌", h.messageID, () => {}, true);
    }
  }
};
