export function set(name, value) {
  window.localStorage.setItem(name, JSON.stringify(value));
}

export function get(name, defaultName = null) {
  return JSON.parse(window.localStorage.getItem(name) || defaultName);
}

export function removeSorage(name) {
  localStorage.removeItem(name);
}
