const { selectCommands } = require("../../../sql/commands");

module.exports = async (trx, body) => {
  const command = body.message.substr(1, body.message.length).split(" ")[0];

  const getCommands = await trx.raw(selectCommands);
  const searchCommand = getCommands[0].find((r) => r.command === command);
  if (!searchCommand || getCommands[0].length === 0) {
    throw Error(`ERROR|[명령실패!😥]\n${command}라는 명령어는 없습니다.`);
  }

  return {
    result: "SUCCESS",
    message: searchCommand.message,
  };
};
