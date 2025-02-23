const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { readConfig, getLocales } = require("ls_bots.js");
const {
  createTicket,
  closeTicket,
  deleteTicket,
} = require("../../Functions/ticketsystem");
const discordTranscripts = require("discord-html-transcripts");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { customId, user, channel, componentType } = interaction;
    const config = await readConfig();
    const locals = await getLocales(interaction);

    if (componentType === 3 && customId === "ticket-system") {
      const options = config.TicketSystem.TicketOptions;
      const selectedValue = interaction.values[0];

      options.forEach((option) => {
        const { value, categoryId, ticketName, OpenMessage } = option;
        if (selectedValue === value) {
          channelName = `${ticketName}${user.username}`;
          createTicket(interaction, categoryId, channelName, OpenMessage);
        }
      });
    } else if (componentType === 2) {
      if (customId === "ticket_close") {
        await interaction.deferUpdate();

        if (config.TicketSystem.Advanced) {
          closeTicket(interaction);
        } else {
          deleteTicket(interaction);
        }
      } else if (customId === "ticket_delete") {
        deleteTicket(interaction);
      } else if (customId === "ticket_reopen") {
        await interaction.deferUpdate();

        const members = channel.members;

        for (const [, member] of members) {
          if (!member.user.bot) {
            await channel.permissionOverwrites.create(member.user.id, {
              ViewChannel: true,
              SendMessages: true,
            });
          }
        }

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setEmoji("🔒")
            .setLabel(locals.TicketSystem.Buttons.CloseTicket)
            .setStyle(ButtonStyle.Danger)
        );

        interaction.message.edit({ components: [row] });
      } else if (customId === "ticket_transcript") {
        await interaction.deferUpdate();

        const attachment = await discordTranscripts.createTranscript(channel);
        const dmChannel = await user.createDM();
        dmChannel.send({ files: [attachment] }).catch();
      }
    }
  },
};
