/**
 * @Author: Your name
 * @Date:   2024-11-14 11:19:54
 * @Last Modified by:   Your name
 * @Last Modified time: 2024-11-22 15:53:07
 */
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const service = require('./service');
const { Phone } = require('./models');

const cron = require('node-cron');

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

// client.on('message', async (message) => {
//     let handle = await service.handleString(message.body);

//     // check handle is boolean or not
//     if(typeof handle === 'boolean'){
      
//       if(handle){
//         message.reply('Your task has been added boss.');
//       } else {
//         message.reply('Invalid command boss.');
//       }

//     } else {
//       const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

//       const media = new MessageMedia(mimeType, handle.toString('base64'), 'Timesheet.xlsx');
//       await client.sendMessage(message.from, media);
//       message.reply('Here is your timesheet boss.');

//     }
// });

client.initialize();

cron.schedule('30 17 * * *', async () => {

  let number = await Phone.findOne({
    where: {
      owner: '1'
    },
    raw: true,
  });

  await client.sendMessage(`${number.phone}@c.us`, 'Jangan lupa isi timesheet boss!');
});

// bot logam mulia
// TODO: separate to another file
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

let lastPrice = null;

async function scrapeLogatMulia() {
    try {
        // Launch the browser with specific configurations
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ]
        });

        // Create a new page
        const page = await browser.newPage();

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

        // Set viewport to appear as a regular browser
        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // Add additional headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        });

        // Navigate to the website with increased timeout
        await page.goto('https://logammulia.com/id', {
            waitUntil: 'networkidle0',
            timeout: 60000  // Increased timeout to 60 seconds
        });

        // Wait a bit to ensure Cloudflare check is complete
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

        // Get the HTML content
        const htmlContent = await page.content();

        // Close the browser
        await browser.close();

        const $ = cheerio.load(htmlContent);
        const ngcSection = $('div.ngc-title:contains("Emas")').parent();
        const currentPrice = ngcSection.find('p.price > span.current').text().trim();

        if (lastPrice !== currentPrice && currentPrice != "") {
          console.log('Price has changed!');
          console.log('Old Price:', lastPrice);
          console.log('New Price:', currentPrice);
  
          lastPrice = currentPrice;

          let phones = await Phone.findAll({ raw: true });

          phones.forEach(async (phone) => {
            await client.sendMessage(`${phone.phone}@c.us`, 'Harga emas berubah bos. ' + currentPrice);
          });
        } else {
          console.log('Price has not changed. Current Price:', currentPrice);
        }
    } catch (error) {
        console.error('Error occurred while scraping:', error);
        throw error;
    }
}


setInterval(scrapeLogatMulia, 60000);
scrapeLogatMulia()