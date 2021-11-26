const { COMMAND_PREFIX } = require("../../../config");
const { selectKakaouids, updateKakaouidsWallet, insertKakaouids } = require("../../../sql/kakaouids");

module.exports = async (trx, body) => {
  const walletKey = body.message.split(" ")[1];
  if (!walletKey) {
    throw Error(`[지갑등록실패!😥]\n${COMMAND_PREFIX}지갑등록 [지갑주소] <- 이렇게 입력해주세요!!`);
  }
  const step1 = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  // 유저 정보가 없는 경우
  if (step1[0].length === 0) {
    await trx.raw(insertKakaouids, {
      room: body.room,
      sender: body.sender,
      imageProfileBase64: body.imageProfileBase64,
      walletKey,
      point: 0,
    });

    // 유저 정보가 있는 경우
  } else {
    await trx.raw(updateKakaouidsWallet, {
      sender: body.sender,
      imageProfileBase64: body.imageProfileBase64,
      walletKey,
    });
  }

  return { result: "SUCCESS", message: "[지갑등록완료!😀]\n등록된 지갑 주소 : " + walletKey };
};
