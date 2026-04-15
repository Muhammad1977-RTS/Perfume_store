const axios = require('axios');

/**
 * Send a formatted order notification to the Telegram bot.
 * Gracefully skips if TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID are not set.
 *
 * @param {object} order
 * @param {string} order.id
 * @param {string} order.customerName
 * @param {string} order.phone
 * @param {string} order.address
 * @param {Array}  order.items  — [{ name, brand, price, quantity }, ...]
 * @param {number} order.totalPrice
 * @param {Date|string} order.createdAt
 */
async function sendOrderToTelegram(order) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram] Not configured — skipping notification.');
    return;
  }

  const itemLines = (order.items || [])
    .map((item) => {
      const lineTotal = ((item.price || 0) * (item.quantity || 1)).toFixed(2);
      return `  • ${item.name} (${item.brand}) × ${item.quantity} — €${lineTotal}`;
    })
    .join('\n');

  const dateStr = new Date(order.createdAt).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
  });

  const text = [
    `🛍 <b>Новый заказ #${order.id}</b>`,
    '',
    `👤 <b>Клиент:</b> ${escapeHtml(order.customerName)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(order.phone)}`,
    `📍 <b>Адрес:</b> ${escapeHtml(order.address)}`,
    '',
    `📦 <b>Состав заказа:</b>`,
    itemLines,
    '',
    `💰 <b>Итого:</b> €${Number(order.totalPrice).toFixed(2)}`,
    `🕐 ${dateStr}`,
  ].join('\n');

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await axios.post(url, {
    chat_id:    chatId,
    text,
    parse_mode: 'HTML',
  });

  console.log(`[Telegram] Order ${order.id} dispatched.`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { sendOrderToTelegram };
