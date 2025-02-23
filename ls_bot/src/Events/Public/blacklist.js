const { PermissionFlagsBits, ChannelType } = require("discord.js");
const { readConfig, getLocales } = require("ls_bots.js");

module.exports = {
  name: "messageCreate",
  /**
   * @param {import("discord.js").Message} message
   */
  async execute(message) {
    const { channelId, content, author, member, channel } = message;
    const config = await readConfig();

    const allowedCategoryIds = [
      ...config.TicketSystem.MoveOptions.map((option) => option.categoryId),
      ...config.TicketSystem.TicketOptions.map((option) => option.categoryId),
    ];

    if (author.bot) return;
    if (message.channel.type === ChannelType.DM) return;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return;
    if (config.Security.BlacklistedWords.enabled) {
      if (
        member.roles.cache.some((role) =>
          config.Security.BlacklistedWords.WhitelistedRoleIds.includes(role.id)
        )
      )
        return;
      if (
        config.Security.BlacklistedWords.WhitelistedChannels.includes(channelId)
      )
        return;
      if (
        config.Security.BlacklistedWords.Words.some((word) =>
          content.toLowerCase().includes(word.toLowerCase())
        )
      ) {
        await message.delete();
        return handlePunishment(
          config.Security.BlacklistedWords.Punnishment,
          member
        );
      }
    }

    if (config.Security.BlacklistedLinks.enabled) {
      if (
        member.roles.cache.some((role) =>
          config.Security.BlacklistedLinks.WhitelistedRoleIds.includes(role.id)
        )
      )
        return;
      if (
        config.Security.BlacklistedLinks.WhitelistedChannels.includes(channelId)
      )
        return;
      if (allowedCategoryIds.includes(channel.parentId)) return;
      if (
        config.Security.BlacklistedLinks.Links.some((word) =>
          content.toLowerCase().includes(word.toLowerCase())
        )
      ) {
        await message.delete();
        return handlePunishment(
          config.Security.BlacklistedLinks.Punnishment,
          member
        );
      }
    }
    function handlePunishment(punishment, member) {
      if (!punishment) return;

      if (punishment.includes("%timeout%")) {
        const timeoutTime = config.Security.BlacklistedLinks.TimeoutTime;
        let time = 0;

        if (timeoutTime.includes("s")) {
          time = parseInt(timeoutTime);
        } else if (timeoutTime.includes("m")) {
          time = parseInt(timeoutTime) * 60;
        } else if (timeoutTime.includes("h")) {
          time = parseInt(timeoutTime) * 60 * 60;
        } else if (timeoutTime.includes("d")) {
          time = parseInt(timeoutTime) * 24 * 60 * 60;
        }

        const resultTime = time * 1000;
        member.timeout(resultTime);
      } else if (punishment.includes("%ban%")) {
        member.ban();
      } else if (punishment.includes("%kick%")) {
        member.kick();
      }
    }
  },
};
