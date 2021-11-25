"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  kakaoMsg: async (ctx) => {
    // console.log(ctx.request.body);
    // console.log(ctx.params);
    // console.log(ctx.query);

    try {
      const body = ctx.request.body;

      if (
        !body.sender ||
        !body.imageProfileBase64 ||
        !body.room ||
        !body.message
      ) {
        ctx.send({ result: "ERROR", message: "Validation Error" });
        return;
      }

      // Option 가져오기
      const getOption = await strapi.connections.default.raw(
        `
        SELECT *
        FROM options
        `
      );
      const option = getOption[0][0];
      const point =
        Math.floor(Math.random() * (option.maxPoint + 1)) + option.minPoint;

      const step1 = await strapi.connections.default.raw(
        `
        SELECT *
        FROM kakaouids
        WHERE
          sender = :sender AND
          imageProfileBase64 = :imageProfileBase64
        `,
        {
          sender: body.sender,
          imageProfileBase64: body.imageProfileBase64,
        }
      );

      let kakaouid = 0;

      // 유저 정보가 없는 경우
      if (step1[0].length === 0) {
        const step2 = await strapi.connections.default.raw(
          `
          INSERT INTO kakaouids (
            sender, 
            imageProfileBase64,
            point
          )
          VALUES(
            :sender, 
            :imageProfileBase64,
            0
          )`,
          {
            sender: body.sender,
            imageProfileBase64: body.imageProfileBase64,
          }
        );

        kakaouid = step2[0].insertId;
        // 유저 정보가 있는 경우
      } else {
        kakaouid = step1[0][0].id;
      }

      const step3 = await strapi.connections.default.raw(
        `
        INSERT INTO messages (
          kakaouid, 
          room, 
          message,
          point
        )
        VALUES(
          :kakaouid, 
          :room, 
          :message,
          :point
        )`,
        {
          kakaouid: kakaouid,
          room: body.room,
          message: body.message,
          point: point,
        }
      );

      const step4 = await strapi.connections.default.raw(
        `
        UPDATE kakaouids 
        SET point = IFNULL(point, 0) + :point
        WHERE id = :kakaouid`,
        {
          kakaouid: kakaouid,
          point: point,
        }
      );

      if (step3[0].affectedRows === 1 && step4[0].affectedRows === 1) {
        ctx.send({ result: "SUCCESS", message: "Successfully Inserted" });
      } else {
        ctx.send({ result: "ERROR", message: "DB Error" });
      }
    } catch (err) {
      ctx.send({
        result: "ERROR",
        message: "Critical Error ![" + err.message + "]",
      });
    }
  },
  walletEnroll: async (ctx) => {
    // console.log(ctx.request.body);
    // console.log(ctx.params);
    // console.log(ctx.query);

    try {
      const body = ctx.request.body;

      if (!body.sender || !body.imageProfileBase64 || !body.walletKey) {
        ctx.send({ result: "ERROR", message: "Validation Error" });
        return;
      }

      const step1 = await strapi.connections.default.raw(
        `
        SELECT *
        FROM kakaouids
        WHERE
          sender = :sender AND
          imageProfileBase64 = :imageProfileBase64
        `,
        {
          sender: body.sender,
          imageProfileBase64: body.imageProfileBase64,
        }
      );

      let step2 = [];
      // 유저 정보가 없는 경우
      if (step1[0].length === 0) {
        step2 = await strapi.connections.default.raw(
          `
          INSERT INTO kakaouids (
            sender, 
            imageProfileBase64,
            walletKey
          )
          VALUES(
            :sender, 
            :imageProfileBase64,
            :walletKey
          )`,
          {
            sender: body.sender,
            imageProfileBase64: body.imageProfileBase64,
            walletKey: body.walletKey,
          }
        );

        // 유저 정보가 있는 경우
      } else {
        step2 = await strapi.connections.default.raw(
          `
          UPDATE 
            kakaouids
          SET 
            walletKey = :walletKey
          WHERE
            sender = :sender AND
            imageProfileBase64 = :imageProfileBase64`,
          {
            sender: body.sender,
            imageProfileBase64: body.imageProfileBase64,
            walletKey: body.walletKey,
          }
        );
      }

      console.log(step2);

      if (step2[0].affectedRows === 1) {
        ctx.send({ result: "SUCCESS", message: "Successfully Inserted" });
      } else {
        ctx.send({ result: "ERROR", message: "DB Error" });
      }
    } catch (err) {
      ctx.send({
        result: "ERROR",
        message: "Critical Error ![" + err.message + "]",
      });
    }
  },
};
