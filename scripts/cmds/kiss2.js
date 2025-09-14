const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "kiss2",
    version: "2.0.0",
    author: "—͟͟͞͞𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss the person you tag",
    longDescription: "Make a kiss frame with the person you tag",
    category: "love",
    guide: {
      en: "{pn} @mention"
    }
  },

  onStart: async function () {
    const dirMaterial = path.resolve(__dirname, "cache");
    const imgPath = path.resolve(dirMaterial, "hon.png");
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(imgPath)) {
      const img = await axios.get("https://i.imgur.com/BtSlsSS.jpg", { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(img.data, "utf-8"));
    }
  },

  onRun: async function ({ message, event }) {
    const { senderID, mentions } = event;
    const mention = Object.keys(mentions);
    if (mention.length === 0) return message.reply("👉 দয়া করে একজনকে ট্যাগ করুন যাকে kiss করতে চান!");

    const one = senderID;
    const two = mention[0];

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
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];

    const imgPath = await makeImage({ one, two });
    message.reply({
      body: randomCaption,
      attachment: fs.createReadStream(imgPath)
    }, () => fs.unlinkSync(imgPath));
  }
};

async function makeImage({ one, two }) {
  const __root = path.resolve(__dirname, "cache");
  let hon_img = await jimp.read(__root + "/hon.png");
  let pathImg = __root + `/hon_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, "utf-8"));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, "utf-8"));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  hon_img
    .resize(700, 440)
    .composite(circleOne.resize(200, 200), 390, 23)
    .composite(circleTwo.resize(180, 180), 140, 80);

  let raw = await hon_img.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}
