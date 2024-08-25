export const validateChromeExtensionId = (id) => {
  const chromeExtensionPattern = /^[a-z]{32}$/;
  return chromeExtensionPattern.test(id);
};
