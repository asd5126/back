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

      const trx = await strapi.connections.default.transaction();

      try {
        // Option 가져오기
        const getOption = await trx.raw(
          `
          SELECT *
          FROM options
          `
        );
        const option = getOption[0][0];
        const point = (
          Math.random() * option.maxPoint +
          option.minPoint
        ).toFixed(3);

        const step1 = await trx.raw(
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
          const step2 = await trx.raw(
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

        const timeCheckQuery = await trx.raw(
          `
          SELECT TIME_TO_SEC(TIMEDIFF(CURRENT_TIMESTAMP, a.created_at)) AS timeDiff,
            a.created_at,
            CURRENT_TIMESTAMP
          FROM messages a,
              kakaouids b
          WHERE a.kakaouid = b.id AND
                a.kakaouid = :kakaouid AND
                a.isPoint = 1
          ORDER BY a.id DESC
          LIMIT 0, 1
          `,
          {
            kakaouid: kakaouid,
          }
        );

        let isPoint = true;
        if (
          timeCheckQuery[0].length > 0 &&
          option.pointDelaySecond - timeCheckQuery[0][0].timeDiff > 0
        )
          isPoint = false;

        const step3 = await trx.raw(
          `
          INSERT INTO messages (
            kakaouid, 
            room, 
            message,
            point,
            isPoint
          )
          VALUES(
            :kakaouid, 
            :room, 
            :message,
            :point,
            :isPoint
          )`,
          {
            kakaouid: kakaouid,
            room: body.room,
            message: body.message,
            point: point,
            isPoint: isPoint,
          }
        );

        if (isPoint) {
          const step4 = await trx.raw(
            `
            UPDATE kakaouids 
            SET point = IFNULL(point, 0) + :point
            WHERE id = :kakaouid`,
            {
              kakaouid: kakaouid,
              point: point,
            }
          );
        }

        trx.commit();

        if (step3[0].affectedRows === 1) {
          ctx.send({ result: "SUCCESS", message: "Successfully Inserted" });
        } else {
          ctx.send({ result: "ERROR", message: "DB Error" });
        }
      } catch (err) {
        trx.rollback();
        ctx.send({
          result: "ERROR",
          message: "DB Error ![" + err.message + "]",
        });
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
  getMyPoint: async (ctx) => {
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

      const trx = await strapi.connections.default.transaction();
      try {
        const step1 = await trx.raw(
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
        if (step1[0].length === 0) {
          ctx.send({ result: "ERROR", message: "아직 등록되지 않았습니다😅" });
          return;
        }

        // Option 가져오기
        const getOption = await trx.raw(
          `
          SELECT *
          FROM options
          `
        );
        const option = getOption[0][0];
        const kakaouids = step1[0][0];
        const isPoint = option.selectPointCost < kakaouids.point;

        const step3 = await trx.raw(
          `
          INSERT INTO messages (
            kakaouid, 
            room, 
            message,
            point,
            isPoint
          )
          VALUES(
            :kakaouid, 
            :room, 
            :message,
            :point,
            :isPoint
          )`,
          {
            kakaouid: kakaouids.id,
            room: body.room,
            message: "[포인트조회]",
            point: -option.selectPointCost,
            isPoint: isPoint,
          }
        );

        if (isPoint) {
          const step4 = await trx.raw(
            `
            UPDATE kakaouids 
            SET point = IFNULL(point, 0) + :point
            WHERE id = :kakaouid`,
            {
              kakaouid: kakaouid,
              point: -option.selectPointCost,
            }
          );
        } else {
          ctx.send({ result: "ERROR", message: "포인트가 부족합니다😂" });
          return;
        }

        const step5 = await trx.raw(
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
        ctx.send({ result: "SUCCESS", message: step5[0][0] });
      } catch (err) {
        trx.rollback();
        ctx.send({
          result: "ERROR",
          message: "DB Error ![" + err.message + "]",
        });
      }
    } catch (err) {
      ctx.send({
        result: "ERROR",
        message: "Critical Error ![" + err.message + "]",
      });
    }
  },
};
