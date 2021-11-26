const { updateKakaouids } = require("../../../sql/kakaouids");
const { insertMessages } = require("../../../sql/messages");

module.exports = async (trx, body) => {
  await trx.raw(insertMessages, {
    kakaouid: body.kakaouid,
    room: body.room,
    sender: body.sender,
    message: body.message,
    point: body.point,
    isPoint: body.isPoint,
  });

  if (body.isPoint) {
    await trx.raw(updateKakaouids, {
      kakaouid: body.kakaouid,
      point: body.point,
    });
  }
};
