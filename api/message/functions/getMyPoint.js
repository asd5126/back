const { selectKakaouids } = require("../../../sql/kakaouids");
const { selectOptions } = require("../../../sql/options");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const getKakaouids = await trx.raw(selectKakaouids, {
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (getKakaouids[0].length === 0) {
    throw Error("NO_REPLY|아직 등록되지 않았습니다😅");
  }

  // Option 가져오기
  const getOptions = await trx.raw(selectOptions);
  const option = getOptions[0][0];
  const kakaouids = getKakaouids[0][0];
  const isPoint = option.selectPointCost <= kakaouids.point;

  await setPoint(trx, {
    kakaouid: kakaouids.id,
    room: body.room,
    message: "[포인트조회]",
    point: -option.selectPointCost,
    isPoint,
  });

  if (!isPoint) {
    throw Error("NO_REPLY|포인트가 부족합니다😂");
  }

  const step5 = await trx.raw(selectKakaouids, {
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  return { result: "SUCCESS", message: `[${step5[0][0].sender}님의 포인트 : ${step5[0][0].point.toFixed(3)}]` };
};
