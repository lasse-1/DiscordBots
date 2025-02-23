const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { readConfig, getLocales, addEmbedValue } = require("ls_bots.js");

module.exports = {
  name: "messageCreate",
  /**
   * @param {import("discord.js").Message} message
   */
  async execute(message) {
    const { channel, channelId, guild, author, member, content } = message;
    const locals = await getLocales(message);
    const config = await readConfig();
    const optins = config.Suggestions;
    const channelOption = optins.find(
      (option) => option.channelId === channelId
    );

    if (author.bot) return;
    if (
      config.Security.BlacklistedWords.enabled &&
      config.Security.BlacklistedWords.Words.some(
        (word) =>
          content.toLowerCase().includes(word.toLowerCase()) &&
          !member.permissions.has(PermissionFlagsBits.Administrator)
      )
    ) {
      if (
        !member.roles.cache.some(
          (role) =>
            !config.Security.BlacklistedWords.WhitelistedRoleIds.includes(
              role.id
            )
        )
      )
        return;
      if (
        !config.Security.BlacklistedWords.WhitelistedChannels.includes(
          channelId
        )
      )
        return;
    }
    if (
      config.Security.BlacklistedLinks.enabled &&
      config.Security.BlacklistedLinks.Links.some(
        (word) =>
          content.toLowerCase().includes(word.toLowerCase()) &&
          !member.permissions.has(PermissionFlagsBits.Administrator)
      )
    ) {
      if (
        !member.roles.cache.some(
          (role) =>
            !config.Security.BlacklistedLinks.WhitelistedRoleIds.includes(
              role.id
            )
        )
      )
        return;
      if (
        !config.Security.BlacklistedLinks.WhitelistedChannels.includes(
          channelId
        )
      )
        return;
    }
    if (channelOption) {
      const channel = guild.channels.cache.get(channelId);
      const {
        author,
        authorUrl,
        title,
        color,
        thumbnail,
        image,
        footer,
        footerUrl,
      } = locals.SuggestionMessage;

      await message.delete();

      const embed = new EmbedBuilder();
      addEmbedValue(embed, "setAuthor", author, authorUrl);
      addEmbedValue(embed, "setTitle", title);
      addEmbedValue(embed, "setDescription", message.content);
      addEmbedValue(embed, "setColor", color);
      addEmbedValue(embed, "setThumbnail", thumbnail);
      addEmbedValue(embed, "setImage", image);
      addEmbedValue(embed, "setFooter", footer, footerUrl);

      if (channel) {
        return channel.send({ embeds: [embed] }).then((sendMessage) => {
          sendMessage.react(channelOption.reaction1);
          sendMessage.react(channelOption.reaction2);
        });
      }
    }
  },
};
