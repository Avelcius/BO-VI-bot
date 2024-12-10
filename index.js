const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Подключаем dotenv

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Получаем переменные из окружения
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Функция для рекурсивного обхода директорий
function loadCommands(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true });

    files.forEach(file => {
        const fullPath = path.join(directory, file.name);

        if (file.isDirectory()) {
            // Если это папка, рекурсивно вызываем функцию для загрузки файлов из подпапок
            loadCommands(fullPath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            // Если это файл .js, загружаем его как команду
            const command = require(fullPath);
            client.commands.set(command.data.name, command);
            commands.push(command.data);
        }
    });
}

// Запускаем функцию для загрузки всех команд
loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(token);
