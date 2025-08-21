const axios = require('axios');

module.exports = {
	config: {
		name: "nsfwwaifu",
		aliases: ["nsfw"],
		version: "1.0",
		author: " Mueid Mursalin Rifat",
		countDown: 10,
		role: 0,
		shortDescription: "get random waifu",
		longDescription: "Get waifu neko: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe",
		category: "18+",
		guide: "{pn} {{<name>}}"
	},

	onStart: async function ({ message, args }) {
		const name = args.join(" ");
		if (!name)

			try {
				let res = await axios.get(`https://api.waifu.pics/nsfw/waifu`)


				let res2 = res.data
				let img = res2.url

				const form = {
					body: `   「 Here is nsfw🥵  」   `

				};
				if (img)
					form.attachment = await global.utils.getStreamFromURL(img);
				message.reply(form);
			} catch (e) {
				message.reply(` Not Found`)
			}


		else {

			try {
				let res = await axios.get(`https://api.waifu.pics/nsfw/${name}`)


				let res2 = res.data
				let img1 = res2.url

				const form = {
					body: `   「nsfw waifu🥵」   `

				};
				if (img1)
					form.attachment = await global.utils.getStreamFromURL(img1);
				message.reply(form);
			} catch (e) { message.reply(` No waifu  \category: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe `) }

		}
	}
};
