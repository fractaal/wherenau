export default function formatNumber(number: number) {
  if (number < 1000) {
    return number.toFixed().padEnd(5, ' ');
  } else {
    return (number / 1000).toFixed(2) + 'k';
  }
}
