"use strict";

const { COMMAND_PREFIX } = require("../../../config");
const getBoss = require("../functions/getBoss");
const getCoin = require("../functions/getCoin");
const getCommand = require("../functions/getCommand");
const getMyPoint = require("../functions/getMyPoint");
const kakaoMsg = require("../functions/kakaoMsg");
const setPeoplePoint = require("../functions/setPeoplePoint");
const walletEnroll = require("../functions/walletEnroll");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  kakaoBot: async (ctx) => {
    try {
      const body = ctx.request.body;

      if (!body.sender || !body.imageProfileBase64 || !body.message || !body.room || !body.isDebugRoom || !body.isGroupChat) {
        ctx.send({ result: "ERROR", message: "유효성 검사 에러" });
        return;
      }

      const trx = await strapi.connections.default.transaction();
      try {
        let resultObject = { result: "NO_REPLY", message: "메시지 없음" };
        if (body.message[0] === COMMAND_PREFIX) {
          switch (body.message.substr(1, body.message.length).split(" ")[0]) {
            case "명령어":
              resultObject = await getCommand(trx, body);
              break;
            case "지갑등록":
              resultObject = await walletEnroll(trx, body);
              break;
            case "포인트조회":
              resultObject = await getMyPoint(trx, body);
              break;
            case "방장조회":
              resultObject = await getBoss(trx, body);
              break;
            case "차감":
              resultObject = await setPeoplePoint(trx, body);
              break;
            case "코인":
              resultObject = await getCoin(trx, body);
              break;
            default:
              resultObject = await getCoin(trx, body);
              break;
          }
        } else {
          resultObject = await kakaoMsg(trx, body);
        }
        trx.commit();
        ctx.send(resultObject);
      } catch (err) {
        trx.rollback();
        if (err.message.split("|")[0] === "NO_REPLY") {
          ctx.send({ result: "NO_REPLY", message: err.message.split("|")[1] });
        } else if (err.message.split("|")[0] === "ERROR") {
          ctx.send({ result: "ERROR", message: err.message.split("|")[1] });
        } else {
          ctx.send({ result: "NO_REPLY", message: err.message });
        }
      }
    } catch (err) {
      ctx.send({ result: "NO_REPLY", message: "치명적인 에러 ![" + err.message + "]" });
    }
  },
};
