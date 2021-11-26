const { selectRoomBoss } = require("../../../sql/rooms");

module.exports = async (trx, body) => {
  const step1 = await trx.raw(selectRoomBoss, {
    room: body.room,
  });

  if (step1[0].length === 0) {
    throw Error("아직 방장이 등록되지 않았습니다😅");
  }

  return { result: "SUCCESS", message: `${step1[0][0].room}방의 방장은 ${step1[0][0].sender}님 입니다😀` };
};
