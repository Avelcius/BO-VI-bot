const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r34')
        .setDescription('Получить случайный пост с R34 с тегами')
        .addStringOption(option =>
            option.setName('tags')
                .setDescription('Теги для поиска (разделяйте запятыми)'))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Максимальное количество постов для получения (по умолчанию 1)'))
        .addIntegerOption(option =>
            option.setName('max_pid')
                .setDescription('Максимальное число страниц для генерации случайной страницы (по умолчанию 0)'))
        .addBooleanOption(option =>
            option.setName('deleted')
                .setDescription('Показать удалённые посты (по умолчанию нет)')),

    async execute(interaction) {
        // Устанавливаем значения по умолчанию
        const tags = interaction.options.getString('tags') ? interaction.options.getString('tags').replace(/,/g, '+') : 'p'; // по умолчанию 'p'
        const limit = interaction.options.getInteger('limit') || 200000; // по умолчанию 1
        const maxPid = interaction.options.getInteger('max_pid') || 0; // по умолчанию 9
        const deleted = interaction.options.getBoolean('deleted') ? 'show' : 'hide'; // по умолчанию 'hide'

        // Генерация случайного номера страницы
        const randomPid = Math.floor(Math.random() * (maxPid + 1));

        // Заменяем 'p' на 'default' для отображения в сообщении
        const displayTags = tags === 'p' ? 'default' : tags;

        const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${limit}&pid=${randomPid}&deleted=${deleted}&tags=${tags}`;

        try {
            // Делаем запрос к R34 API
            const response = await axios.get(url);

            // Проверяем, есть ли посты
            if (response.data.length > 0) {
                // Случайный выбор поста
                const randomIndex = Math.floor(Math.random() * response.data.length);
                const post = response.data[randomIndex];
                const postUrl = `https://rule34.xxx/index.php?page=post&s=view&id=${post.id}`;
                
                // Отправляем сообщение с постом
                await interaction.reply({
                    content: `Вот случайный пост с тегами \`${displayTags}\`\n[Посмотреть пост](${postUrl})\n![Пост изображение](${post.file_url})`,
                    ephemeral: false
                });
            } else {
                await interaction.reply({ content: 'Посты не найдены для указанных тегов.', ephemeral: true });
            }
        } catch (error) {
            console.error('Ошибка при получении поста:', error);
            await interaction.reply({ content: 'Произошла ошибка при обращении к R34.', ephemeral: true });
        }
    },
};
