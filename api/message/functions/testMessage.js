module.exports = async (ctx) => {
  // console.log(ctx.request.body);
  // console.log(ctx.params);
  // console.log(ctx.query);

  try {
    const body = ctx.request.body;

    if (!body.sender || !body.imageProfileBase64 || !body.room || !body.message) {
      ctx.send({ result: "ERROR", message: "Validation Error" });
      return;
    }

    const trx = await strapi.connections.default.transaction();

    try {
      // Option 가져오기
      const getOption = await trx("options");
      const option = getOption[0];
      const point = (Math.random() * option.maxPoint + option.minPoint).toFixed(3);

      const step1 = await trx("kakaouids").where("sender", body.sender).where("imageProfileBase64", body.imageProfileBase64);

      let kakaouid = 0;

      // 유저 정보가 없는 경우
      if (step1.length === 0) {
        const step2 = await trx("kakaouids").insert({
          sender: body.sender,
          imageProfileBase64: body.imageProfileBase64,
          point: 0,
        });

        kakaouid = step2[0];
        // 유저 정보가 있는 경우
      } else {
        kakaouid = step1[0].id;
      }

      const timeCheckQuery = await trx
        .select(trx.raw("TIME_TO_SEC(TIMEDIFF(CURRENT_TIMESTAMP, a.created_at)) AS timeDiff"))
        .from({
          a: "messages",
          b: "kakaouids",
        })
        .where("a.kakaouid", kakaouid)
        .where("a.isPoint", 1)
        .orderBy("a.id", "desc")
        .limit(1);

      console.log(timeCheckQuery);

      console.log(
        trx
          .select(trx.raw("TIME_TO_SEC(TIMEDIFF(CURRENT_TIMESTAMP, a.created_at)) AS timeDiff"))
          .from({
            a: "messages",
            b: "kakaouids",
          })
          .where("a.kakaouid", kakaouid)
          .where("a.isPoint", 1)
          .orderBy("a.id", "desc")
          .limit(1)
      );

      let isPoint = true;
      if (timeCheckQuery.length > 0 && option.pointDelaySecond - timeCheckQuery[0].timeDiff > 0) isPoint = false;

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
};
