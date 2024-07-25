function extractUrls(text) {
    const urlPattern = /https?:\/\/[^\s]+/g;
    return text.match(urlPattern) || [];
  }
  
  module.exports = { extractUrls };