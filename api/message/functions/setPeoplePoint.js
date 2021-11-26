const { COMMAND_PREFIX } = require("../../../config");
const { selectKakaouidsOnlySender } = require("../../../sql/kakaouids");
const { selectBossCheck } = require("../../../sql/rooms");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const getBossCheck = await trx.raw(selectBossCheck, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (getBossCheck[0].length === 0) {
    throw Error("ERROR|당신은 방장이 아닙니다😅 방장만 사용가능합니다!");
  }

  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  const minusPoint = commandSplit[commandSplit.length - 1];
  let sender = "";
  commandSplit.filter((r, i) => {
    if (i !== 0 && i !== commandSplit.length - 1) sender += r + " ";
  });
  sender = sender.trim();

  if (!sender || !minusPoint) {
    throw Error(`ERROR|[차감실패!😥]\n${COMMAND_PREFIX}차감 유저이름 차감포인트 <- 이렇게 입력해주세요!!`);
  } else if (isNaN(minusPoint)) {
    throw Error(`ERROR|[차감실패!😥]\n차감포인트는 실수형으로 적어주세요!!`);
  }

  const getSender = await trx.raw(selectKakaouidsOnlySender, {
    room: body.room,
    sender,
  });

  if (getSender[0].length === 0) {
    throw Error(`ERROR|[차감실패!😥]\n${sender}라는 유저는 존재하지 않습니다!!😂`);
  } else if (getSender[0].length > 1) {
    throw Error(`ERROR|[차감실패!😥]\n${sender}라는 유저가 ${getSender[0].length} 명 존재합니다!!😂 이름을 바꿔주세요`);
  } else if (getSender[0][0].point < minusPoint) {
    throw Error(`ERROR|[차감실패!😥]\n${sender}라는 유저는 ${getSender[0][0].point.toFixed(3)} 포인트 밖에 없습니다 😂`);
  }

  await setPoint(trx, {
    kakaouid: getSender[0][0].id,
    room: body.room,
    sender: getSender[0][0].sender,
    message: "[포인트차감]",
    point: -minusPoint,
    isPoint: true,
  });

  return {
    result: "SUCCESS",
    message: `[${minusPoint} 포인트차감!!]
[${getSender[0][0].sender}님의 포인트 : ${getSender[0][0].point.toFixed(3)}]`.trim(),
  };
};
