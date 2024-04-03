DELIMITER //
DROP PROCEDURE IF EXISTS createUser //

CREATE PROCEDURE createUser(IN usernameIn varchar(20))
BEGIN
IF NOT EXISTS (SELECT * FROM users WHERE username = usernameIn) THEN
   INSERT INTO users (username) VALUES (usernameIn);
   SELECT LAST_INSERT_ID();
END IF;
END//
DELIMITER ;