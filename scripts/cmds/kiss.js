const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "kiss",
    aliases: [],
    version: "2.0.0",
    author: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss the person you want 💋",
    longDescription: "একজনকে মেনশন করে সুন্দর kiss ফ্রেম তৈরি করো 😘",
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  onStart: async function ({ event, message }) {
    const mention = Object.keys(event.mentions);
    const senderID = event.senderID;

    if (mention.length !== 1)
      return message.reply("Please tag 1 person! 😘");

    const dir = path.join(__dirname, "cache");
    const bgPath = path.join(dir, "kiss_bg.jpeg");

    // Folder তৈরি
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ব্যাকগ্রাউন্ড না থাকলে ডাউনলোড
    if (!fs.existsSync(bgPath)) {
      const imgURL = "https://i.imgur.com/j96ooUs.jpeg";
      const imgData = (await axios.get(imgURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(bgPath, Buffer.from(imgData));
    }

    // বৃত্তাকার ইমেজ বানানো
    async function circle(imagePath) {
      const img = await jimp.read(imagePath);
      img.circle();
      return await img.getBufferAsync("image/png");
    }

    // মূল ছবি তৈরি
    async function makeImage({ one, two }) {
      const bg = await jimp.read(bgPath);
      const pathImg = path.join(dir, `kiss_${one}_${two}.png`);
      const avatarOnePath = path.join(dir, `avt_${one}.png`);
      const avatarTwoPath = path.join(dir, `avt_${two}.png`);

      const getAvatar = async (uid, dest) => {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(dest, Buffer.from(res.data, "utf-8"));
      };

      await getAvatar(one, avatarOnePath);
      await getAvatar(two, avatarTwoPath);

      const circleOne = await jimp.read(await circle(avatarOnePath));
      const circleTwo = await jimp.read(await circle(avatarTwoPath));

      bg.resize(700, 440)
        .composite(circleOne.resize(150, 150), 390, 23)
        .composite(circleTwo.resize(150, 150), 115, 130);

      const output = await bg.getBufferAsync("image/png");
      fs.writeFileSync(pathImg, output);

      fs.unlinkSync(avatarOnePath);
      fs.unlinkSync(avatarTwoPath);

      return pathImg;
    }

    // ❤️ Romantic captions
    const captions = [
      "কারণে অকারণে প্রতিদিন নিয়ম করে, তোমার মায়াতে জড়িয়ে পড়ছি আমি বারেবার!🌷",
      "তোমাকে কেন ভালোবাসি তার কোন বিশেষ কারণ আমার জানা নাই! কিন্তু তোমার কাছে সারাজীবন থেকে যাওয়ার হাজারটা কারণ আমার কাছে আছে!💚",
      "তোমার সাথে কাটানো সময়গুলোর কথা চিন্তা করলে মনে হয়, এই এক জনম তোমার সাথে অনেক কম সময়!😘",
      "প্রিয় তুমি কি আমার জীবনের সেই গল্প হবে? যেই গল্পের শুরু থাকবে, কিন্তু কোনো শেষ থাকবে না!♥️",
      "তুমি পাশে থাকলে সবকিছু সুন্দর মনে হয়, জীবন যেন একটা মধুর কবিতায় রূপ নেয়!😍",
      "তোমাকে ছাড়া জীবনটা অসম্পূর্ণ, তুমি আমার ভালোবাসার পূর্ণতা!🧡",
      "তুমি আমার স্বপ্ন, তুমি আমার জীবনের প্রতিটি সুন্দর মুহূর্ত!🌻",
      "আমার চোখে তোমার অস্থিত্ব খোঁজতে এসোনা, হারিয়ে যাবে! কেননা আমার পুরোটা-জুরেই তোমারই নির্বাক আনাগোনা!🌺",
      "তোমাতে শুরু তোমাতেই শেষ, তুমি না থাকলে আমাদের গল্প এখানেই শেষ!😘",
      "ভালোবাসা যদি কোনো অনুভূতি হয়, তাহলে তোমার প্রতি আমার অনুভূতি পৃথিবীর সেরা অনুভূতি।🌻ღ🌺"
    ];

    const caption = captions[Math.floor(Math.random() * captions.length)];

    try {
      const imagePath = await makeImage({ one: senderID, two: mention[0] });
      await message.reply({
        body: caption,
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error(err);
      message.reply("❌ ছবিটি তৈরি করতে সমস্যা হয়েছে!");
    }
  }
};
