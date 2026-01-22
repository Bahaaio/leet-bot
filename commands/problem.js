const { SlashCommandBuilder } = require("discord.js");
const { getRandomProblem } = require("../src/api");
const { embedProblem } = require("../src/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("problem")
    .setDescription("Get a random leetcode problem")
    .addStringOption(option =>
      option
        .setName("difficulty")
        .setDescription("The difficulty of the random problem")
        .addChoices(
          { name: "easy", value: "Easy" },
          { name: "medium", value: "Medium" },
          { name: "hard", value: "Hard" }
        )
    ),

  async execute(interaction) {
    const difficulty = interaction.options.getString("difficulty");
    const problem = await getRandomProblem(difficulty);

    const embed = embedProblem(problem);
    await interaction.reply({ embeds: [embed] });
  },
};
