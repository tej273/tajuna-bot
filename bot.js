const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

// ============================================================
//  CONFIGURATION — set these in your .env file
// ============================================================
const BOT_TOKEN     = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const UPI_ID        = process.env.UPI_ID || 'yourname@upi';

// ── Channel / Group IDs (already set from your info) ────────
const GROUP_390_ID  = -1003650061205;  // Tajuna's Exclusive 🔥
const GROUP_2000_ID = -1003982929766; // Tajuna's Private 💎🔥

// ── QR code image paths ──────────────────────────────────────
const QR_390_PATH  = './390.jpeg';
const QR_2000_PATH = './2000.jpeg';

// ============================================================

if (!BOT_TOKEN)     throw new Error('BOT_TOKEN is not set in .env');
if (!ADMIN_CHAT_ID) throw new Error('ADMIN_CHAT_ID is not set in .env');

const bot = new Telegraf(BOT_TOKEN);

// ── In-memory state ──────────────────────────────────────────
const pendingUpload = {}; // { userId: plan }

// ── JSON database ────────────────────────────────────────────
const DB_FILE = './db.json';

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { users: {}, pendingApprovals: {} };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: {}, pendingApprovals: {} };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ── Helpers ──────────────────────────────────────────────────
function nowIST() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

async function safeSend(fn) {
  try { return await fn(); } catch (e) { console.error('Send error:', e.message); }
}

// Generate a single-use, time-limited invite link for a group
async function createSingleUseLink(groupId) {
  const expireDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours
  const result = await bot.telegram.createChatInviteLink(groupId, {
    member_limit: 1,       // only 1 person can use this link
    expire_date: expireDate,
  });
  return result.invite_link;
}

// ── Keyboards ────────────────────────────────────────────────
const mainMenuKeyboard = () =>
  Markup.inlineKeyboard([[Markup.button.callback('🚀 START', 'start_main')]]);

const planKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('💎 ₹390 Plan — Exclusive', 'plan_390')],
    [Markup.button.callback('👑 ₹2000 Plan — Private VIP', 'plan_2000')],
    [Markup.button.callback('🔙 Back', 'start_main')],
  ]);

const backKeyboard = () =>
  Markup.inlineKeyboard([[Markup.button.callback('🔙 Back / START', 'start_main')]]);

const approvalKeyboard = (userId, plan) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Approve', `approve_${userId}_${plan}`),
      Markup.button.callback('❌ Reject',  `reject_${userId}_${plan}`),
    ],
  ]);

// ── /start ───────────────────────────────────────────────────
bot.start(async (ctx) => {
  const name = ctx.from.first_name || 'Friend';
  await ctx.reply(
    `👋 Welcome, *${name}*!\n\n` +
    `🎯 This is *Tajuna's Premium Access Bot*.\n\n` +
    `Get exclusive access to our premium groups.\n\n` +
    `Press *START* to see available plans 👇`,
    { parse_mode: 'Markdown', ...mainMenuKeyboard() }
  );
});

// ── Main menu ────────────────────────────────────────────────
bot.action('start_main', async (ctx) => {
  await ctx.answerCbQuery();
  const name = ctx.from.first_name || 'Friend';
  await ctx.editMessageText(
    `👋 Hello, *${name}*!\n\n` +
    `Please choose your plan below:\n\n` +
    `💎 *₹390 — Exclusive Plan*\n` +
    `_Daily premium content & exclusive access_\n\n` +
    `👑 *₹2000 — Private VIP Plan*\n` +
    `_Full VIP access, requests & bonus drops_`,
    { parse_mode: 'Markdown', ...planKeyboard() }
  ).catch(() =>
    ctx.reply(
      `👋 Hello, *${name}*! Choose your plan:`,
      { parse_mode: 'Markdown', ...planKeyboard() }
    )
  );
});

