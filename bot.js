const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // Load environment variables

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Your configuration - all from environment variables
const YOUR_USER_ID = process.env.YOUR_USER_ID;
const COMMAND_CHANNEL_ID = process.env.COMMAND_CHANNEL_ID; // Your private channel where you type
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID; // Where bot posts
const BOT_TOKEN = process.env.BOT_TOKEN; // Gets token from environment variable

// Check that all required environment variables are set
if (!BOT_TOKEN || !YOUR_USER_ID || !COMMAND_CHANNEL_ID || !TARGET_CHANNEL_ID) {
    console.error('❌ Missing required environment variables! Check your .env file.');
    console.error('Required: BOT_TOKEN, YOUR_USER_ID, COMMAND_CHANNEL_ID, TARGET_CHANNEL_ID');
    process.exit(1);
}

client.on('ready', () => {
    console.log(`Bot is online as ${client.user.tag}!`);
    console.log('Type in your command channel and I\'ll post it to your target channel!');
});

client.on('messageCreate', async (message) => {
    // Debug: Log all messages the bot receives
    console.log(`Received message from ${message.author.tag} (ID: ${message.author.id})`);
    console.log(`Channel ID: ${message.channel.id}`);
    console.log(`Message content: "${message.content}"`);
    console.log(`Is bot: ${message.author.bot}`);
    console.log('---');
    
    // Check if it's from you in the command channel
    if (message.author.id === YOUR_USER_ID && 
        message.channel.id === COMMAND_CHANNEL_ID &&
        !message.author.bot) {
        
        console.log('✓ Message from you in command channel! Forwarding...');
        
        try {
            const targetChannel = client.channels.cache.get(TARGET_CHANNEL_ID);
            if (targetChannel) {
                // Forward your message to the target channel
                await targetChannel.send(message.content);
                console.log(`✓ Message forwarded: ${message.content}`);
                
                // React to your message to confirm it was sent
                await message.react('✅');
                
                // Optional: Delete your original message for privacy
                // await message.delete();
            } else {
                console.log('❌ Target channel not found!');
                console.log('Available channels:', client.channels.cache.map(c => `${c.name} (${c.id})`));
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    } else {
        console.log('✗ Message does not match criteria');
    }
});

client.on('error', console.error);

client.login(BOT_TOKEN);