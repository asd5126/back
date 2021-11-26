"use strict";

const getMyPoint = require("../functions/getMyPoint");
const kakaoMsg = require("../functions/kakaoMsg");
const testMessage = require("../functions/testMessage");
const walletEnroll = require("../functions/walletEnroll");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  kakaoMsg,
  walletEnroll,
  getMyPoint,
  testMessage,
};
