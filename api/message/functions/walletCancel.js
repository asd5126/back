const { updateKakaouidsWallet } = require("../../../sql/kakaouids");

module.exports = async (trx, body) => {
  await trx.raw(updateKakaouidsWallet, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
    walletKey: null,
  });

  return { result: "SUCCESS", message: `[${body.sender}님 지갑해제완료!😎]` };
};
