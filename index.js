const MarkovGen = require('markov-generator');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
var pjson = require('./package.json');

require('dotenv').config();

console.log(`Hi! I'm MarTe (Markov Telegram) - v${pjson.version}`);

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

bot.setMyCommands([
    {
        command: '/talk',
        description: 'I talk'
    },
    {
        command: '/stats',
        description: 'I send you the number of learnt messages'
    },
    {
        command: '/help',
        description: 'I give you basic info about me'
    },{
        command: '/delete',
        description: 'Forget all the messages learnt from this group'
    },{
        command: '/fixme',
        description: 'Use this command if I stop sending automatic messages'
    }
])

console.log("Okay, let's see what I've learnt...")

mongoose.connect(`mongodb://${process.env.DB_HOST}:27017/martebot`, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Interesting..."))
.catch(() => console.log("Whoops... Something went wrong..."));

const MessageSchema = new mongoose.Schema({ 
    text: String, 
    chatId: Number 
});

MessageSchema.plugin(mongooseFieldEncryption, { fields: ["text"], secret: process.env.ENCRYPT_KEY });

const Message = new mongoose.model('Message', MessageSchema);

const generateMarkovMessage = async (chatId) => {
    const messages = await Message.find({chatId});
    const input = messages.map(m => {
        return m.text;
    });
    let markov = new MarkovGen({
        input: input
    });
    return markov.makeChain();
}

const sendMarkovMessage = (chatId) => {
    generateMarkovMessage(chatId)
    .then(text => {
        bot.sendMessage(chatId, text);
    })
    .catch(e => {
        bot.sendMessage(chatId, 'Sorry, I need to learn more');
    });
}

bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/') && !isRemoveOption(msg)){
        Message.create({
            text: msg.text,
            chatId: msg.chat.id
        }, async (err, message) => {
            if (!err) {
                const messages = await Message.find({chatId: message.chatId});
                if (messages.length % 10 === 0) {
                    sendMarkovMessage(message.chatId);
                }
            }
        });
    }
})

bot.onText(/\/talk/, (msg, match) => {
    sendMarkovMessage(msg.chat.id);
});

bot.onText(/\/stats/, async (msg, match) => {
    const messages = await Message.find({chatId: msg.chat.id});
    bot.sendMessage(msg.chat.id, `I've learnt ${messages.length} messages`);
});

bot.onText(/\/delete/, async (msg, match) => {
    bot.sendMessage(msg.chat.id, 'Are you sure you want to delete all the learnt messages?', {
        reply_markup: {
            keyboard: [["Yes"], ["No"]],
            remove_keyboard: true
        }
    })
})

const isRemoveOption = (msg) => {
    return msg.reply_to_message && msg.reply_to_message.from.username === process.env.TELEGRAM_BOT_USER 
    && msg.reply_to_message.text === 'Are you sure you want to delete all the learnt messages?';
}

bot.onText(/^Yes$|^No$/, async (msg, match) => {
    if (isRemoveOption(msg)){
        if (msg.text === 'Yes'){
            const deleted = await Message.deleteMany({chatId: msg.chat.id});
            bot.sendMessage(msg.chat.id, 
                deleted ? 'Messages successfully deleted' : 'Something wnet wrong, try again later', {
                reply_markup: {
                    remove_keyboard: true    
                }
            });
        }
        if (msg.text === 'No'){
            bot.sendMessage(msg.chat.id, 'Great! It took me a while to learn all these messages...', {
                reply_markup: {
                    remove_keyboard: true    
                }
            });
        }
    }
})

bot.onText(/\/help/, async (msg, match) => {
    bot.sendMessage(msg.chat.id, `I'm MarTe, I was created by @inixiodev. I'm pretty young (I'm ${pjson.version} versions old).` 
        + ` I live in a Raspb...\n\nOh, okay... You're worried about your privacy, right?`
        + ` I store messages in a database with no information about the author. Your messages are safely stored.\n\n`
        + `You can delete all the messages stored from this group with the /delete command\n\n`
        + `You can check my source code <a href="https://github.com/inixioamillano/marte-markov-telegram-bot">here</a>`,
    {
        parse_mode: 'HTML'
    });
});

bot.onText(new RegExp(`@${process.env.TELEGRAM_BOT_USER}`, 'g'), async (msg, match) => {
    if (!msg.text.startsWith('/') && !isRemoveOption(msg)) {
        generateMarkovMessage(msg.chat.id)
        .then((message) => {
            bot.sendMessage(msg.chat.id, message, {
                reply_to_message_id: msg.message_id
            });
        })
        .catch(e => {
            bot.sendMessage(msg.chat.id, 'Sorry, I need to learn more', {
                reply_to_message_id: msg.message_id
            });
        })
    }
});

bot.onText(/\/fixme/, (msg, match) => {
    bot.sendMessage(msg.chat.id, 'Delete me from this group and add me again.'
        + ' I\'ll remember every message I learnt');
})

bot.on('polling_error', (e) => console.log(e))