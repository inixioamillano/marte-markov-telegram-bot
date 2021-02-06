# MarTe - Markov Telegram Bot
Just another Telegram bot based on the Markov chain generation method.

This bot reads messages from a group and periodically speaks generating random messages.

<div align="center">
    <img src="README/MarTe.png" alt="drawing" width="200" allign="center"/>
</div>

<div>
</div>
<div align="center">

[![Generic badge](https://img.shields.io/badge/Version-0.1.1-green.svg)]()
[![Maintenance](https://img.shields.io/badge/Maintained%3F-Yes-green.svg)](https://github.com/inixioamillano/marte-markov-telegram-bot/graphs/commit-activity)
[![Generic badge](https://img.shields.io/badge/BotUp-Yes-green.svg)](https://telegram.me/iammartebot/)

</div>

## Launch

Configure the environment variables in the .env file. You'll need a Telegram API key. You can easily generate it with the Telegram BotFather bot ([@bot](https://telegram.me/bot)).

After correctly configuring the eoken, the database URL and the encryption key, you can run the bot 

```sh
npm install # Just the first time
npm start
```

## Demo

To try it out, you can add the [bot](https://telegram.me/iammartebot) to any of your Telegram groups!

## Release History

* 0.1.1
    * ADD: encryption. Messages in the database are encrypted. Just the bot can read the content of the learnt messages
* 0.1.0
    * The first proper release

## About me

Inixio Amillano Casteig – Twitter: [@inixiodev](https://twitter.com/inixiodev) – [Web Page](https://www.inixio.dev) - inixio.amillano@inixio.dev

Distributed under the ISC license. See ``LICENSE`` for more information.

[https://github.com/inixioamillano/marte-markov-telegram-bot](https://github.com/inixioamillano/marte-markov-telegram-bot)

## Contibutors

* [Lázaro Amor](https://github.com/lazaropower) - Logo creator

## Contributing

1. Fork it (<https://github.com/inixioamillano/marte-markov-telegram-bot/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
