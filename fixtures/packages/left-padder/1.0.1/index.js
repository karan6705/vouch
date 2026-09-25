function leftPad(value, size, char) {
  const input = String(value);
  const fill = char || " ";
  const missing = Math.max(0, size - input.length);
  return fill.repeat(missing) + input;
}

module.exports = leftPad;

