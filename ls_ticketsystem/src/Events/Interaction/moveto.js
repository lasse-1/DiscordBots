const {
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  EmbedBuilder,
} = require("discord.js");
const { addEmbedValue, readConfig, getLocales } = require("ls_bots.js");

const selectedValues = {};

module.exports = {
  name: "interactionCreate",
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { customId, fields, user, channel } = interaction;
    const config = await readConfig();
    const locals = await getLocales(interaction);
    if (customId === "ticket-review") {
      selectedValues[interaction.user.id] = interaction.values[0];

      const modal = new ModalBuilder()
        .setTitle(locals.TicketSystem.Review.Modal.Title)
        .setCustomId("review_modal")
        .addComponents([
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("review_input")
              .setLabel(locals.TicketSystem.Review.Modal.Label)
              .setRequired(false)
              .setStyle(TextInputStyle.Paragraph)
              .setMaxLength(4000)
          ),
        ]);

      await interaction.showModal(modal);
    } else if (
      (interaction.type =
        InteractionType.ModalSubmit && customId === "review_modal")
    ) {
      const reviewInput =
        fields.getTextInputValue("review_input") ||
        locals.TicketSystem.Review.NoReviewMessage;
      const ratingSelected = selectedValues[interaction.user.id];
      const allMessages = [];

      let lastMessageId = null;
      let messages;
      let messageCount = 0;

      do {
        messages = await channel.messages.fetch({
          limit: 100,
          ...(lastMessageId && { before: lastMessageId }),
        });

        allMessages.push(...messages.values());
        messageCount += messages.size;

        lastMessageId = messages.last()?.id;
      } while (messages.size === 100);

      const sendChannel = interaction.guild.channels.cache.get(
        config.TicketSystem.ReviewSystem.ReviewChannelId
      );
      const infoDescription =
        locals.TicketSystem.Review.Embed.InfoDescription.replace(
          "%messageCount%",
          messageCount
        );
      const reviewDescription =
        locals.TicketSystem.Review.Embed.ReviewDescription.replace(
          "%rating%",
          ratingSelected
        ).replace("%ratingText%", reviewInput);

      const embed = new EmbedBuilder().addFields(
        {
          name: locals.TicketSystem.Review.Embed.InfoTitle,
          value: infoDescription,
          inline: false,
        },
        {
          name: locals.TicketSystem.Review.Embed.ReviewTitle,
          value: reviewDescription,
          inline: false,
        }
      );

      const { author, authorUrl, title, description, color, image } =
        locals.TicketSystem.Review.Embed;

      addEmbedValue(embed, "setAuthor", author, authorUrl);
      addEmbedValue(embed, "setTitle", title);
      addEmbedValue(embed, "setDescription", description);
      addEmbedValue(embed, "setColor", color);
      addEmbedValue(embed, "setImage", image);

      addEmbedValue(embed, "setFooter", user.tag, user.avatarURL());
      addEmbedValue(embed, "setThumbnail", user.avatarURL());

      await interaction.deferUpdate();

      if (!sendChannel) return;
      return sendChannel.send({ embeds: [embed] });
    }
  },
};
