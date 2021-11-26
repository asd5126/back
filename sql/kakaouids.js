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
      point
    )
    VALUES(
      :sender, 
      :imageProfileBase64,
      :point
    )
  `,
  updateKakaouids: `/* SQL */
    UPDATE kakaouids 
    SET point = IFNULL(point, 0) + :point
    WHERE id = :kakaouid
  `,
  insertKakaouidsWallet: `/* SQL */
    INSERT INTO kakaouids (
      sender, 
      imageProfileBase64,
      walletKey
    )
    VALUES(
      :sender, 
      :imageProfileBase64,
      :walletKey
    )
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