// ── ₹390 Plan ────────────────────────────────────────────────
bot.action('plan_390', async (ctx) => {
  await ctx.answerCbQuery();

  const details =
    `💎 *Exclusive Plan — ₹390*\n\n` +
    `✅ Access to Exclusive group\n` +
    `🔥 Fresh content drops every day\n` +
    `😎 Exclusive photos & videos\n` +
    `👀 Sneak peeks & early access\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💳 *UPI ID:* \`${UPI_ID}\`\n` +
    `💰 *Amount:* ₹390\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📲 Scan the QR code & pay ₹390`;

  if (fs.existsSync(QR_390_PATH)) {
    await ctx.replyWithPhoto({ source: QR_390_PATH }, {
      caption: details,
      parse_mode: 'Markdown',
      ...backKeyboard(),
    });
  } else {
    await ctx.reply(details, { parse_mode: 'Markdown', ...backKeyboard() });
  }

  pendingUpload[ctx.from.id] = '390';

  await ctx.reply(
    `📸 *After payment, send your screenshot here!*\n\n` +
    `Make sure screenshot shows:\n` +
    `• ✅ Transaction ID\n` +
    `• ✅ Amount: ₹390\n` +
    `• ✅ Date & Time\n\n` +
    `👇 Just *send the photo directly* in this chat`,
    { parse_mode: 'Markdown', ...backKeyboard() }
  );
});

// ── ₹2000 Plan ───────────────────────────────────────────────
bot.action('plan_2000', async (ctx) => {
  await ctx.answerCbQuery();

  const details =
    `👑 *Private VIP Plan — ₹2000*\n\n` +
    `🚀 Full VIP access — everything unlocked\n` +
    `🔥 Daily premium content (no limits)\n` +
    `💬 Direct content requests accepted\n` +
    `✅ Early access to exclusive content\n` +
    `🎁 Surprise bonus drops every week\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💳 *UPI ID:* \`${UPI_ID}\`\n` +
    `💰 *Amount:* ₹2000\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📲 Scan the QR code & pay ₹2000`;

  if (fs.existsSync(QR_2000_PATH)) {
    await ctx.replyWithPhoto({ source: QR_2000_PATH }, {
      caption: details,
      parse_mode: 'Markdown',
      ...backKeyboard(),
    });
  } else {
    await ctx.reply(details, { parse_mode: 'Markdown', ...backKeyboard() });
  }

  pendingUpload[ctx.from.id] = '2000';

  await ctx.reply(
    `📸 *After payment, send your screenshot here!*\n\n` +
    `Make sure screenshot shows:\n` +
    `• ✅ Transaction ID\n` +
    `• ✅ Amount: ₹2000\n` +
    `• ✅ Date & Time\n\n` +
    `👇 Just *send the photo directly* in this chat`,
    { parse_mode: 'Markdown', ...backKeyboard() }
  );
});

// ── Photo handler (payment screenshot) ──────────────────────
bot.on('photo', async (ctx) => {
  const userId = ctx.from.id;
  const plan   = pendingUpload[userId];

  if (!plan) {
    return ctx.reply(
      '⚠️ Please choose a plan first. Press START below.',
      { parse_mode: 'Markdown', ...mainMenuKeyboard() }
    );
  }

  delete pendingUpload[userId];

  const user   = ctx.from;
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

  const db = loadDB();
  db.pendingApprovals[userId] = {
    userId,
    username:  user.username  || '',
    firstName: user.first_name || '',
    plan,
    fileId,
    timestamp: Date.now(),
  };
  saveDB(db);

  const planLabel = plan === '390' ? 'Exclusive (₹390)' : 'Private VIP (₹2000)';

  await ctx.reply(
    `✅ *Screenshot received!*\n\n` +
    `Your payment for *${planLabel}* is under review.\n` +
    `You will receive your group access once approved.\n\n` +
    `⏳ Please wait for approval...`,
    { parse_mode: 'Markdown', ...backKeyboard() }
  );

  const adminMsg =
    `🔔 *New Payment Screenshot*\n\n` +
    `👤 Name: ${user.first_name} ${user.last_name || ''}\n` +
    `🆔 Username: @${user.username || 'N/A'}\n` +
    `🔢 User ID: \`${userId}\`\n` +
    `💰 Plan: ${planLabel}\n` +
    `🕐 Time: ${nowIST()}`;

  await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
    caption: adminMsg,
    parse_mode: 'Markdown',
    ...approvalKeyboard(userId, plan),
  });
});

