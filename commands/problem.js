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
          { name: "easy", value: "EASY" },
          { name: "medium", value: "MEDIUM" },
          { name: "hard", value: "HARD" }
        )
    ),

  async execute(interaction) {
    const difficulty = interaction.options.getString("difficulty");
    const problem = await getRandomProblem(difficulty);

    const embed = embedProblem(problem, "Random problem");
    await interaction.reply({ embeds: [embed] });
  },
};
