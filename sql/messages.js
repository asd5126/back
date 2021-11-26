module.exports = {
  selectTimeCheckQuery: `/* SQL */
    SELECT TIME_TO_SEC(TIMEDIFF(CURRENT_TIMESTAMP, a.created_at)) AS timeDiff
    FROM messages a,
        kakaouids b
    WHERE a.kakaouid = b.id AND
          a.kakaouid = :kakaouid AND
          a.isPoint = 1
    ORDER BY a.id DESC
    LIMIT 0, 1
  `,
  insertMessages: `/* SQL */
    INSERT INTO messages (
      kakaouid, 
      room, 
      sender,
      message,
      point,
      isPoint
    )
    VALUES(
      :kakaouid, 
      :room, 
      :sender, 
      :message,
      :point,
      :isPoint
    )
  `,
};
