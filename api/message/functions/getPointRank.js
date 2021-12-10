const numeral = require("numeral");
const { selectKakaouids, selectKakaouidsPointRank } = require("../../../sql/kakaouids");
const { selectOptions } = require("../../../sql/options");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const getKakaouids = await trx.raw(selectKakaouids, {
    room: body.room,
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
    sender: body.sender,
    message: "[포인트순위조회]",
    point: -option.selectPointCost,
    isPoint,
  });

  if (!isPoint) {
    throw Error("NO_REPLY|포인트가 부족합니다😂");
  }

  const pointRankList = await trx.raw(selectKakaouidsPointRank, {
    room: body.room,
  });

  let message = `[${body.room} 포인트순위]`;

  pointRankList[0].forEach(
    (res, idx) => (message += `\n${numeral(idx + 1).format("00,0")}위 ${numeral(res.point).format("0,0.000")}점 ${res.sender}님`)
  );

  return { result: "SUCCESS", message };
};
