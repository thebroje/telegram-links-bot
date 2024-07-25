const { addLink } = require('./database');

linksToAdd.forEach(async (link) => {
  try {
    await addLink(link);
    console.log(`Link added: ${link}`);
  } catch (error) {
    console.error(`Error adding link ${link}:`, error.message);
  }
});