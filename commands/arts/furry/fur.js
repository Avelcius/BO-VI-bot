const { EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Динамический импорт для node-fetch
//api   mndeA4sQ21DiE6TZWPgSRBvF
const username = "Avelc";
const apiKey = "mndeA4sQ21DiE6TZWPgSRBvF"; // Not an actual API key lol
const e621Tags = [];


module.exports = {
    data: {
        name: 'fur',
        description: 'Get a random post from e926 based on preset tags.',
    },
    async execute(interaction) {
        console.log('Command executed');
        if (!interaction.channel.nsfw) {
            return await interaction.reply('This command can only be used in NSFW channels.');
        }

        await interaction.deferReply(); // Деферируем ответ, чтобы избежать ошибки unknown interaction

        const fetchRandomPost = async () => {
            try {
                const response = await fetch(`https://e926.net/posts/random.json?rating="s"}`, {
                    headers: {
                        'User-Agent': 'MyProject/1.0', // Замените your_e621_username на ваш логин на e621
                        'Accept': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error(`Expected JSON but got: ${contentType}`);
                }

                const data = await response.json();
                console.log('Fetched data:', data); // Логируем данные для отладки
                return data.post;
            } catch (error) {
                console.error('Error fetching posts from e621:', error.message);
                return null;
            }
        };

        let post = await fetchRandomPost();

        // Повторная попытка запроса в случае ошибки
        if (!post) {
            console.log('Retrying request...');
            post = await fetchRandomPost();
        }

        if (!post) {
            return await interaction.editReply('No post found with the specified tags.');
        }

        const postUrl = `https://e926.net/posts/${post.id}}`;

        // Логируем ссылку на пост в консоль
        console.log(`Selected post: ${postUrl}`);

        const embed = new EmbedBuilder()
            .setTitle(`Post ID: ${post.id}`)
            .setURL(postUrl)
            .setImage(post.file.url)
            .setColor('#FF4500');

        await interaction.editReply({ embeds: [embed] });
    },
};

