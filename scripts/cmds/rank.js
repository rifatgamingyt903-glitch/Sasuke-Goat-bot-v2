const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rank",
    aliases: ["level", "exp"],
    version: "2.0",
    author: "NTKhang (No Prefix by @tas33n)",
    category: "rank",
    role: 0,
    countDown: 5,
    guide: "{pn}"
  },

  // Prefix দিয়ে ব্যবহার করলে
  onStart: async function ({ message, event, usersData }) {
    await sendRankCard({ message, event, usersData });
  },

  // ✅ No Prefix Auto Trigger
  onChat: async function ({ event, message, usersData }) {
    if (!event.body) return;
    const text = event.body.toLowerCase();

    // trigger words
    if (text.includes("rank") || text.includes("my rank") || text.includes("level") || text.includes("exp")) {
      await sendRankCard({ message, event, usersData });
    }
  },
};

// 🎨 Rank Card Function
async function sendRankCard({ message, event, usersData }) {
  try {
    const senderID = event.senderID;
    const userInfo = await usersData.get(senderID);
    let exp = userInfo.exp || 0;
    let level = expToLevel(exp);
    let nextExp = levelToExp(level + 1);
    let prevExp = levelToExp(level);

    const expNow = exp - prevExp;
    const expNeed = nextExp - prevExp;

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#1c1c1c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bar BG
    ctx.fillStyle = "#444";
    ctx.fillRect(220, 180, 400, 30);

    // Bar Fill
    ctx.fillStyle = "#00ff99";
    ctx.fillRect(220, 180, (expNow / expNeed) * 400, 30);

    // Avatar
    const avatarURL = await usersData.getAvatarUrl(senderID);
    const avatar = await Canvas.loadImage(avatarURL);
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 45, 45, 160, 160);
    ctx.restore();

    // Texts
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.fillText(userInfo.name || "Unknown User", 230, 100);
    ctx.font = "22px Arial";
    ctx.fillText(`Level: ${level}`, 230, 140);
    ctx.fillText(`Exp: ${expNow}/${expNeed}`, 230, 170);

    const pathSave = path.join(__dirname, "tmp", `rank_${senderID}.png`);
    await fs.ensureDir(path.dirname(pathSave));
    fs.writeFileSync(pathSave, canvas.toBuffer());

    message.reply(
      {
        body: `🏅 ${userInfo.name}'র র‍্যাঙ্ক কার্ড`,
        attachment: fs.createReadStream(pathSave),
      },
      () => fs.unlinkSync(pathSave)
    );
  } catch (e) {
    console.error(e);
    message.reply("⚠️ র‍্যাঙ্ক কার্ড তৈরি করতে সমস্যা হয়েছে!");
  }
}

// 📈 EXP হিসাব ফাংশন
function expToLevel(exp, deltaNextLevel = 5) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
}

function levelToExp(level, deltaNextLevel = 5) {
  return Math.floor(((Math.pow(level, 2) - level) * deltaNextLevel) / 2);
}
