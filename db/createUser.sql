DELIMITER //
DROP PROCEDURE IF EXISTS createUser //

CREATE PROCEDURE createUser(IN usernameIn varchar(20))
BEGIN
INSERT INTO users (username) VALUES
   (usernameIn);
SELECT LAST_INSERT_ID();
END//
DELIMITER ;