DELIMITER //
DROP PROCEDURE IF EXISTS deletePresent //

CREATE PROCEDURE deletePresent(IN usernameIn varchar(20), IN titleIn varchar(20))
BEGIN
DELETE FROM presents
    WHERE (SELECT userId FROM users WHERE username = usernameIn) = userId
    AND title = titleIn;
END//
DELIMITER ;