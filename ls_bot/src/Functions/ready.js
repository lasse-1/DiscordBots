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

    const memberCountChannel = guild.channels.cache.get(
      config.ServerStats.MemberCount.ChannelId
    );
    if (memberCountChannel) {
      memberCountChannel.setName(
        config.ServerStats.MemberCount.Name.replace("%count%", memberCount)
      );
    }

    await Promise.all(
      config.ServerStats.CustomStats.map(async (customStats) => {
        await guild.members.fetch();

        const role = guild.roles.cache.get(customStats.RoleId);
        if (!role) {
          return;
        }

        const roleMemberCount = role.members.size;

        const customStatChannel = guild.channels.cache.get(
          customStats.ChannelId
        );
        if (customStatChannel) {
          const channelName = customStats.Name.replace(
            "%count%",
            roleMemberCount
          );
          customStatChannel.setName(channelName);
        }
      })
    );

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
