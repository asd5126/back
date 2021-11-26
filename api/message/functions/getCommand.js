const { COMMAND_PREFIX } = require("../config");

module.exports = async (trx, body) => {
  return {
    result: "SUCCESS",
    message: `
${COMMAND_PREFIX}명령어모음
${COMMAND_PREFIX}지갑등록 [지갑주소]
${COMMAND_PREFIX}포인트조회`.trim(),
  };
};
