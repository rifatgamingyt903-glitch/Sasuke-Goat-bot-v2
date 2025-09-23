const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "yt",
    aliases: ["ytb", "youtube"],
    version: "2.2",
    author: "Mueid Mursalin Rifat 😺",
    countDown: 5,
    role: 0,
    shortDescription: "🎵 YouTube downloader",
    longDescription: "Search and download YouTube audio (-a) or video (-v).",
    category: "media",
    guide: {
      en: "{pn} <query/link> -a (audio)\n{pn} <query/link> -v (video)\n\nReply with 1-5 to download."
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const raw = args.join(" ");
    if (!raw) return message.reply("❗ Use: yt <query/link> -a or -v");

    const isAudio = raw.includes("-a");
    const isVideo = raw.includes("-v");

    if (!isAudio && !isVideo)
      return message.reply("❗ Please use `-a` for audio or `-v` for video.");

    const mode = isAudio ? "ytmp3" : "ytmp4";
    const query = raw.replace(/-a|-v/g, "").trim();

    if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(query)) {
      const wait = await message.reply("⏳ Downloading, please wait...");
      await handleDownload(query, mode, message, wait.messageID);
      return;
    }

    try {
      const res = await yts(query);
      const videos = res.videos.slice(0, 5);
      if (videos.length === 0) return message.reply("❌ No results found.");

      let body = `🎬 Results for: "${query}"\nReply with 1-5 to download (${isAudio ? "MP3" : "MP4"})\n\n`;
      for (let i = 0; i < videos.length; i++) {
        body += `${i + 1}. ${videos[i].title} (${videos[i].timestamp})\nBy: ${videos[i].author.name}\n\n`;
      }

      const attachments = [];
      for (let i = 0; i < videos.length; i++) {
        const img = await axios.get(videos[i].thumbnail, { responseType: "stream" });
        const tempPath = path.join(__dirname, "cache", `yt-thumb-${i}-${Date.now()}.jpg`);
        const writer = fs.createWriteStream(tempPath);
        img.data.pipe(writer);
        await new Promise(res => writer.on("finish", res));
        attachments.push(fs.createReadStream(tempPath));
      }

      api.sendMessage({
        body: body + `🔰 Api: ALI KOJA | Dev: Mueid Mursalin Rifat 😺`,
        attachment: attachments
      }, event.threadID, (err, info) => {
        if (err) {
          console.error("Send message error:", err);
          // Clean up temp files on error too
          attachments.forEach(file => {
            try { fs.unlinkSync(file.path); } catch (e) {}
          });
          return;
        }

        // Clean up temp files after sending
        attachments.forEach(file => {
          try { fs.unlinkSync(file.path); } catch (e) {}
        });

        const sentMsgID = info.messageID || info.messageID || info?.messageID || info?.message_id;
        console.log("Sent message ID:", sentMsgID);

        // Auto unsend search result after 20 sec
        setTimeout(() => {
          try {
            console.log("Trying to unsend message:", sentMsgID);
            api.unsendMessage(sentMsgID);
          } catch (e) {
            console.error("Failed to unsend message:", e);
          }
        }, 20000);

        global.GoatBot.onReply.set(sentMsgID, {
          commandName: "yt",
          messageID: sentMsgID,
          author: event.senderID,
          type: "yt-reply",
          data: videos,
          mode
        });
      });

    } catch (e) {
      console.error("Search error:", e);
      message.reply("⚠ Failed to search YouTube.");
    }
  },

  onReply: async function ({ event, message, Reply, api }) {
    const { type, author, data, mode, messageID } = Reply;
    if (event.senderID !== author) return;

    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > data.length)
      return message.reply("❗ Reply with a number from 1–5.");

    const selected = data[index - 1];

    // Remove search message
    try {
      api.unsendMessage(messageID);
    } catch (e) {}

    const wait = await message.reply("⏳ Downloading, please wait...");
    await handleDownload(selected.url, mode, message, wait.messageID);
  }
};

// 📥 Download Handler
async function handleDownload(url, type, message, waitMsgID) {
  try {
    const apiURL = `https://koja-api.web-server.xyz/${type}?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiURL);
    const dlURL = data.download?.url;

    if (!data.success || !dlURL) return message.reply("❌ Failed to fetch file.");

    const ext = type === "ytmp3" ? "mp3" : "mp4";
    const fileName = `${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, "cache", fileName);

    const res = await axios.get(dlURL, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);
    await new Promise(resolve => writer.on("finish", resolve));

    // Remove "Downloading..." message
    try {
      await message.unsend(waitMsgID);
    } catch (e) {}

    await message.reply({
      body:
        `🎵 ${data.metadata.title}\n` +
        `📺 Channel: ${data.metadata.author.name}\n` +
        `⏱ Duration: ${data.metadata.duration.timestamp}\n` +
        `📥 Quality: ${data.download.quality}\n\n` +
        `🔰 Api: ALI KOJA | Made by Mueid Mursalin Rifat 😺`,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Download failed:", err);
    message.reply("⚠ Error downloading file.");
  }
                    }
