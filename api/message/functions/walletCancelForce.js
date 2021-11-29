const numeral = require("numeral");
const { COMMAND_PREFIX } = require("../../../config");
const { selectKakaouidsOnlySender, selectKakaouids, updateKakaouidsWallet, updateKakaouidsWalletOnlySender } = require("../../../sql/kakaouids");
const { selectBossCheck } = require("../../../sql/rooms");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  let sender = "";
  commandSplit.filter((r, i) => {
    if (i !== 0 && i !== commandSplit.length) sender += r + " ";
  });
  sender = sender.trim();

  if (!sender) {
    throw Error(`ERROR|[해제실패!😥]\n${COMMAND_PREFIX}강제지갑해제 유저이름 <- 이렇게 입력해주세요!!`);
  }

  const getBossCheck = await trx.raw(selectBossCheck, {
    room: body.room,
    sender: body.sender,
    imageProfileBase64: body.imageProfileBase64,
  });

  if (getBossCheck[0].length === 0) {
    throw Error("ERROR|당신은 방장이 아닙니다😅 방장만 사용가능합니다!");
  }

  const getSender = await trx.raw(selectKakaouidsOnlySender, {
    room: body.room,
    sender,
  });

  if (getSender[0].length === 0) {
    throw Error(`ERROR|[해제실패!😥]\n${sender}라는 유저는 존재하지 않습니다!!😂`);
  } else if (getSender[0].length > 1) {
    throw Error(`ERROR|[해제실패!😥]\n${sender}라는 유저가 ${getSender[0].length} 명 존재합니다!!😂 이름을 바꿔주세요`);
  }

  await trx.raw(updateKakaouidsWalletOnlySender, {
    room: getSender[0][0].room,
    sender: getSender[0][0].sender,
    walletKey: null,
  });

  return { result: "SUCCESS", message: `[${getSender[0][0].sender}님 지갑해제완료!😎]` };
};
