const {
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const {
  readConfig,
  addEmbedValue,
  getLocales,
  createLog,
} = require("ls_bots.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {import('discord.js').Interaction} interaction
   */

  async execute(interaction) {
    const { customId, user, member, componentType } = interaction;
    const config = await readConfig();
    const locals = await getLocales(interaction);

    if (componentType !== 2 || customId !== "verify-system") return;
    await interaction.deferReply({ ephemeral: true });

    if (interaction.member.roles.cache.has(config.VerifySystem.Role))
      return interaction.editReply({
        content: locals.VerifySystem.Messages.AlreadyVerified,
      });

    await member.roles.add(config.VerifySystem.Role);

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
    } = locals.VerifySystem.SuccessMessage;

    const embed = new EmbedBuilder();
    addEmbedValue(embed, "setAuthor", author, authorUrl);
    addEmbedValue(embed, "setTitle", title);
    addEmbedValue(embed, "setDescription", description);
    addEmbedValue(embed, "setColor", color);
    addEmbedValue(embed, "setThumbnail", thumbnail);
    addEmbedValue(embed, "setImage", image);
    addEmbedValue(embed, "setFooter", footer, footerUrl);

    await interaction.editReply({ embeds: [embed] });

    createLog({
      interaction: interaction,
      channelId: config.Logs.Verify,
      title: "Verification",
      description: `${user} Successfully verified`,
    });
  },
};
