const { readConfig } = require("ls_bots.js");
const { ActivityType } = require("discord.js");
/**
 * @param {import("discord.js").Client} client
 */
async function Ready(client) {
  const updateChannels = async () => {
    const config = await readConfig();

    if (config.Activity.Activity) {
      const activityType = config.Activity.Type.includes("%watching%")
        ? ActivityType.Watching
        : config.Activity.Type.includes("%playing%")
        ? ActivityType.Playing
        : undefined;

      client.user.setActivity({
        name: config.Activity.Name,
        type: activityType,
      });
    }
  };

  await updateChannels();

  setInterval(updateChannels, 10 * 60000);
}

module.exports = Ready;
