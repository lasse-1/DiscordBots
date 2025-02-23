const { readConfig } = require("ls_bots.js");
const { ActivityType } = require("discord.js");
/**
 * @param {import("discord.js").Client} client
 */
async function Ready(client) {
  const updateChannels = async () => {
    const config = await readConfig();

    const guild = client.guilds.cache.first();
    const guildId = guild?.id;
    const memberCount = guild?.memberCount;

    if (!guildId || !memberCount) {
      return;
    }

    // Update member count
    const memberCountChannel = guild.channels.cache.get(
      config.ServerStats.MemberCount.channelId
    );
    if (memberCountChannel) {
      memberCountChannel.setName(`Members: ${memberCount}`);
    }

    // Update custom stats
    await Promise.all(
      config.ServerStats.CustomStats.map(async (customStat) => {
        const role = guild.roles.cache.get(customStat.roleId);
        if (!role) {
          return;
        }

        const roleMemberCount = role.members.size;

        const customStatChannel = guild.channels.cache.get(
          customStat.channelId
        );
        if (customStatChannel) {
          const channelName = customStat.name.replace(
            "%count%",
            roleMemberCount
          );
          customStatChannel.setName(channelName);
        }
      })
    );

    if (config.Activity.Activity) {
      const activityType = config.Activity.type.includes("%watching%")
        ? ActivityType.Watching
        : config.Activity.type.includes("%playing%")
        ? ActivityType.Playing
        : undefined;

      client.user.setActivity({
        name: config.Activity.name,
        type: activityType,
      });
    }
  };

  await updateChannels();

  setInterval(updateChannels, 10 * 60000);
}

module.exports = Ready;
