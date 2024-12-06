/*

The database:


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` mediumint(9) NOT NULL AUTO_INCREMENT,
  `userName` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE (`userName`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `location`;
CREATE TABLE `location` (
  `locationId` mediumint(9) NOT NULL AUTO_INCREMENT,
  `zip` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `userId` mediumint(9) NOT NULL,
  PRIMARY KEY (`locationId`),
  FOREIGN KEY (`userId`) REFERENCES users(`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `favoriteId` mediumint(9) NOT NULL AUTO_INCREMENT,
  `Humidity` varchar(20) COLLATE utf8_unicode_ci,
  `Wind` varchar(20) COLLATE utf8_unicode_ci,
  `Pressure` varchar(20) COLLATE utf8_unicode_ci,
  `Visibility` varchar(20) COLLATE utf8_unicode_ci,
  `Sunrise` varchar(20) COLLATE utf8_unicode_ci,
  `Sunset` varchar(20) COLLATE utf8_unicode_ci,
  `Description` varchar(20) COLLATE utf8_unicode_ci,
  `Cloudiness` varchar(20) COLLATE utf8_unicode_ci,
  `Fahrenheit` varchar(20) COLLATE utf8_unicode_ci,
  `Celsius` varchar(20) COLLATE utf8_unicode_ci,
  `locationId` mediumint(9) NOT NULL,
  PRIMARY KEY (`favoriteId`),
  FOREIGN KEY (`locationId`) REFERENCES `location`(`locationId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;






Use my db currently hooked up or new one? - Aryeh


SQL mockup:

CREATE TABLE User (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  Password VARCHAR(72) NOT NULL (USING BCRYPT?)
  email?
);
  
CREATE TABLE Location (
  LocationID INT AUTO_INCREMENT PRIMARY KEY,
  Zip VARCHAR(5) NOT NULL, (US only?)
  UserID INT,
  FOREIGN KEY (UserID) REFERENCES User(UserID)
);

   How do we want to handle long/ lat? Could store it in db but I like the
   idea of converting it to a zip and then storing it. I believe I did that
   when I made my weather app. I might have used an API to do it.

CREATE TABLE Favorites (
  FavoriteID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  ... ideas?
  FOREIGN KEY (UserID) REFERENCES User(UserID)
);

// preferences table instead of ^ ?

CREATE TABLE Preferences (
  PreferenceID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  Units VARCHAR(1) NOT NULL, (C or F?)
  Humidity BOOLEAN DEFAULT FALSE,
  Wind BOOLEAN DEFAULT FALSE,
  MoonPhase BOOLEAN DEFAULT FALSE,
  Sunrise BOOLEAN DEFAULT FALSE,
  Sunset BOOLEAN DEFAULT FALSE,
  Rain BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (UserID) REFERENCES User(UserID)
);

*/