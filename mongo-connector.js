const mongoose = require('mongoose');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

/**
 * Connects current thread to mongodb
 * @returns MongoDBSchema
 */
module.exports = () => {
    console.log("Okay, let's see what I've learnt...")
    mongoose.connect(`mongodb://${process.env.DB_HOST}:27017/martebot`, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("Interesting..."))
        .catch(() => {
            console.log("Whoops... Something went wrong");
        });
    const MessageSchema = new mongoose.Schema({
        text: String,
        chatId: Number
    });
    MessageSchema.plugin(mongooseFieldEncryption, { fields: ["text"], secret: process.env.ENCRYPT_KEY });
    return MessageSchema;
}
