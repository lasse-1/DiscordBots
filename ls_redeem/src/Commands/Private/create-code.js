const { SlashCommandBuilder } = require("discord.js");
const { readConfig } = require("ls_bots.js");
const { createRedeem, genCode } = require("../../Functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-code")
    .setDescription("Create a redemption code")
    .addSubcommand((sub) =>
      sub
        .setName("car")
        .setDescription("Create a redemption code for a vehicle")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Specify the vehicle's name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("plate")
            .setDescription("Specify the vehicle's license plate")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("item")
        .setDescription("Create a redemption code for an item")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Specify the item's name")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("quantity")
            .setDescription("Specify the quantity of items")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("weapon")
        .setDescription("Create a redemption code for a weapon")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Specify the weapon's name")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("ammunition")
            .setDescription("Specify the number of ammunition")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("money")
        .setDescription("Create a redemption code for money")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Specify the type of money")
            .addChoices(
              {
                name: "Cash",
                value: "cash",
              },
              {
                name: "Bank Money",
                value: "bank",
              },
              {
                name: "Black Money",
                value: "black_money",
              }
            )
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("quantity")
            .setDescription("Specify the amount of money")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const { guild, commandName, options } = interaction;
    const subcommand = options.getSubcommand();

    if (!guild || commandName !== "create-code") return;

    await interaction.deferReply();

    const config = await readConfig();
    const name = options.getString("name");
    const type = options.getString("type");
    const quantity = options.getInteger("quantity") || null;
    const plate = options.getString("plate") || null;
    const code = await genCode();

    if (subcommand === "car") {
      const options = {
        code: code,
        name: name,
        type: "car",
        quantity: quantity,
        plate: plate,
      };
      await createRedeem(interaction, options);
    } else if (subcommand === "item") {
      const options = {
        code: code,
        name: name,
        type: "item",
        quantity: quantity,
      };
      await createRedeem(interaction, options);
    } else if (subcommand === "weapon") {
      const options = {
        code: code,
        name: name,
        type: "weapon",
        quantity: quantity,
      };
      await createRedeem(interaction, options);
    } else if (subcommand === "money") {
      const typeMap = {
        cash: config.MoneyNames.Cash,
        bank: config.MoneyNames.BankMoney,
        black_money: config.MoneyNames.BlackMoney,
      };

      const configType = typeMap[type];

      const options = {
        code: code,
        name: configType,
        type: "money",
        quantity: quantity,
      };
      await createRedeem(interaction, options);
    }
  },
};
