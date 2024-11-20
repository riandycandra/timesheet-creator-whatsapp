const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const service = require('./service');

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-session" }), // Save session locally,
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

client.on('qr', (qr) => {
    // Generate and display the QR code in the terminal
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
    let handle = await service.handleString(message.body);

    // check handle is boolean or not
    if(typeof handle === 'boolean'){
      
      if(handle){
        message.reply('Your task has been added boss.');
      } else {
        message.reply('Invalid command boss.');
      }

    } else {
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const media = new MessageMedia(mimeType, handle.toString('base64'), 'Timesheet.xlsx');
      await client.sendMessage(message.from, media);
      message.reply('Here is your timesheet boss.');

    }
});

client.initialize();