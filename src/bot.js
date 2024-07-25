const { Telegraf } = require('telegraf');
const { botToken } = require('./config');
const { addLink, isLinkRegistered, addUserWarning, removeLink } = require('./database');
const { extractUrls } = require('./helpers');

const bot = new Telegraf(botToken);

// Mensaje de ayuda
const helpMessage = `
Commands:
/addLink - Adds a link to the list of allowed links. Only administrators can use this command.
/removeLink - Removes a link from the list of allowed links. Only administrators can use this command.
/help - Show a list of commands.
`;

// Función para verificar si un usuario es administrador
async function isAdmin(ctx, userId) {
  try {
    const member = await ctx.getChatMember(userId);
    return ['administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error(`Error verifying administrator status: ${error.message}`);
    return false;
  }
}

bot.start((ctx) => {
  ctx.reply(`\n${helpMessage}`);
});

bot.command('help', (ctx) => {
  ctx.reply(helpMessage);
});

// Comando para agregar enlaces
bot.command('addLink', async (ctx) => {
  const isUserAdmin = await isAdmin(ctx, ctx.message.from.id);
  if (!isUserAdmin) {
    return ctx.reply('You do not have permission to use this command.');
  }

  const urls = extractUrls(ctx.message.text);
  if (urls.length === 0) {
    return ctx.reply('Please provide a link to add.');
  }

  const url = urls[0];
  try {
    await addLink(url);
    ctx.reply(`Link added: ${url}`);
  } catch (error) {
    ctx.reply(`Error adding link: ${error.message}`);
  }
});

// Comando para eliminar enlaces
bot.command('removeLink', async (ctx) => {
  const isUserAdmin = await isAdmin(ctx, ctx.message.from.id);
  if (!isUserAdmin) {
    return ctx.reply('You do not have permission to use this command.');
  }

  const urls = extractUrls(ctx.message.text);
  if (urls.length === 0) {
    return ctx.reply('Please provide a link to remove.');
  }

  const url = urls[0];
  try {
    const result = await removeLink(url);
    if (result) {
      ctx.reply(`Link removed: ${url}`);
    } else {
      ctx.reply(`The link ${url} was not registered.`);
    }
  } catch (error) {
    ctx.reply(`Error deleting link: ${error.message}`);
  }
});

// Manejo de mensajes para verificar enlaces no autorizados
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const urls = extractUrls(ctx.message.text);

  if (urls.length > 0) {
    const isUserAdmin = await isAdmin(ctx, userId);
    if (!isUserAdmin) {
      for (const url of urls) {
        const registered = await isLinkRegistered(url);
        if (!registered) {
          await ctx.deleteMessage(ctx.message.message_id);
          const warnings = await addUserWarning(userId);
          if (warnings >= 3) {
            await ctx.kickChatMember(userId);
            await ctx.reply(`${ctx.from.username}, you have been blocked for posting unauthorized links.`);
          } else {
            await ctx.reply(`${ctx.from.username}, You have received a warning for posting an unauthorized link. You have ${warnings} warning(s).`);
          }
          break;
        }
      }
    }
  }
});

bot.launch();
