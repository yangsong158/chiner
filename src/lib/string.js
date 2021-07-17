export const firstUp = (str) => {
  return str.split('').map((s, i) => {
    if (i === 0) {
      return s.toLocaleUpperCase();
    }
    return s;
  }).join('');
}
