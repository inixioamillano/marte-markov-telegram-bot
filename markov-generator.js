const MarkovGen = require('markov-generator');
const workerpool = require('workerpool');
const mongoose = require('mongoose');
const connectAndGetSchema = require('./mongo-connector');
require('dotenv').config();

const MessageSchema = connectAndGetSchema();
const Message = new mongoose.model('Message', MessageSchema);

async function markov(chatId) {
    const messages = await Message.find({chatId});
    const input = messages.map(m => {
        return m.text;
    });
    let markov = new MarkovGen({
        input,
        minLength: 4
    });
    return markov.makeChain();
}

workerpool.worker({
    markov
});
