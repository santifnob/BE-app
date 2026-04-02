CREATE DATABASE  IF NOT EXISTS `ferrocarril` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE  IF NOT EXISTS `ferrocarril_test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ferrocarril`;

CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON ferrocarril.* TO 'admin'@'localhost';
GRANT ALL PRIVILEGES ON ferrocarril_test.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
