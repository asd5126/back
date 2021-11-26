const axios = require("axios");
const numeral = require("numeral");
const { COMMAND_PREFIX } = require("../../../config");
const { selectCoinmarketcap } = require("../../../sql/coinmarketcap");
const { selectKakaouids } = require("../../../sql/kakaouids");
const { selectOptions } = require("../../../sql/options");
const setPoint = require("./setPoint");

module.exports = async (trx, body) => {
  const commandSplit = body.message.substr(1, body.message.length).split(" ");
  if (!commandSplit[1]) {
    throw Error(`ERROR|[조회실패!😥]\n${COMMAND_PREFIX}코인 코인이름 <- 이렇게 입력해주세요!!`);
  }

  const getCoinmarketcap = await trx.raw(selectCoinmarketcap);
  const searchCoin = getCoinmarketcap[0].find((r) => r.name === commandSplit[1]);
  if (!searchCoin || getCoinmarketcap[0].length === 0) {
    throw Error("ERROR|[조회실패!😥]\n등록된 데이터가 없습니다.");
  }

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
  const isPoint = option.selectCoinmarketcapCost <= kakaouids.point;

  await setPoint(trx, {
    kakaouid: kakaouids.id,
    room: body.room,
    sender: body.sender,
    message: "[가격봇조회]",
    point: -option.selectCoinmarketcapCost,
    isPoint,
  });

  if (!isPoint) {
    throw Error("ERROR|[조회실패!😥]\n포인트가 부족합니다😂");
  }

  const { data: vKRW } = await axios.get(option.coinmarketcapUrl + option.coinmarketcapKrwId);
  const { data: vCOIN } = await axios.get(option.coinmarketcapUrl + searchCoin.coinId);

  const priceKRW = vKRW.data[option.coinmarketcapKrwId].quote.USD.price;
  const priceCOIN = vCOIN.data[searchCoin.coinId].quote.USD.price;

  const changeCOIN = vCOIN.data[searchCoin.coinId].quote.USD.percent_change_24h;
  const changeCOINStatus = changeCOIN >= 0 ? "🔺" : "🔽";

  const priceCOIN_USD = vCOIN.data[searchCoin.coinId].quote.USD.price;
  const priceCOIN_KRW = priceCOIN / priceKRW;

  //prettier-ignore
  return {
    result: "SUCCESS",
    message: '[📈 CoinMarketCap 시세 💳]\n\
    이름: [ ' + searchCoin.name + ' ]\n\
    가격: [ ' + numeral(priceCOIN_KRW).format('0,0') + ' 원 ]\n\
    달러: [ $ ' + numeral(priceCOIN_USD).format('0,0.00') + ' ]\n\
    변동: [ ' + numeral(changeCOIN).format('0,0.00') + ' % ' + changeCOINStatus + ' ]'.trim(),
  };
};
