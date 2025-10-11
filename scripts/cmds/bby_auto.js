const axios = require("axios");

// Random typos
function randomTypos(text) {
  if (Math.random() < 0.25) {
    const i = Math.floor(Math.random() * text.length);
    const c = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    return text.slice(0, i) + c + text.slice(i + 1);
  }
  return text;
}

// Random delay
function randomDelay(min = 500, max = 2500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Context store per thread & user
const userContext = new Map();

// Special triggers replies
const specialReplies = {
  love: ["Awww 😘 ami o tomake bhalo basi 💖", "Tumi amar jaan 🥰", "Eto affectionate keno? 😚"],
  miss: ["Amake miss korcho naki? 🥺", "Babu, ami o tomake miss korchi 😢💖", "Tumi missing mood e aso 😏"],
  bby: ["Bolo jaan 😏, tumi kemon aso? 🥰", "Hey Bby 🥰 ki koibi?", "Amake bolo Bby 😘"],
  baby: ["Baby! 😘 kemon aso?", "Bolo Baby 🥰, amar sathe kotha bolbe?", "Awww Baby 😚"],
  sakura: ["Sakura 😘 ki koibi?", "Hey Sakura 🥰 amar jaan!", "Sakura, tumi eto cute keno 😚"],
  "boss rifat": ["Rifat bole tumi amar bby 😏", "Amar boss Rifat er jonno smile 😇", "Rifat er sathe prem korte parba naki? 🫶"]
};

module.exports = {
  config: {
    name: "bby_auto",
    aliases: [],
    version: "13.0",
    author: "Fahad x GPT",
    role: 0,
    shortDescription: "Advanced girl chat bot with special triggers",
    longDescription: "Replies like chatting with a girl. Tracks multi-step conversation, adjusts tone, flirty/playful/affectionate, emoji-rich, human-like typing, small typos, Boss Rifat references, no-prefix support, special keyword triggers",
    category: "no prefix"
  },

  onChat: async ({ api, event }) => {
    try {
      const userID = event.senderID;
      const threadID = event.threadID;
      const text = event.body?.toLowerCase();
      if (!text) return;

      // Typing simulation
      api.sendTypingIndicator(threadID);
      await new Promise(resolve => setTimeout(resolve, randomDelay()));

      // Initialize context
      if (!userContext.has(threadID)) userContext.set(threadID, {});
      const threadContext = userContext.get(threadID);
      if (!threadContext[userID]) threadContext[userID] = [];
      const context = threadContext[userID];
      context.push(text);
      if (context.length > 10) context.shift(); // Keep last 10 messages

      // Base API reply
      const url = `https://www.noobs-api.rf.gd/dipto/baby?text=${encodeURIComponent(text)}&senderID=${userID}&font=1`;
      const res = await axios.get(url);
      let reply = res?.data?.reply || "😅 Ami kichu bujhte parlam na.";

      // Emoji & reaction pool
      const emojis = ["💖","🥰","😚","✨","🌸","💫","😎","💌","💋","🫶","🥺"];
      const reactions = ["😂","😹","😜","😏","😆","🤣"];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const reaction = reactions[Math.floor(Math.random() * reactions.length)];

      // Special trigger check
      for (const key in specialReplies) {
        if (text.includes(key)) {
          const arr = specialReplies[key];
          reply = arr[Math.floor(Math.random() * arr.length)] + ` ${emoji} ${reaction}`;
          break;
        }
      }

      // Context-aware phrases
      const lastMsg = context[context.length - 2] || "";
      let phrasePool = [
        `Hey jaan 🥺`, `Bolo babu 😚`, `Oii! 😋`, `Ki koibi? 😏`,
        `Amake miss korcho naki? 😜`, `Bhalo laglo to? 🥰`, `Kemon achis? 😎`,
        `Bujhte parli naki? 😅`, `Amar boss Rifat er jonno ekta smile 😇`,
        `Bolo jaan, Rifat er sathe kotha bolbo? 😏`, `Rifat bole, tumi amar bby? 😚`,
        `Babu, Rifat er sathe prem korte parba naki? 🫶`, `Awww 😘`,
        `Tumi eto sweet keno? 💖`, `Amar mon ta flutter korche 😚`
      ];

      // Adjust phrase based on context
      if (text.includes("?")) phrasePool.push("Hmm 🤔 question ta bhalo laglo 😏");
      if (text.includes("love") || text.includes("miss") || text.includes("cute") || text.includes("bhalo")) phrasePool.push("Awww 😘 eto affectionate keno? 💖");
      if (lastMsg.includes("hi") || lastMsg.includes("hello")) phrasePool.push("Hi jaan 😚, kemon aso?");
      const phrase = phrasePool[Math.floor(Math.random() * phrasePool.length)];

      if (!Object.keys(specialReplies).some(k => text.includes(k))) {
        reply = `${phrase}, ${reply} ${emoji} ${reaction}`;
      }

      // Random typos
      reply = randomTypos(reply);

      // Pause before sending
      await new Promise(resolve => setTimeout(resolve, randomDelay(300, 1200)));

      api.sendMessage(reply, threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: " + err.message, threadID, event.messageID);
    }
  }
};
