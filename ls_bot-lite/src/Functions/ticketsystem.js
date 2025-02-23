const {
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const {
  createLog,
  readConfig,
  getLocales,
  addEmbedValue,
} = require("ls_bots.js");
const discordTranscripts = require("discord-html-transcripts");

/**
 * @param {import('discord.js').Interaction} interaction
 */
async function createTicket(interaction, category, ticketName, openEmbed) {
  const config = await readConfig();
  const locals = await getLocales(interaction);

  const { guild, user } = interaction;
  await interaction.deferReply({ ephemeral: true });

  const channel = await guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    parent: category,
  });

  await channel.permissionOverwrites.create(interaction.member.id, {
    ViewChannel: true,
    SendMessages: true,
  });

  const ticketCreated = new EmbedBuilder()
    .setDescription(
      `**Ticket erstellt**!\nDu hast erfolgreich ein Ticket erstellt: <#${channel.id}>`
    )
    .setColor("Green");

  await interaction.editReply({ embeds: [ticketCreated], ephemeral: true });

  createLog({
    interaction: interaction,
    channelId: config.Logs.TicketCreated,
    title: "New Ticket created",
    description: `${user} has created a new Ticket with the following information: \n Category: ${category}\n Date: ${Date.now()} \n Username: ${
      user.username
    }`,
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
  } = openEmbed;

  const embed = new EmbedBuilder();
  addEmbedValue(embed, "setAuthor", author, authorUrl);
  addEmbedValue(
    embed,
    "setTitle",
    title.replace("%username%", interaction.user.username)
  );
  addEmbedValue(
    embed,
    "setDescription",
    description
      .replace("%username%", interaction.user.username)
      .replace("%user%", interaction.user)
  );
  addEmbedValue(embed, "setColor", color);
  addEmbedValue(embed, "setThumbnail", thumbnail);
  addEmbedValue(embed, "setImage", image);
  addEmbedValue(embed, "setFooter", footer, footerUrl);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setEmoji("🔒")
      .setLabel(locals.TicketSystem.Buttons.CloseTicket)
      .setStyle(ButtonStyle.Danger)
  );

  const message = await channel.send({ embeds: [embed], components: [row] });
  await message.pin();
}

async function closeTicket(interaction) {
  const locals = await getLocales(interaction);

  const members = interaction.channel.members;

  for (const [, member] of members) {
    if (!member.user.bot) {
      await interaction.channel.permissionOverwrites.create(member.user.id, {
        ViewChannel: true,
        SendMessages: false,
        AddReactions: true,
        AttachFiles: true,
      });
    }
  }
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_reopen")
        .setEmoji("✅")
        .setLabel(locals.TicketSystem.Buttons.ReopenTicket)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_transcript")
        .setEmoji("📄")
        .setLabel(locals.TicketSystem.Buttons.Transcript)
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_delete")
        .setEmoji("🗑️")
        .setLabel(locals.TicketSystem.Buttons.DeleteTicket)
        .setStyle(ButtonStyle.Danger)
    );

  interaction.message.edit({ components: [row] });
}

async function deleteTicket(interaction) {
  const config = await readConfig();

  const { channel, guild } = interaction;

  interaction.message.edit({ components: [] });

  createLog({
    interaction: interaction,
    channelId: config.Logs.TicketDeleted,
    title: "Ticket Deleted",
    description: `${interaction.user} has deleted the ticket: Ticketname: ${
      channel.name
    }\n Date: ${Date.now()}`,
  });

  const attachment = await discordTranscripts.createTranscript(channel);

  const transcriptChannel = guild.channels.cache.get(config.Logs.Transcripts);
  if (transcriptChannel) {
    transcriptChannel.send({
      content: `Transcript from channel: ${channel.name}`,
      files: [attachment],
    });
  }
  await interaction.deferUpdate();

  setTimeout(async () => {
    await channel.delete().catch(() => {
      return;
    });
  }, 3000);
}

module.exports = {
  createTicket,
  closeTicket,
  deleteTicket,
};
