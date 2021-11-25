"use strict";

const getMyPoint = require("../lib/getMyPoint");
const kakaoMsg = require("../lib/kakaoMsg");
const walletEnroll = require("../lib/walletEnroll");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  kakaoMsg,
  walletEnroll,
  getMyPoint,
};
