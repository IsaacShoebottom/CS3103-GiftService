DELIMITER //
DROP PROCEDURE IF EXISTS updatePresent // 

CREATE PROCEDURE updatePresent(IN usernameIn varchar(20), IN titleIn varchar(20), IN nTitleIn varchar(20), IN nLinkIn varchar(50))
BEGIN
    UPDATE presents
    JOIN users
    ON presents.userId = users.userId
    SET presents.link = nLinkIn, presents.title = nTitleIn
    WHERE users.username = usernameIn
    AND presents.title = titleIn;
END//
DELIMITER ;