export const formatHeader = (str) => {
  if (!str) return "";

  return str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


export const generatePassword = (input) => {
  const specialChars = "!@#$%^&*";
  const numbers = "0123456789";

  // Combine all possible extra characters
  const extras = specialChars + numbers;

  // Start with characters from input
  let chars = input.split("");

  // Add random extras until length becomes 8
  while (chars.length < 8) {
    const randomChar = extras[Math.floor(Math.random() * extras.length)];
    chars.push(randomChar);
  }

  // Shuffle characters
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  // Return exactly 8 characters
  return chars.join("").slice(0, 8);
}
