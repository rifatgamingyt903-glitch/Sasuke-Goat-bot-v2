module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money"],
        version: "1.5",
        author: "Mueid Mursalin Rifat",
        countDown: 5,
        role: 0,
        description: {
            en: "✅ | View your balance or the balance of a tagged person. Also, send or request money."
        },
        category: "utility",
        guide: {
            en: "   {pn}: View your balance $"
                + "\n   {pn} <@tag>: View the balance of the tagged person "
                + "\n   {pn} send [amount] @mention: Send money to someone "
                + "\n   {pn} request [amount] @mention: Request money from someone "
        }
    },

    formatMoney: function (amount) {
        if (!amount) return "0";
        if (amount >= 1e12) return (amount / 1e12).toFixed(1) + 'T';
        if (amount >= 1e9) return (amount / 1e9).toFixed(1) + 'B';
        if (amount >= 1e6) return (amount / 1e6).toFixed(1) + 'M';
        if (amount >= 1e3) return (amount / 1e3).toFixed(1) + 'K';
        return amount.toString();
    },

    onStart: async function ({ message, usersData, event, args, api }) {
        let targetUserID = event.senderID;
        let isSelfCheck = true;

        if (event.messageReply) {
            targetUserID = event.messageReply.senderID;
            isSelfCheck = false;
        } 
        else if (event.mentions && Object.keys(event.mentions).length > 0) {
            targetUserID = Object.keys(event.mentions)[0];
            isSelfCheck = false;
        }

        if (args.length > 0 && (args[0] === "send" || args[0] === "request")) {
            return await this.handleTransaction({ message, usersData, event, args, api });
        }

        const userData = await usersData.get(targetUserID);
        const money = userData?.money || 0;
        const formattedMoney = this.formatMoney(money);

        if (isSelfCheck) {
            return message.reply(` Your balance is ${formattedMoney} 💲`);
        } 
        else {
            return message.reply(` $BALANCE INFORMATION$ \n ${userData?.name || "User"} has ${formattedMoney} $ !? \n Have a good day! `);
        }
    },

    handleTransaction: async function ({ message, usersData, event, args, api }) {
        const command = args[0].toLowerCase();
        const amount = parseInt(args[1]);
        const { senderID, threadID, mentions, messageReply } = event;
        let targetID;

        if (isNaN(amount) || amount <= 0) {
            return api.sendMessage(`❌ | Invalid amount! Usage:\n{pn} send [amount] @mention\n{pn} request [amount] @mention`, threadID);
        }

        if (messageReply) {
            targetID = messageReply.senderID;
        } else {
            const mentionKeys = Object.keys(mentions);
            if (mentionKeys.length === 0) {
                return api.sendMessage("❌ | Mention someone to send/request money!", threadID);
            }
            targetID = mentionKeys[0];
        }

        if (!targetID || targetID === senderID) {
            return api.sendMessage("❌ | You cannot send/request money to yourself!", threadID);
        }

        if (command === "send") {
            const senderData = await usersData.get(senderID);
            const receiverData = await usersData.get(targetID);

            if (!senderData || !receiverData) {
                return api.sendMessage("❌ | User not found.", threadID);
            }

            if (senderData.money < amount) {
                return api.sendMessage("❌ | You don't have enough money!", threadID);
            }

            await usersData.set(senderID, { ...senderData, money: senderData.money - amount });
            await usersData.set(targetID, { ...receiverData, money: receiverData.money + amount });

            const senderName = await usersData.getName(senderID);
            const receiverName = await usersData.getName(targetID);

            api.sendMessage(`✅ | ${senderName} sent you ${this.formatMoney(amount)} $ ! 💸`, targetID);
            return api.sendMessage(`✅ | You successfully sent ${this.formatMoney(amount)} $ to ${receiverName}`, threadID);
        }

        if (command === "request") {
            const ownerID = "123456789"; // 🔹 Owner's Facebook ID  
            const ownerGroupID = "987654321"; // 🔹 Specific Group ID of the Owner  

            const requesterName = await usersData.getName(senderID);
            const requestMessage = `📩 | ${requesterName} is requesting ${this.formatMoney(amount)} $ from you! 💵\n✅ To send: Use "{pn} send ${amount} @${requesterName}".`;

            api.sendMessage(requestMessage, ownerID, (err) => {
                if (err) {
                    // 🔹 If not sent via Inbox, send it to the Group Chat  
                    api.sendMessage(requestMessage, ownerGroupID, (err2) => {
                        if (!err2) {
                            api.sendMessage(`✅ | Your request has been sent to the Owner's Group Thread! ✅`, senderID);
                        } else {
                            api.sendMessage(`❌ | Sorry, your request couldn't be sent to the Owner! 😞`, senderID);
                        }
                    });
                } else {
                    api.sendMessage(`✅ | Your request has been sent to the Owner! ✅`, senderID);
                }
            });
        }
    }
};
