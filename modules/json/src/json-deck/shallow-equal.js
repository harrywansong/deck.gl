// TODO - can we use the core util?

/* eslint-disable complexity */
export function shallowEqual(a, b, {ignore = {}} = {}) {
  if (a === b) {
    return true;
  }

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (!(key in ignore) && (!(key in b) || a[key] !== b[key])) {
      return false;
    }
  }
  for (const key in b) {
    if (!(key in ignore) && !(key in a)) {
      return false;
    }
  }
  return true;
}
