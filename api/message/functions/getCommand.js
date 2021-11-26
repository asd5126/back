const { COMMAND_PREFIX } = require("../../../config");

module.exports = async (trx, body) => {
  // Option 가져오기
  const getOptions = await trx.raw(selectOptions);
  const option = getOptions[0][0];

  return {
    result: "SUCCESS",
    message: `    
[포인트조회시 ${option.selectPointCost.toFixed(3)} 포인트가 차감됩니다.]
[지갑등록을 하지 않은 경우, 닉네임이나 프사 변경시 포인트가 소멸됩니다.]
${COMMAND_PREFIX}명령어
${COMMAND_PREFIX}지갑등록 지갑주소
${COMMAND_PREFIX}포인트조회
${COMMAND_PREFIX}방장조회
${COMMAND_PREFIX}차감 유저이름 포인트 (방장전용)
`.trim(),
  };
};
