module.exports = {
    data: {
        name: 'hello',
        description: 'Replies with Hello there!',
    },
    async execute(interaction) {
        await interaction.reply('Hello there!');
    },
};
