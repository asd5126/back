const numeral = require("numeral");
const { COMMAND_PREFIX } = require("../../../config");
const { selectKakaouidsOnlySender, selectKakaouids } = require("../../../sql/kakaouids");
const { selectBossCheck } = require("../../../sql/rooms");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  const minusPoint = commandSplit[commandSplit.length - 1];
  let sender = "";
  commandSplit.filter((r, i) => {
    if (i !== 0 && i !== commandSplit.length - 1) sender += r + " ";
  });
  sender = sender.trim();

  if (!sender || !minusPoint) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n${COMMAND_PREFIX}전송 유저이름 전송포인트 <- 이렇게 입력해주세요!!`);
  } else if (isNaN(minusPoint)) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n전송포인트는 실수형으로 적어주세요!!`);
  } else if (minusPoint.split(".")[1] && minusPoint.split(".")[1].length > 3) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n전송포인트는 최대 소수점 3자리까지만 가능합니다!!`);
  } else if (body.sender === sender) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n포인트는 자신한테 보낼 수 없습니다!`);
  }

  const senderKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (senderKakaouids[0].length === 0) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n${body.sender} (이)라는 유저는 존재하지 않습니다!!😂`);
  } else if (senderKakaouids[0][0].point < minusPoint) {
    throw Error(
      `ERROR|[포인트전송 실패!😥]\n${body.sender}라는 유저는 ${numeral(senderKakaouids[0][0].point).format("0,0.000")} 포인트 밖에 없습니다 😂`
    );
  }

  const getSender = await trx.raw(selectKakaouidsOnlySender, {
    room: body.room,
    sender,
  });

  if (getSender[0].length === 0) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n${sender} (이)라는 유저는 존재하지 않습니다!!😂`);
  } else if (getSender[0].length > 1) {
    throw Error(`ERROR|[포인트전송 실패!😥]\n${sender} (이)라는 유저가 ${getSender[0].length} 명 존재합니다!!😂 이름을 바꿔주세요`);
  }

  await setPoint(trx, {
    kakaouid: senderKakaouids[0][0].id,
    room: body.room,
    sender: senderKakaouids[0][0].sender,
    message: `[포인트전송 (보냄)] ${senderKakaouids[0][0].sender} => ${getSender[0][0].sender}`,
    point: -minusPoint,
    isPoint: true,
  });

  await setPoint(trx, {
    kakaouid: getSender[0][0].id,
    room: body.room,
    sender: getSender[0][0].sender,
    message: `[포인트전송 (받음)] ${getSender[0][0].sender} => ${body.sender}`,
    point: minusPoint,
    isPoint: true,
  });

  const afterSenderKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  const getKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: getSender[0][0].sender,
    imageProfileBase64: getSender[0][0].imageProfileBase64,
  });

  return {
    result: "SUCCESS",
    message: `[${minusPoint} 포인트전송 (${senderKakaouids[0][0].sender} => ${getSender[0][0].sender})]
[${afterSenderKakaouids[0][0].sender}님의 포인트 : ${numeral(afterSenderKakaouids[0][0].point).format("0,0.000")}]
[${getKakaouids[0][0].sender}님의 포인트 : ${numeral(getKakaouids[0][0].point).format("0,0.000")}]`.trim(),
  };
};
