function tone(hex) {
  return String(hex).replace("#", "").slice(0, 6).toLowerCase();
}

module.exports = { tone };

