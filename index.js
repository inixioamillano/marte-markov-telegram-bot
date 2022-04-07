const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
var pjson = require('./package.json');
const gTTS = require('gtts');
const fs = require('fs');
const workerpool = require('workerpool');
const connectAndGetSchema  = require('./mongo-connector');

require('dotenv').config();
const pool = workerpool.pool(__dirname + '/markov-generator.js');
console.log(`Hi! I'm MarTe (Markov Telegram) - v${pjson.version}`);

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const commands = [
    {
        command: '/talk',
        description: 'I talk'
    },
    {
        command: '/audio',
        description: 'I send you a voice message'
    },
    {
        command: '/commands',
        description: 'Get commands list'
    },
    {
        command: '/contribute',
        description: 'Contribute to this project with a small contribution'
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
    },{
        command: '/setfrequency',
        description: 'Set the talking frequency (default: once every 10 learnt messages)'
    },{
        command: '/sendsticker',
        description: 'I send a sticker'
    },{
        command: '/speech',
        description: 'Generate speech'
    },{
        command: '/quote',
        description: 'Generate a quote'
    }, {
        command: '/learn',
        description: 'Learns a .txt file'
    }
];

bot.setMyCommands(commands);

const MessageSchema = connectAndGetSchema();

const Message = new mongoose.model('Message', MessageSchema);

const Config = new mongoose.model('Config', {
    chatId: Number,
    frequency: Number
})

const Sticker = new mongoose.model('Sticker', {
    chatId: Number,
    file_id: String,
    count: Number
})

const generateMarkovMessage = async (chatId) => {
    markovResult = await pool.exec('markov', [chatId]);
    return markovResult.replace(new RegExp(`@${process.env.TELEGRAM_BOT_USER}`, 'g'), '');
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

const sendMarkovMessageAsAudio = (chatId, msgId) => {
    generateMarkovMessage(chatId)
    .then(text => {
        var gtts = new gTTS(text, 'es');
        const path = `audios/MarTe ${chatId}-${msgId}.mp3`;
        gtts.save(path, function (err, result){
            if(err) {
                bot.sendMessage(chatId, 'Sorry, something went wrong. Please, try again the command /audio');
                return;
            }
            bot.sendAudio(chatId, path, {title: 'MarTe'})
                .catch(err => {
                    bot.sendMessage(chatId, 'Sorry, something went wrong. Please, try again the command /audio');
                })
                .finally(() => {
                    fs.unlink(path, () => {
                        return;
                    });
                });
        });
    })
    .catch(e => {
        bot.sendMessage(chatId, 'Sorry, I need to learn more');
    });
}

const sendSticker = async (chatId) => {
    const stickers = await Sticker.find({chatId});
    if (stickers.length > 0){
        const rand = Math.floor(Math.random() * stickers.length);
        bot.sendSticker(chatId, stickers[rand].file_id);
        return true;
    }
    return false;
}

const generateSpeech = async (chatId, length) => {
    let speech = '';
    try{
        for (let i = 0; i < length; i++){
            const newPhrase = await generateMarkovMessage(chatId);
            speech = speech + newPhrase.replace(new RegExp(/\./, 'g'), '') + '. ';
        }
        return speech;
    } catch(e) {
        return speech.length > 0 ? speech : 'Sorry, I need to learn more'; 
    }
}

bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/') && !isRemoveOption(msg)){
        Message.create({
            text: msg.text.replace(new RegExp(`@${process.env.TELEGRAM_BOT_USER}`, 'g'), ''),
            chatId: msg.chat.id
        }, async (err, message) => {
            if (!err) {
                const config = await Config.findOne({chatId: message.chatId})
                const messages = await Message.find({chatId: message.chatId});
                if (messages.length === 666){
                    bot.sendMessage(message.chatId, 'I\'ve learnt 666 messages 😈')
                } else {
                    if (messages.length % (config ? config.frequency : 10) === 0) {
                        const rand = Math.random();
                        if (rand > 0.15){
                            sendMarkovMessage(message.chatId);
                        } else {
                            const sent = await sendSticker(msg.chat.id);
                            if (!sent){
                                sendMarkovMessage(message.chatId);
                            }
                        }
                    }
                }
            }
        });
    }
})

bot.onText(/\/talk/, (msg, match) => {
    sendMarkovMessage(msg.chat.id);
});

bot.onText(/\/audio/, (msg, match) => {
    sendMarkovMessageAsAudio(msg.chat.id, msg.message_id);
});

bot.onText(/\/speech/, async (msg, match) => {
    const length = Math.floor(Math.random() * 10);
    const speech = await generateSpeech(msg.chat.id, length);
    bot.sendMessage(msg.chat.id, speech);
})

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
            let deleted = await Message.deleteMany({chatId: msg.chat.id});
            deleted = deleted && await Sticker.deleteMany({chatId: msg.chat.id});
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
    bot.sendMessage(msg.chat.id, `I'm MarTe, I was created by <a href="https://twitter.com/inixiodev">@inixiodev</a>.`
        +` I'm pretty young (I'm ${pjson.version} versions old).` 
        + ` I live in a Raspb...\n\nOh, okay... You're worried about your privacy, right?`
        + ` I store messages in a database with no information about the author. Your messages are safely stored.\n\n`
        + `You can delete all the messages stored from this group with the /delete command\n\n`
        + `You can check my source code <a href="https://github.com/inixioamillano/marte-markov-telegram-bot">here</a>`
        + `\n\nSupport this project buying me a coffe at <a href="https://ko-fi.com/inixiodev/">Ko-Fi</a>`,
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
});

