const listeners = new Set<() => void>();

export function emitHomeTabPress() {
  listeners.forEach((listener) => listener());
}

export function subscribeToHomeTabPress(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
