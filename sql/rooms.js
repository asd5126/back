module.exports = {
  selectRoomBoss: `/* SQL */
    SELECT
      a.room,
      b.sender
    FROM
      rooms a,
      kakaouids b
    WHERE
      a.bossuid = b.id 
	    AND a.room = b.room
      AND a.room = :room 
  `,
  selectBossCheck: `/* SQL */
    SELECT
      *
    FROM
      rooms a,
      kakaouids b
    WHERE
      a.bossuid = b.id 
      AND a.room = b.room
      AND b.room = :room 
      AND b.sender = :sender 
      AND b.imageProfileBase64 = :imageProfileBase64 
  `,
};
