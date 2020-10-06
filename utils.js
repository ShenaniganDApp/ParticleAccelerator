const UTF8_FORMAT = "utf8";
const BASE64_FORMAT = "base64";

function decodeData(encodedData) {
  const bufferedContent = Buffer.from(encodedData, BASE64_FORMAT);
  return JSON.parse(bufferedContent.toString(UTF8_FORMAT));
}

function encodeData(decodedData) {
  const updatedContent = Buffer.from(
    JSON.stringify(decodedData, null, 2),
    UTF8_FORMAT
  );
  return updatedContent.toString(BASE64_FORMAT);
}

function marshallFileUpdate({ message, content, sha }) {
  return JSON.stringify({
    message,
    content,
    sha,
  });
}

function error(...args) {
  console.error(`${Date.now()}:`, ...args);
}
function log(...args) {
  console.log(`${Date.now()}:`, ...args);
}

const Warned = new Map();
function warnOnce(domain, ...args) {
  if (!Warned.get(domain)) {
    Warned.set(domain, true);
    console.warn(`${Date.now()}:`, ...args);
  }
}

module.exports = {
  decodeData,
  encodeData,
  marshallFileUpdate,
  error,
  log,
  warnOnce,
};
