const { EmbedBuilder } = require("discord.js");
const { readConfig, addEmbedValue } = require("ls_bots.js");

module.exports = {
  name: "messageCreate",
  /**
   * @param {import("discord.js").Message} message
   */
  async execute(message) {
    const config = await readConfig();

    if (message.author.bot) return;
    const options = config.CustomCommands;
    options.forEach(async (option) => {
      const {
        Command,
        Permissions,
        author,
        authorUrl,
        title,
        description,
        thumbnail,
        image,
        footer,
        footerUrl,
        color,
      } = option;

      if (message.content !== Command) return;

      if (
        !message.member.roles.cache.some((role) =>
          Permissions.includes(role.id)
        )
      )
        return;

      const embed = new EmbedBuilder();
      addEmbedValue(embed, "setAuthor", author, authorUrl);
      addEmbedValue(embed, "setTitle", title);
      addEmbedValue(embed, "setDescription", description);
      addEmbedValue(embed, "setColor", color);
      addEmbedValue(embed, "setThumbnail", thumbnail);
      addEmbedValue(embed, "setImage", image);
      addEmbedValue(embed, "setFooter", footer, footerUrl);

      message.channel.send({ embeds: [embed] });
    });
  },
};
