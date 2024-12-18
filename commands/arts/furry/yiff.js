const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // dynamic import for node-fetch

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yiff')
        .setDescription('Получить случайный пост с e621 с тегами')
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Теги для поиска (разделяйте запятыми)')),
   
    async execute(interaction) {
        console.log('Команда выполнена');

        await interaction.deferReply(); // Деферируем ответ

        // Получаем теги из команды
        const tagsInput = interaction.options.getString('tags') || '';
        const tags = tagsInput.replace(/,/g, '+'); // Заменяем запятые на '+'

        const fetchRandomPost = async () => {
            try {
                const response = await fetch(`https://e621.net/posts.json?tags=${tags}&limit=1`, {
                    headers: {
                        'User-Agent': 'DiscordBot/1.0 (by your-username on e926)', 
                        'Accept': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.posts || data.posts.length === 0) {
                    return null; // Если постов с указанными тегами нет
                }

                // Возвращаем первый пост
                return data.posts[0];
            } catch (error) {
                console.error('Ошибка при запросе к e926:', error.message);
                return null;
            }
        };

        let post = await fetchRandomPost();

        // Повторная попытка запроса в случае ошибки
        if (!post) {
            return await interaction.editReply('Посты с указанными тегами не найдены.');
        }

        const postUrl = `https://e621.net/posts/${post.id}`;

        // Создаем Embed с данными поста
        const embed = new EmbedBuilder()
            .setTitle(`Пост ID: ${post.id}`)
            .setURL(postUrl)
            .setImage(post.file.url)
            .setColor('#FF4500')
            .setFooter({ text: `Теги: ${tagsInput || 'нет'}` });

        await interaction.editReply({ embeds: [embed] });
    },
};
