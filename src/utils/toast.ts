export const showToast = (message: string) => {
  window.dispatchEvent(new CustomEvent('showToast', { detail: message }));
};
