const { selectKakaouids, updateKakaouids } = require("../../../sql/kakaouids");
const { insertMessages } = require("../../../sql/messages");
const { selectOptions } = require("../../../sql/options");

module.exports = async (ctx) => {
  try {
    const body = ctx.request.body;

    if (!body.sender || !body.imageProfileBase64 || !body.room) {
      ctx.send({ result: "ERROR", message: "Validation Error" });
      return;
    }

    const trx = await strapi.connections.default.transaction();
    try {
      const step1 = await trx.raw(selectKakaouids, {
        sender: body.sender,
        imageProfileBase64: body.imageProfileBase64,
      });

      if (step1[0].length === 0) {
        throw Error("아직 등록되지 않았습니다😅");
      }

      // Option 가져오기
      const getOption = await trx.raw(selectOptions);
      const option = getOption[0][0];
      const kakaouids = step1[0][0];
      const isPoint = option.selectPointCost <= kakaouids.point;

      const step3 = await trx.raw(insertMessages, {
        kakaouid: kakaouids.id,
        room: body.room,
        message: "[포인트조회]",
        point: -option.selectPointCost,
        isPoint: isPoint,
      });

      if (isPoint) {
        const step4 = await trx.raw(updateKakaouids, {
          kakaouid: kakaouids.id,
          point: -option.selectPointCost,
        });
      } else {
        throw Error("포인트가 부족합니다😂");
      }

      const step5 = await trx.raw(selectKakaouids, {
        sender: body.sender,
        imageProfileBase64: body.imageProfileBase64,
      });
      trx.commit();
      ctx.send({ result: "SUCCESS", message: step5[0][0] });
    } catch (err) {
      trx.rollback();
      ctx.send({
        result: "ERROR",
        message: "DB Error ![" + err.message + "]",
      });
    }
  } catch (err) {
    ctx.send({
      result: "ERROR",
      message: "Critical Error ![" + err.message + "]",
    });
  }
};
