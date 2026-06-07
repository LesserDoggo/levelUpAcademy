const appJson = require("./app.json");

const expo = appJson.expo;
const baseUrl = process.env.EXPO_BASE_URL;

module.exports = {
  expo: {
    ...expo,
    experiments: {
      ...expo.experiments,
      ...(baseUrl ? { baseUrl } : {}),
    },
  },
};
