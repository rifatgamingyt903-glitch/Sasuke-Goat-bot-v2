const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: "uptime2",
    aliases: ["up2", "stats"],
    version: "1.4",
    author: "BaYjid",
    role: 0,
    category: "",
    guide: {
      en: "Use {p}uptime2"
    }
  },

  onStart: async function ({ message }) {
    const uptime = process.uptime();
    const formattedUptime = formatUptimeFull(uptime);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const diskUsage = await getDiskUsage();

    const systemInfo = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
      loadAvg: os.loadavg()[0].toFixed(2),
      botUptime: formattedUptime,
      systemUptime: formatUptime(os.uptime()),
      processMemory: prettyBytes(process.memoryUsage().rss)
    };

    const response =
      `╔═━𝐒𝐲𝐬𝐭𝐞𝐦 𝐎𝐯𝐞𝐫𝐯𝐢𝐞𝐰━═╗\n`
      + `\n[ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 ]\n`
      + `• 𝐎𝐒: ${systemInfo.os}\n`
      + `• 𝐀𝐫𝐜𝐡: ${systemInfo.arch}\n`
      + `• 𝐂𝐏𝐔: ${systemInfo.cpu}\n`
      + `• 𝐋𝐨𝐚𝐝 𝐀𝐯𝐠: ${systemInfo.loadAvg}%\n`
      + `\n[ 𝐌𝐄𝐌𝐎𝐑𝐘 ]\n`
      + `• 𝐔𝐬𝐚𝐠𝐞: ${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)}\n`
      + `• 𝐑𝐀𝐌 𝐔𝐬𝐞𝐝: ${prettyBytes(usedMemory)}\n`
      + `\n[ 𝐃𝐈𝐒𝐊 ]\n`
      + `• 𝐔𝐬𝐞𝐝: ${prettyBytes(diskUsage.used)} / ${prettyBytes(diskUsage.total)}\n`
      + `\n[ 𝐔𝐏𝐓𝐈𝐌𝐄 ]\n`
      + `• 𝐁𝐨𝐭: ${systemInfo.botUptime}\n`
      + `• 𝐒𝐞𝐫𝐯𝐞𝐫: ${systemInfo.systemUptime}\n`
      + `\n[ 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 ]\n`
      + `• 𝐌𝐞𝐦𝐨𝐫𝐲: ${systemInfo.processMemory}\n`
      + `╚═━「𝐁𝐚𝐘𝐣𝐢𝐝 𝐁𝐎𝐓」━═╝`;

    message.reply(response);
  }
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatUptimeFull(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}
