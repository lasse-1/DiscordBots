const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { getLocales, addEmbedValue } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-verify")
    .setDescription("Set up the Verify System")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   * @param {import('discord.js').Interaction} interaction
   */

  async execute(interaction) {
    const { guild, commandName, channel } = interaction;

    if (!guild || commandName !== "setup-verify") return;

    const locals = await getLocales();

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
      ButtonLabel,
      BottonEmoji,
    } = locals.VerifySystem.SetupMessage;

    const embed = new EmbedBuilder();
    addEmbedValue(embed, "setAuthor", author, authorUrl);
    addEmbedValue(embed, "setTitle", title);
    addEmbedValue(embed, "setDescription", description);
    addEmbedValue(embed, "setColor", color);
    addEmbedValue(embed, "setThumbnail", thumbnail);
    addEmbedValue(embed, "setImage", image);
    addEmbedValue(embed, "setFooter", footer, footerUrl);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verify-system")
        .setEmoji(BottonEmoji)
        .setLabel(ButtonLabel)
        .setStyle(ButtonStyle.Success)
    );

    channel.send({ components: [row], embeds: [embed] });
  },
};
