const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "hug",
    aliases: [],
    version: "1.0",
    author: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    countDown: 5,
    role: 0,
    shortDescription: "hug frame create",
    longDescription: "একজনকে মেনশন করে সুন্দর হাগ ফ্রেম তৈরি করো!",
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  onStart: async function ({ event, api, args, message }) {
    const mention = Object.keys(event.mentions);
    const senderID = event.senderID;
    const threadID = event.threadID;

    if (mention.length !== 1)
      return message.reply("আরে বলদ একজনকে মেনশন করে🤧🤣");

    const dirMaterial = path.join(__dirname, "cache", "canvas");
    const bgPath = path.join(dirMaterial, "hugv3.png");

    // Ensure directory exists
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });

    // Download background if missing
    if (!fs.existsSync(bgPath)) {
      const img = await axios.get("https://i.imgur.com/7lPqHjw.jpg", { responseType: "arraybuffer" });
      fs.writeFileSync(bgPath, Buffer.from(img.data, "utf-8"));
    }

    async function circle(image) {
      image = await jimp.read(image);
      image.circle();
      return await image.getBufferAsync("image/png");
    }

    async function makeImage({ one, two }) {
      const bg = await jimp.read(bgPath);
      const avatarOne = path.join(dirMaterial, `avt_${one}.png`);
      const avatarTwo = path.join(dirMaterial, `avt_${two}.png`);
      const output = path.join(dirMaterial, `hug_${one}_${two}.png`);

      const getAvatar = async (id, dest) => {
        const res = await axios.get(
          `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        );
        fs.writeFileSync(dest, Buffer.from(res.data, "utf-8"));
      };

      await getAvatar(one, avatarOne);
      await getAvatar(two, avatarTwo);

      const circleOne = await jimp.read(await circle(avatarOne));
      const circleTwo = await jimp.read(await circle(avatarTwo));

      bg.composite(circleOne.resize(220, 220), 200, 50);
      bg.composite(circleTwo.resize(220, 220), 490, 200);

      const raw = await bg.getBufferAsync("image/png");
      fs.writeFileSync(output, raw);
      fs.unlinkSync(avatarOne);
      fs.unlinkSync(avatarTwo);

      return output;
    }

    const captions = [
      "❝ যদি কখনো অনুভূতি হয়, তাহলে তোমার প্রতি আমার অনুভূতি পৃথিবীর সেরা অনুভূতি!🌻",
      "❝ তুমি আমার জীবনের সেরা অধ্যায়, যেই অধ্যায় বারবার পড়তে ইচ্ছে করে!💝",
      "❝ তোমার ভালোবাসার মূল্য আমি কিভাবে দেবো, তা আমার জানা নেই, শুধু জানি প্রথম থেকে যে ভাবে ভালোবেসেছিলাম💜 সেভাবেই ভালোবেসে যাবো!🥰",
      "❝ আমি প্রেমে পড়ার আগে তোমার মায়ায় জড়িয়ে গেছি, যে মায়া নেশার মতো, আমি চাইলে তোমার নেশা কাটিয়ে উঠতে পারি না!💝",
      "❝ তোমাকে চেয়েছিলাম, আর তোমাকেই চাই, তুমি আমার ভালোবাসা🖤 তুমি আমার বেঁচে থাকার কারণ!💞",
      "❝ আমার কাছে তোমাকে ভালোবাসার কোনো সংজ্ঞা নেই, তোমাকে ভালোবেসে যাওয়া হচ্ছে আমার নিশ্চুপ অনুভূতি!❤️",
      "❝ তুমি আমার জীবনের সেই গল্প, যা পড়তে গিয়ে প্রতিবারই নতুন কিছু আবিষ্কার করি!💚",
      "❝ আমার মনের গহীনে বাস করা রাজকন্যা তোমাকে অনেক ভালোবাসি।❤️‍🩹",
      "❝ I feel complete in my life, যখন ভাবি তোমার মতো একটা লক্ষ্মী মানুষ আমার জীবন সঙ্গী!🌺"
    ];

    try {
      const pathImg = await makeImage({ one: senderID, two: mention[0] });
      const caption = captions[Math.floor(Math.random() * captions.length)];
      await message.reply({
        body: caption,
        attachment: fs.createReadStream(pathImg)
      });
      fs.unlinkSync(pathImg);
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate hug image.");
    }
  }
};
