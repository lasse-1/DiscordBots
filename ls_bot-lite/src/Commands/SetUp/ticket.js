const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { readConfig, getLocales, addEmbedValue } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Set up the Ticket System")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { guild, commandName, channel } = interaction;

    if (!guild || commandName !== "setup-ticket") return;

    const config = await readConfig();
    const locales = await getLocales();

    const options = config.TicketSystem.TicketOptions;
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
    } = locales.TicketSystem.SetupMessage;

    const embed = new EmbedBuilder();
    addEmbedValue(embed, "setAuthor", author, authorUrl);
    addEmbedValue(embed, "setTitle", title);
    addEmbedValue(embed, "setDescription", description);
    addEmbedValue(embed, "setColor", color);
    addEmbedValue(embed, "setThumbnail", thumbnail);
    addEmbedValue(embed, "setImage", image);
    addEmbedValue(embed, "setFooter", footer, footerUrl);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("ticket-system")
      .setPlaceholder("Select a ticket option");

    const encounteredValues = new Set();

    options.forEach((option) => {
      const { label, emoji, value, description } = option;

      if (encounteredValues.has(value)) {
        const errorMessage = `Duplicate value: ${value}`;
        const errorEmbed = new EmbedBuilder().setDescription(errorMessage);
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      encounteredValues.add(value);

      const optionObject = { label, value };

      if (emoji) {
        optionObject.emoji = emoji;
      }

      if (description) {
        optionObject.description = description;
      }

      selectMenu.addOptions(optionObject);
    });

    const row = new ActionRowBuilder().addComponents(selectMenu);

    channel.send({ components: [row], embeds: [embed] });
  },
};
