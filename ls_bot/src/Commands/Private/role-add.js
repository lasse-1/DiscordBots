const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { readConfig } = require("ls_bots.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-all")
    .setDescription("Action with all roles")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a role to all members")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to add to all members")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a role from all members")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to remove from all members")
            .setRequired(true)
        )
    ),

  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    const { options, guild, commandName } = interaction;
    const config = await readConfig();

    if (!guild || commandName !== "role-all") return;
    await interaction.deferReply();

    const role = options.getRole("role");
    const batchSize = 20;

    if (options.getSubcommand() === "add") {
      const members = await guild.members.fetch();
      const totalMembers = members.size;

      const embed = new EmbedBuilder()
        .setColor(config.GeneralEmbedColor || "Random")
        .setDescription(`Adding the ${role} role to all users.`);

      const message = await interaction.editReply({ embeds: [embed] });

      let progress = 0;
      let addedUsers = [];

      for (const member of members.values()) {
        // Überprüfe, ob das Mitglied ein Bot ist
        if (!member.user.bot && !member.roles.cache.has(role.id)) {
          try {
            await member.roles.add(role);
            addedUsers.push(member.user.tag);
          } catch (err) {
            await interaction.editReply({
              content: "Fehler beim Hinzufügen der Rolle " + role,
              embeds: [],
            });
            return;
          }
        }

        addedUsers = addedUsers.slice(-batchSize);

        embed.setDescription(
          `Adding ${role} role to all users\n\`\`\`${addedUsers.join(
            "\n"
          )}\`\`\``
        );

        progress++;

        embed.setFooter({
          text: `Progress: ${Math.min(
            progress,
            totalMembers
          )} / ${totalMembers}`,
        });

        await message.edit({ embeds: [embed] });
      }

      embed.setDescription(`Added the ${role} role to all users.`);

      await message.edit({ embeds: [embed] });
    } else if (options.getSubcommand() === "remove") {
      const members = await guild.members.fetch();
      const totalMembers = members.size;

      const embed = new EmbedBuilder()
        .setColor(config.GeneralEmbedColor || "Random")
        .setDescription(`Removing the ${role} role from all users.`);

      const message = await interaction.editReply({ embeds: [embed] });

      let progress = 0;
      let removedUsers = [];

      for (const member of members.values()) {
        if (!member.user.bot && member.roles.cache.has(role.id)) {
          try {
            await member.roles.remove(role);
            removedUsers.push(member.user.tag);
          } catch (err) {
            await interaction.editReply({
              content: "Fehler beim Entfernen der Rolle " + role,
              embeds: [],
            });
            return;
          }
        }

        removedUsers = removedUsers.slice(-batchSize);

        embed.setDescription(
          `Removing ${role} role from all users\n\`\`\`${removedUsers.join(
            "\n"
          )}\`\`\``
        );

        progress++;

        embed.setFooter({
          text: `Progress: ${Math.min(
            progress,
            totalMembers
          )} / ${totalMembers}`,
        });

        await message.edit({ embeds: [embed] });
      }

      embed.setDescription(`Removed the ${role} role to all users.`);
      await message.edit({ embeds: [embed] });
    }
  },
};
