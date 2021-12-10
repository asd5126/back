const axios = require("axios");
const { JSDOM } = require("jsdom");

module.exports = async (trx, body) => {
  const { data } = await axios.get("https://coinmarketcap.com/ko/");

  const dom = new JSDOM(data);
  const contents = dom.window.document.querySelectorAll(".cmc-link");

  return { result: "SUCCESS", message: contents[4].textContent };
};
