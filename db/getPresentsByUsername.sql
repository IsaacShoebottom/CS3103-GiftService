DELIMITER //
DROP PROCEDURE IF EXISTS getPresentsByUsername // 

CREATE PROCEDURE getPresentsByUsername(IN usernameIn varchar(20))
BEGIN
   SELECT presents.presentId, presents.title, presents.link
      FROM presents
      INNER JOIN users
      ON (presents.userId = users.userId)
      WHERE users.username = usernameIn;
END//
DELIMITER ;