const schedule = require("node-schedule");
const chalk = require("chalk");

module.exports = {
  config: {
    name: "autosent",
    aliases: ["autotext", "autospam"],
    version: "10.0.1",
    author: "Shahadat Islam",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Auto send message every hour (BD Time)"
    },
    longDescription: {
      en: "Automatically sends messages to all threads at scheduled times (Asia/Dhaka timezone)."
    },
    category: "automation",
    guide: {
      en: "{p}autosent"
    }
  },

  onLoad: async function ({ api }) {
    console.log(
      chalk.bold.hex("#00c300")(
        "============ AUTOSENT COMMAND LOADED (BD TIME) ============"
      )
    );

    const messages = [
      { time: "12:00 AM", message: "এখন সময় রাত 12:00 AM ⏳\nঅনেক রাত হলো, ঘুমিয়ে পড় Bby Good Night 😴💤❤️" },
      { time: "1:00 AM", message: "এখন সময় রাত 1:00 AM ⏳\nকিরে তুই এখনো ঘুমাস নাই? তাড়াতাড়ি ঘুমিয়ে পড়!😾😴🛌" },
      { time: "5:00 AM", message: "এখন সময় ভোর 5:00 AM ⏳\nফজরের আজান হয়ে গেছে, নামাজটা পরে নিও পিও~ 🕌✨🤲💖" },
      { time: "6:00 AM", message: "এখন সময় সকাল 6:00 AM ⏳\nআসসালামুয়ালাইকুম Good Morning Bby! 🌅💖" },
      { time: "12:00 PM", message: "এখন সময় দুপুর 12:00 PM ⏳\nGood Afternoon! 🌞🙌🌸" },
      { time: "8:00 PM", message: "এখন সময় রাত 8:00 PM ⏳\nওই ওই, এতো bot bot না করে আমার বস রিফাত কে একটা গফ দে...!🫰😎🔥" },
      { time: "11:00 PM", message: "এখন সময় রাত 11:00 PM ⏳\nযে ছেড়ে গেছে 😔 তাকে ভুলে যাও 🙂 আমার বস রিফাত এর সাথে প্রেম করে তাকে দেখিয়ে দাও...!🙈🐸🤗" }
    ];

    messages.forEach(({ time, message }) => {
      const [hour, minute, period] = time.split(/[: ]/);
      let hour24 = parseInt(hour, 10);
      if (period === "PM" && hour !== "12") {
        hour24 += 12;
      } else if (period === "AM" && hour === "12") {
        hour24 = 0;
      }

      const rule = new schedule.RecurrenceRule();
      rule.tz = "Asia/Dhaka";
      rule.hour = hour24;
      rule.minute = parseInt(minute, 10);

      schedule.scheduleJob(rule, () => {
        if (!global.db.allThreadData) return;
        global.db.allThreadData.forEach((data, threadID) => {
          api.sendMessage(message, threadID, (error) => {
            if (error) {
              console.error(`Failed to send message to ${threadID}:`, error);
            }
          });
        });
      });

      console.log(chalk.hex("#00FFFF")(`Scheduled (BDT): ${time} => ${message}`));
    });
  },

  onStart: async function () {
    // এই কমান্ড রান করলে কিছু করবে না
  }
};
