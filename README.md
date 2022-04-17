# MarTe - Markov Telegram Bot
Just another Telegram bot based on the Markov chain generation method.

This bot reads messages from a group and periodically speaks generating random messages.

<div align="center">
    <img src="README/MarTe.png" alt="drawing" width="200" allign="center"/>
</div>

<div>
</div>
<div align="center">

[![Generic badge](https://img.shields.io/badge/Version-0.1.2-green.svg)]()
[![Maintenance](https://img.shields.io/badge/Maintained%3F-Yes-green.svg)](https://github.com/inixioamillano/marte-markov-telegram-bot/graphs/commit-activity)
[![Generic badge](https://img.shields.io/badge/BotUp-Yes-green.svg)](https://telegram.me/iammartebot/)

</div>

<div align="center">

[![GitHub contributors](https://img.shields.io/github/contributors/inixioamillano/marte-markov-telegram-bot.svg)](https://github.com/inixioamillano/marte-markov-telegram-bot/graphs/contributors/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/inixioamillano/marte-markov-telegram-bot/pulls)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/inixioamillano/marte-markov-telegram-bot.svg)](https://GitHub.com/inixioamillano/marte-markov-telegram-bot/pull/)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr-closed/inixioamillano/marte-markov-telegram-bot.svg)](https://GitHub.com/inixioamillano/marte-markov-telegram-bot/pull/)
</div>


<div align="center">

![Uses Node Js](https://img.shields.io/badge/node.js%20-%2343853D.svg?&label=Uses&style=for-the-badge&logo=node.js)
![Running on my RaspberryPi](https://img.shields.io/badge/-Raspberry%20Pi-C51A4A?style=for-the-badge&logo=Raspberry-Pi&label=Running%20on%20my)
[![Try this bot on Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white&label=Try%20this%20bot%20on)](https://t.me/IamMarTeBot)

</div>

## Launch

Configure the environment variables in the .env file. You'll need a Telegram API key. You can easily generate it with the Telegram BotFather bot ([@BotFather](https://t.me/BotFather)).

After correctly configuring the token, the database URL and the encryption key, you can run the bot 

```sh
npm install # Just the first time
npm start
```

## Demo

To try it out, you can add the [bot](https://telegram.me/iammartebot) to any of your Telegram groups!

## Release History
* 0.2.0
    * ADD: Voice messages with the /audio command 
* 0.1.3
    * ADD: Stickers support, Speech generation. On Dice event 
* 0.1.2
    * ADD: event on @botusername message
* 0.1.1
    * ADD: encryption. Messages in the database are encrypted. Just the bot can read the content of the learnt messages
* 0.1.0
    * The first proper release

## About me

Inixio Amillano Casteig – Twitter: [@inixiodev](https://twitter.com/inixiodev) – [Web Page](https://www.inixio.dev) - inixio.amillano@inixio.dev

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V43E9M0)

Distributed under the ISC license. See ``LICENSE`` for more information.

[https://github.com/inixioamillano/marte-markov-telegram-bot](https://github.com/inixioamillano/marte-markov-telegram-bot)

## Contibutors

<a href="https://github.com/inixioamillano/marte-markov-telegram-bot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=inixioamillano/marte-markov-telegram-bot" />
</a>

Made with [contributors-img](https://contrib.rocks).

* [Lázaro Amor](https://github.com/lazaropower) - Logo creator

## Contributing

1. Fork it (<https://github.com/inixioamillano/marte-markov-telegram-bot/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
