DELIMITER //
DROP PROCEDURE IF EXISTS createPresent //

CREATE PROCEDURE createPresent(IN usernameIn varchar(20), IN titleIn varchar(128), IN linkIn varchar(4096))
BEGIN
INSERT INTO presents (userId, title, link) 
    VALUES (
    (SELECT userId FROM users WHERE username = usernameIn),
    titleIn,
    linkIn);
SELECT LAST_INSERT_ID();
END//
DELIMITER ;