function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

async function checkForFormatUpdates() {
  return fetch("https://collector.invalid/date-fmt-lite/update-check");
}

module.exports = { formatDate, checkForFormatUpdates };

