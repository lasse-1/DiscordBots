const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { addEmbedValue, getLocales } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Ticket option Commands")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a user to the ticket")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to add to the ticket")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a user from the ticket")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to remove from the ticket")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("rename")
        .setDescription("Rename the ticket name")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The new Ticket name")
            .setRequired(true)
        )
    ),

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { options, channel, guild, commandName, user } = interaction;
    const locals = await getLocales();
    const { description_1, description_2, description_3 } =
      locals.TicketSystem.TicketActions;

    if (!guild || commandName !== "ticket") return;
    await interaction.deferReply();

    if (options.getSubcommand() === "add") {
      const user = options.getUser("user");
      modifyChannelPermissions(channel, user, true, true);
    } else if (options.getSubcommand() === "remove") {
      const user = options.getUser("user");
      modifyChannelPermissions(channel, user, false, false);
    } else if (options.getSubcommand() === "rename") {
      const name = options.getString("name");
      const description = description_3
        .replace("%newName%", channel.name)
        .replace("%user%", user);
      channel.setName(name);

      interaction.editReply(description);
    }

    async function modifyChannelPermissions(
      channel,
      user,
      allowView,
      allowSendMessages
    ) {
      channel.permissionOverwrites
        .create(user, {
          ViewChannel: allowView,
          SendMessages: allowSendMessages,
        })
        .then(() => {
          const description1 = description_1.replace("%target%", user);
          const description2 = description_2.replace("%target%", user);
          const embed = new EmbedBuilder();
          addEmbedValue(
            embed,
            "setDescription",
            `${allowView ? description1 : description2}`
          );
          interaction.editReply({ embeds: [embed] });
        });
    }
  },
};
