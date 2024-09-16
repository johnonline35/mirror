jest.spyOn(global.console, 'log').mockImplementation((...args) => {
  console.info(...args);
});

jest.spyOn(global.console, 'warn').mockImplementation((...args) => {
  console.info(...args);
});

jest.spyOn(global.console, 'error').mockImplementation((...args) => {
  console.info(...args);
});
