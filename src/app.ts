import dotenv from "dotenv";
import Telegraf, {Context} from "telegraf";
import Nimiq from "@nimiq/core";

import { humanNIM, humanHashes } from "./helpers";
import { nimiqx, nimiqWatch } from "./sources";

// Load .env file
dotenv.config();

// Log commands so they can be registered easily at BotFather
const comamands = `price - Check the current NIM price
profit - Check how much you earn by mining
source - Link to source code
supply - Current supply of NIM coins
whales - Biggest accounts $$$`

// Create new Telegraf instance. Assume Telegram token is properly set
const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string)
bot.start(ctx => {
  ctx.reply("Hey, I'm Nimiq Telegram bot 👋 I provide information about the Nimiq network. Add me to a group to start 😌. Type / for a list of commands.");
})

bot.command('price', async (ctx: Context) => {
  try {
    const stats = await nimiqx('https://api.nimiqx.com/price/btc,usd,eur');
    
    const lines = [
      { "code": "usd", "sym": "US$", "value": 0, "valueStr": "", "price": 0, "priceStr": ""},
      { "code": "eur", "sym": "€  ", "value": 0, "valueStr": "", "price": 0, "priceStr": ""}
    ];
    
    let message = '';
    message += "```"
    
    const btcPrice = parseFloat(stats["btc"])
    message += '\n' + `1 NIM = ${(1000 * btcPrice).toFixed(5)} mBTC`;
    message += '\n' + `1 BTC = ${humanNIM(1 / btcPrice)}`;
    
    for (let line of lines) {
      line.value = parseFloat(stats[line.code]);
      line.valueStr = `1 NIM = ${line.value.toFixed(5)} ${line.sym}`;
      
      message += '\n' + line.valueStr;
      
      line.price = 1 / line.value;
      line.priceStr = `1 ${line.sym} = ${humanNIM(line.price)}`;
      
      message += '\n' + line.priceStr;
    }
    
    message += "```"
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  } catch (e) {
    return ctx.reply("Error while executing command.");
  }
})

bot.command('profit', async (ctx: Context) => {
  try {
    const stats = await nimiqx('https://api.nimiqx.com/network-stats/');
    
    const nimPerKh = parseFloat(stats.nim_day_kh);
    
    let message = '';
    message += `NIM / kH / day: ${nimPerKh} NIM\n`
    message += `NIM / kH / week: ${humanNIM(nimPerKh * 7)}\n`
    message += `NIM / kH / month: ${humanNIM(nimPerKh * 30.4375)}\n`
    message += `Block reward: ${Nimiq.Policy.lunasToCoins(stats.last_reward).toFixed(1)} NIM\n`
    message += `Difficulty: ${stats.difficulty.toFixed(0)}\n`
    message += `Global hashrate: ${humanHashes(stats.hashrate)}\n`
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  } catch (e) {
    return ctx.reply("Error while executing command.");
  }
})

bot.command('source', (ctx: Context) => ctx.reply(`You can find my source code at https://github.com/nimiq-community/telegram-bot. Feel free give me more functionality! 🤖`,
{
  disable_notification: true,
  disable_web_page_preview: true
}))

bot.command('supply', async (ctx: Context) => {
  try {
    // Get current height from Nimiq Watch
    const stats = await nimiqWatch("https://api.nimiq.watch/latest/1");
    const height = stats[0].height;
    
    const knownCoins = Nimiq.Policy.satoshisToCoins(Nimiq.Policy.supplyAfter(height));
    const totalCoins = 21e9;
    const percentage = 100 * (knownCoins / totalCoins);
    const reward = Nimiq.Policy.satoshisToCoins(Nimiq.Policy.blockRewardAt(height));
    
    let message = '';
    message += `Known coins: ${humanNIM(knownCoins)} (${percentage.toFixed(1)} %)\n`
    message += `Total supply: ${humanNIM(totalCoins)}\n`
    message += `Left to mine: ${humanNIM(totalCoins - knownCoins)}\n`
    message += `Last block reward: ${reward.toFixed(1)} NIM\n`
    
    ctx.reply(message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: true,
    });
  } catch (e) {
    return ctx.reply("Error while executing command.");
  }
})

bot.command('whales', async (ctx: Context) => {
  try {
    const response = await nimiqx('https://api.nimiqx.com/top-account-balances/10')
    let text = "Biggest accounts 🤑\n\n";
    
    for (const account of response) {
      const watchURL = `https://nimiq.watch/#${encodeURI(account.address)}`;
      const balance = humanNIM(account.balance);
      if (account.label) {
        text += `[${account.label}](${watchURL}): ${balance}\n`;
      } else {
        text += `[${account.address.substr(0, 15)}...](${watchURL}): ${balance}\n`;
      }
    }
    
    ctx.reply(text, {
      disable_notification: true,
      disable_web_page_preview: true,
      parse_mode: "Markdown"
    });
  } catch (error) {
    return ctx.reply("Error while executing command.");
  }
})

bot.launch();