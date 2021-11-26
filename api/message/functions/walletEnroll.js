const { selectKakaouids, updateKakaouidsWallet, insertKakaouids } = require("../../../sql/kakaouids");

module.exports = async (ctx) => {
  // console.log(ctx.request.body);
  // console.log(ctx.params);
  // console.log(ctx.query);

  try {
    const body = ctx.request.body;

    if (!body.sender || !body.imageProfileBase64 || !body.walletKey) {
      ctx.send({ result: "ERROR", message: "Validation Error" });
      return;
    }

    const trx = await strapi.connections.default.transaction();
    try {
      const step1 = await strapi.connections.default.raw(selectKakaouids, {
        sender: body.sender,
        imageProfileBase64: body.imageProfileBase64,
      });

      let step2 = [];
      // 유저 정보가 없는 경우
      if (step1[0].length === 0) {
        step2 = await strapi.connections.default.raw(insertKakaouids, {
          sender: body.sender,
          imageProfileBase64: body.imageProfileBase64,
          walletKey: body.walletKey,
          point: 0,
        });

        // 유저 정보가 있는 경우
      } else {
        step2 = await strapi.connections.default.raw(updateKakaouidsWallet, {
          sender: body.sender,
          imageProfileBase64: body.imageProfileBase64,
          walletKey: body.walletKey,
        });
      }

      trx.commit();
      if (step2[0].affectedRows === 1) {
        ctx.send({ result: "SUCCESS", message: "Successfully Inserted" });
      } else {
        ctx.send({ result: "ERROR", message: "DB Error" });
      }
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
