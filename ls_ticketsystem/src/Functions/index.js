const { readConfig } = require("ls_bots.js");

async function checkIfTicket(interaction) {
  const config = readConfig();
  const allowedCategoryIds = [
    ...config.TicketSystem.MoveOptions.map((option) => option.categoryId),
    ...config.TicketSystem.TicketOptions.map((option) => option.categoryId),
  ];
  if (!allowedCategoryIds.includes(interaction.channel.parentId)) {
    await interaction.editReply({
      content: "This Command is not allowed in this category",
    });
    return false;
  }
  return true;
}

module.exports = {
  checkIfTicket,
};
