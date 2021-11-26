module.exports = {
  selectKakaouids: `/* SQL */
    SELECT 
      *
    FROM 
      kakaouids
    WHERE
      sender = :sender AND
      imageProfileBase64 = :imageProfileBase64
  `,
  insertKakaouids: `/* SQL */
    INSERT INTO kakaouids (
      sender, 
      imageProfileBase64,
      walletKey,
      point
    )
    VALUES(
      :sender, 
      :imageProfileBase64,
      :walletKey,
      :point
    )
  `,
  updateKakaouids: `/* SQL */
    UPDATE kakaouids 
    SET point = IFNULL(point, 0) + :point
    WHERE id = :kakaouid
  `,
  updateKakaouidsWallet: `/* SQL */
    UPDATE 
      kakaouids
    SET 
      walletKey = :walletKey
    WHERE
      sender = :sender AND
      imageProfileBase64 = :imageProfileBase64
  `,
};