bot.onText(/\/setfrequency/, async (msg, match) => {
    const param = match.input.split(/\s+/)[1];
    const config = await Config.findOne({chatId: msg.chat.id});
    if (!param){
        bot.sendMessage(msg.chat.id, `Frequency is set to ${config ? config.frequency : 10}`);
    } else {
        if (!isNaN(param) && param > 0){
            Config.update({chatId: msg.chat.id}, {$set: {frequency: param}}, {upsert: true}, (err, config) => {
                if (!err) {
                    bot.sendMessage(msg.chat.id, `Frequency set to ${param}`);
                } else {
                    bot.sendMessage(msg.chat.id, 'Please, try again later');
                }
            })
        } else {
            bot.sendMessage(msg.chat.id, `Invalid param. Send /frequency <frequency in messages>`);
        }
        
    }
});

bot.on('sticker', (msg) => {
    Sticker.update({chatId: msg.chat.id, file_id: msg.sticker.file_id},
        {$inc: {count: 1}},
        {upsert: true}, (err, st) => {
            console.log(err ? 'Error learning sticker' : 'Sticker learnt');
        });
})

bot.on('dice', async (msg) => {
    const speech = await generateSpeech(msg.chat.id, msg.dice.value);
    bot.sendMessage(msg.chat.id, speech);
})

bot.onText(/\/sendsticker/, async (msg) => {
    const sent = await sendSticker(msg.chat.id)
    if (!sent) {
        bot.sendMessage(msg.chat.id, 'Sorry, I need to learn stickers first. Please, send me a sticker')
    }
})

bot.onText(/^\/quote/, async (msg, match) => {
    let author = match.input.replace(/^\/quote/, '');
    author = author.replace(`@${process.env.TELEGRAM_BOT_USER}`, '');
    if (!author){
        bot.sendMessage(msg.chat.id, 'Please, write /quote <author> to generate a quote\n\n'
            + 'Examples:\n\n/quote Obi-Wan Kenobi\n\n/quote Albert Einstein\n\n/quote @<user in this group>');
    } else {
        author = author.replace(/\s+/, '');    
        const message = await generateMarkovMessage(msg.chat.id);
        bot.sendMessage(msg.chat.id, `"${message}"\n\n-${author}`)
    }
})

bot.onText(/^\/learn/, async (msg, match) => {
    const chatId = msg.chat.id;

    if (!msg.reply_to_message) {
        bot.sendMessage(chatId, 'You have to quote a .txt sent file or send me one');
        return;
    }

    const document = msg.reply_to_message.document;

    if (document) {
        if (!isTxtFile(document)) {
            bot.sendMessage(msg.chat.id, 'Sorry, the file has to be in .txt format.');
            return;
        }
        askToLearnMessage(msg.reply_to_message);
    }
})

bot.on('document', async (msg) => {
    if (!isTxtFile(msg.document)) {
        bot.sendMessage(msg.chat.id, 'Sorry, the file has to be in .txt format.');
        return;
    }
    askToLearnMessage(msg);
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    switch (query.data) {
        case 'data1':
            bot.sendMessage(chatId, 'Alright, learning...');
            learnText(chatId, query.message.reply_to_message.document)
            break;
        case 'data2':
            bot.sendMessage(chatId, 'Okay, maybe next time.');
            break;
        default:
            break;
    }
    // Remove inline keyboard
    bot.deleteMessage(chatId, query.message.message_id);
});

const learnText = (chatId, document) => {
    const stream = bot.getFileStream(document.file_id);
    stream.on('data', (data) => {
        const chunk = data.toString();
        const result = chunk.match(/[^.?!]+[.!?]+[\])'"`’”]*/g);
        result.forEach(element => {
            Message.create({
                text: element.replace(new RegExp(`@${process.env.TELEGRAM_BOT_USER}`, 'g'), ''),
                chatId: chatId
            });
        });
    });
    bot.sendMessage(chatId, 'I have learned the text!');
}

const isTxtFile = (document) => {
    const extension = document.file_name.split('.').pop();
    if (extension !== 'txt')
        return false;
    return true;
}

const askToLearnMessage = (msg) => {
    const options = {
        'reply_to_message_id': msg.message_id,
        'reply_markup': {
            'inline_keyboard': [
                [
                    {
                        text: 'Yes',
                        callback_data: 'data1'
                    }
                ],
                [
                    {
                        text: 'No',
                        callback_data: 'data2'
                    }
                ],
            ]
        }
    }

    bot.sendMessage(msg.chat.id, 'Should I learn this text?', options);
}

bot.onText(/\/commands/, (msg, match) => {
    let text = `Available commands (v${pjson.version})\n\n`;
    commands.forEach(c => {
        text = text + `${c.command} - ${c.description}\n\n`
    })
    text = text + 'Try sending me the dice emoji. I\'ll send you a random speech depending on the result of the dice rolled';
    bot.sendMessage(msg.chat.id, text);
})

bot.onText(/\/contribute/, (msg, match) => {
    bot.sendInvoice(msg.chat.id, 'Support MarTe', 'Help to keep this project alive with a small contribution', 'MarTe', process.env.PAYMENT_TOKEN, null, 'EUR', [{
        label: 'MarTe | Contribution',
        amount: 100
    }])
})

bot.on('polling_error', (e) => console.log(e))