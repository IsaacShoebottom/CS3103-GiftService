DELIMITER //
DROP PROCEDURE IF EXISTS updatePresentById // 

CREATE PROCEDURE updatePresentById(IN idIn INT, IN titleIn varchar(20), IN linkIn varchar(50))
BEGIN
    UPDATE presents
    SET title = titleIn, link = linkIn
    WHERE presentId = idIn;
END//
DELIMITER ;