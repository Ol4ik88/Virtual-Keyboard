export function set(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}

export function get(name, defaultName = null) {
  return JSON.parse(localStorage.getItem(name) || defaultName);
}

export function removeStorage(name) {
  localStorage.removeItem(name);
}
