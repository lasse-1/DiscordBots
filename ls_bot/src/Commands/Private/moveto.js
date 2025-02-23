const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { readConfig, addEmbedValue } = require("ls_bots.js");
const { checkIfTicket } = require("../../Functions/index");

let config = readConfig();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-move")
    .setDescription("Move a Ticket to a Category")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("The category the Ticket will be moved to")
        .addChoices(
          ...config.TicketSystem.MoveOptions.map((option) => ({
            name: option.name,
            value: option.name,
          }))
        )
        .setRequired(true)
    ),
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { options, guild, commandName, channel } = interaction;
    if (!guild || commandName !== "ticket-move") return;

    await interaction.deferReply({ ephemeral: true });

    const checkTicket = await checkIfTicket(interaction);
    if (!checkTicket) return;

    const category = options.getString("category");
    const moveOptions = config.TicketSystem.MoveOptions;
    const selectedOption = moveOptions.find(
      (option) => option.name === category
    );

    if (
      channel.setParent(selectedOption.categoryId, {
        lockPermissions: false,
        reason: "Chennel moved by /ticket-move",
      })
    ) {
      const {
        author,
        authorUrl,
        title,
        description,
        color,
        image,
        thumbnail,
        footer,
        footerUrl,
      } = selectedOption;

      const embed = new EmbedBuilder();
      addEmbedValue(embed, "setAuthor", author, authorUrl);
      addEmbedValue(embed, "setTitle", title);
      addEmbedValue(embed, "setDescription", description);
      addEmbedValue(embed, "setColor", color);
      addEmbedValue(embed, "setImage", image);
      addEmbedValue(embed, "setThumbnail", thumbnail);
      addEmbedValue(embed, "setFooter", footer, footerUrl);

      await interaction.deleteReply();
      channel.send({ embeds: [embed] });
    }

    if (
      selectedOption.categoryId !==
      config.TicketSystem.ReviewSystem.MoveOptionCategoryId
    )
      return;
    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket-review")
        .setPlaceholder("Bewertung")
        .setOptions(
          {
            label: "⭐⭐⭐⭐⭐",
            value: "⭐⭐⭐⭐⭐",
          },
          {
            label: "⭐⭐⭐⭐",
            value: "⭐⭐⭐⭐",
          },
          {
            label: "⭐⭐⭐",
            value: "⭐⭐⭐",
          },
          {
            label: "⭐⭐",
            value: "⭐⭐",
          },
          {
            label: "⭐",
            value: "⭐",
          }
        )
    );
    channel.send({
      components: [selectMenu],
    });
  },
};
