import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// AudioContext mock (used by useSoundEffects hook)
class MockAudioContext {
  createOscillator() {
    return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 }, type: 'sine' };
  }
  createGain() {
    return { connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} } };
  }
  get currentTime() { return 0; }
  get destination() { return {}; }
}
Object.defineProperty(window, "AudioContext", { writable: true, value: MockAudioContext });
Object.defineProperty(window, "webkitAudioContext", { writable: true, value: MockAudioContext });

// URL mock (used by CognitiveReport download button)
Object.defineProperty(URL, "createObjectURL", { writable: true, value: () => "blob:mock-url" });
Object.defineProperty(URL, "revokeObjectURL", { writable: true, value: () => {} });