// ── Admin: Approve ───────────────────────────────────────────
bot.action(/^approve_(\d+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery('✅ Approved!');
  const userId = parseInt(ctx.match[1]);
  const plan   = ctx.match[2];

  const db       = loadDB();
  const approval = db.pendingApprovals[userId];

  if (!approval) {
    return ctx.reply('⚠️ Already processed or not found.');
  }

  delete db.pendingApprovals[userId];
  db.users[userId] = {
    userId,
    plan,
    approvedAt: Date.now(),
    username:  approval.username,
    firstName: approval.firstName,
  };
  saveDB(db);

  const planName  = plan === '390' ? '💎 Exclusive' : '👑 Private VIP';
  const groupId   = plan === '390' ? GROUP_390_ID : GROUP_2000_ID;
  const note      = plan === '390'
    ? '⏰ Your access is here for Tajunas content!'
    : '🎊 You have *VIP access*. Welcome to the inner circle!';

  // ── Generate single-use, expiring invite link ────────────
  let inviteLink = null;
  try {
    inviteLink = await createSingleUseLink(groupId);
  } catch (e) {
    console.error('❌ Failed to create invite link:', e.message);
  }

  if (inviteLink) {
    await safeSend(() =>
      bot.telegram.sendMessage(
        userId,
        `🎉 *Payment Approved!*\n\n` +
        `Your *${planName}* plan is now active.\n\n` +
        `${note}\n\n` +
        `👇 Tap the button below to join:\n\n` +
        `⚠️ *This link is personal — it only works once.*\n` +
        `Do not share it with anyone.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('👉 Join Now', inviteLink)],
            [Markup.button.callback('🔙 Main Menu', 'start_main')],
          ]),
        }
      )
    );
  } else {
    // Fallback if link generation fails
    await safeSend(() =>
      bot.telegram.sendMessage(
        userId,
        `🎉 *Payment Approved!*\n\n` +
        `Your *${planName}* plan is active.\n\n` +
        `⚠️ There was an issue generating your link.\n` +
        `Please contact admin directly to get access.`,
        { parse_mode: 'Markdown', ...mainMenuKeyboard() }
      )
    );
  }

  // Update admin message
  await ctx.editMessageCaption(
    (ctx.callbackQuery.message.caption || '') +
    `\n\n✅ *APPROVED* at ${nowIST()}` +
    (inviteLink ? `\n🔗 Link sent (1-use only)` : '\n⚠️ Link generation failed'),
    { parse_mode: 'Markdown' }
  ).catch(() => {});
});

// ── Admin: Reject ────────────────────────────────────────────
bot.action(/^reject_(\d+)_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery('❌ Rejected');
  const userId = parseInt(ctx.match[1]);
  const plan   = ctx.match[2];

  const db = loadDB();
  delete db.pendingApprovals[userId];
  saveDB(db);

  const planLabel = plan === '390' ? 'Exclusive (₹390)' : 'Private VIP (₹2000)';

  await safeSend(() =>
    bot.telegram.sendMessage(
      userId,
      `❌ *Payment Rejected*\n\n` +
      `Your payment for *${planLabel}* could not be verified.\n\n` +
      `Possible reasons:\n` +
      `• Screenshot was unclear\n` +
      `• Wrong amount paid\n` +
      `• Invalid transaction\n\n` +
      `Please try again or contact support.\n` +
      `Press START to retry 👇`,
      { parse_mode: 'Markdown', ...mainMenuKeyboard() }
    )
  );

  await ctx.editMessageCaption(
    (ctx.callbackQuery.message.caption || '') +
    `\n\n❌ *REJECTED* at ${nowIST()}`,
    { parse_mode: 'Markdown' }
  ).catch(() => {});
});

// ── Non-photo messages ───────────────────────────────────────
bot.on('message', async (ctx) => {
  const userId = ctx.from.id;
  if (pendingUpload[userId]) {
    return ctx.reply(
      '⚠️ Please send a *photo/screenshot* of your payment, not text.',
      { parse_mode: 'Markdown' }
    );
  }
  await ctx.reply(
    'Press START to begin 👇',
    { parse_mode: 'Markdown', ...mainMenuKeyboard() }
  );
});

// ── Launch ───────────────────────────────────────────────────
bot.launch()
  .then(() => console.log('✅ Bot is running...'))
  .catch((err) => console.error('❌ Bot launch error:', err));

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Keep-alive HTTP server (for Railway / Render / Replit)
require('http').createServer((req, res) => res.end('Bot is running')).listen(process.env.PORT || 3000);
