const { EmbedBuilder } = require("discord.js");
const { readConfig, getLocales, addEmbedValue } = require("ls_bots.js");

module.exports = {
  name: "guildMemberAdd",
  /**
   * @param {import("discord.js").GuildMember} member
   */
  async execute(member) {
    const config = await readConfig();
    const locals = await getLocales();
    const channel = member.guild.channels.cache.get(
      config.WelcomeSystem.ChannelId
    );

    if (!channel) return;

    const replacePlaceholders = (template, member) => {
      return template
        .replace(/%username%/g, member.user.username)
        .replace(/%user%/g, member.user)
        .replace(/%userAvatar%/g, member.displayAvatarURL());
    };

    const placeholdersToReplace = [
      "author",
      "authorUrl",
      "title",
      "description",
      "color",
      "thumbnail",
      "image",
      "footer",
      "footerUrl",
    ];

    const replacedValues = {};

    placeholdersToReplace.forEach((placeholder) => {
      replacedValues[placeholder] = replacePlaceholders(
        locals.WelcomeMessage[placeholder],
        member
      );
    });

    const {
      author,
      authorUrl,
      title,
      description,
      color,
      thumbnail,
      image,
      footer,
      footerUrl,
    } = replacedValues;

    const embed = new EmbedBuilder();
    addEmbedValue(embed, "setAuthor", author, authorUrl);
    addEmbedValue(embed, "setTitle", title);
    addEmbedValue(embed, "setDescription", description);
    addEmbedValue(embed, "setColor", color);
    addEmbedValue(embed, "setThumbnail", thumbnail);
    addEmbedValue(embed, "setImage", image);
    addEmbedValue(embed, "setFooter", footer, footerUrl);

    if (config.WelcomeSystem.AddRoleId) {
      member.roles.add(config.WelcomeSystem.AddRoleId);
    }
    return channel.send({ embeds: [embed] });
  },
};
