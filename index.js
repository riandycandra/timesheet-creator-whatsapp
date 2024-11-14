const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const service = require('./service');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-session" }) // Save session locally
});

client.on('qr', (qr) => {
    // Generate and display the QR code in the terminal
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('message', message => {
    let handle = service.handleString(message.body);
    if(handle){
      message.reply('Your task has been added boss.');
    } else {
      message.reply('Invalid command boss.');
    }
});

client.initialize();