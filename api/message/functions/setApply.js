const { selectKakaouids, updateKakaouidsApply } = require("../../../sql/kakaouids");

module.exports = async (trx, body) => {
  const command = body.message.substr(1, body.message.length).split(" ")[0];
  const getKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (getKakaouids[0].length === 0) {
    throw Error("NO_REPLY|아직 등록되지 않았습니다😅");
  }

  const kakaouids = getKakaouids[0][0];

  if (command === "신청합니다.") {
    if (kakaouids.isApply) {
      throw Error(`ERROR|${kakaouids.sender}님은 이미 신청하셨습니다.`);
    } else {
      await trx.raw(updateKakaouidsApply, {
        room: body.room,
        sender: body.sender,
        imageProfileBase64: body.imageProfileBase64,
        isApply: true,
      });
      return { result: "SUCCESS", message: `[${kakaouids.sender}님 신청완료😀]` };
    }
  } else if (command === "신청취소합니다.") {
    if (kakaouids.isApply) {
      await trx.raw(updateKakaouidsApply, {
        room: body.room,
        sender: body.sender,
        imageProfileBase64: body.imageProfileBase64,
        isApply: false,
      });
      return { result: "SUCCESS", message: `[${kakaouids.sender}님 취소완료😀]` };
    } else {
      throw Error(`ERROR|${kakaouids.sender}님은 이미 취소되었습니다.`);
    }
  }
};
