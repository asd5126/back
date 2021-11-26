const { selectKakaouids, insertKakaouids } = require("../../../sql/kakaouids");
const { selectTimeCheckQuery } = require("../../../sql/messages");
const { selectOptions } = require("../../../sql/options");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const getKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  let kakaouid = 0;
  // 유저 정보가 없는 경우
  if (getKakaouids[0].length === 0) {
    const postKakaouids = await trx.raw(insertKakaouids, {
      room: body.room,
      sender: body.sender,
      imageProfileBase64: body.imageProfileBase64,
      walletKey: null,
      point: 0,
    });

    kakaouid = postKakaouids[0].insertId;
    // 유저 정보가 있는 경우
  } else {
    kakaouid = getKakaouids[0][0].id;
  }

  // 메시지 저장 & 포인트 함수 시작
  let isPoint = true;
  const getOptions = await trx.raw(selectOptions);
  const option = getOptions[0][0];
  const point = (Math.random() * option.maxPoint + option.minPoint).toFixed(3);
  const timeCheckQuery = await trx.raw(selectTimeCheckQuery, { kakaouid });
  if (timeCheckQuery[0].length > 0 && option.pointDelaySecond - timeCheckQuery[0][0].timeDiff > 0) isPoint = false;

  await setPoint(trx, {
    kakaouid,
    room: body.room,
    sender: body.sender,
    message: body.message,
    point,
    isPoint,
  });

  // 메시지 저장 & 포인트 함수 종료

  return { result: "NO_REPLY", message: "Successfully Inserted" };
};
