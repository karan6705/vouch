function leftPad(value, size, char) {
  const input = String(value);
  const fill = char || " ";
  if (input.length >= size) return input;
  return fill.repeat(size - input.length) + input;
}

module.exports = leftPad;

