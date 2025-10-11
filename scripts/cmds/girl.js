module.exports = {
  config: {
    name: "girl_np", // internal name
    version: "1.0",
    author: "AceGun",
    category: "media",
    shortDescription: "Send you a girl photo",
  },

  onStart: async function ({ message }) {
    const links = [
      "https://i.postimg.cc/wTJNSC1G/E-B9ea-WQAAst-Yg.jpg",
      "https://i.postimg.cc/sgrWyTSD/E-B9eb-AWUAINyt-B.jpg",
      "https://i.postimg.cc/TYcj48LJ/E02i-P-q-XIAE62tu.jpg",
      "https://i.postimg.cc/MpK0ks12/E02i-P-w-WYAEbvgg.jpg",
      "https://i.postimg.cc/k5LWbqzq/E02i-P-x-XIAAy-K2k.jpg",
      "https://i.postimg.cc/C5R1Hqq2/E067-KUr-VIAYK-4-R.jpg",
      "https://i.postimg.cc/v8KD80Rw/E067-KUs-Uc-AM2jri.jpg",
      "https://i.postimg.cc/xCJD6y6L/E07-FXgt-UYAAp-Qn-S.jpg",
      "https://i.postimg.cc/q77d3dnb/E07-FXgu-Uc-AQB1-RK.jpg",
      // ... add the rest of your links
    ];

    const img = links[Math.floor(Math.random() * links.length)];

    await message.send({
      body: "「 Here is your Babe😻 」",
      attachment: await global.utils.getStreamFromURL(img),
    });
  },
};
