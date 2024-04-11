DROP TABLE IF EXISTS presents;

CREATE TABLE presents ( 
    presentId INT PRIMARY KEY AUTO_INCREMENT, 
    userID INT REFERENCES users(userId), 
    title VARCHAR(128), link VARCHAR(4096), 
    modified TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP);