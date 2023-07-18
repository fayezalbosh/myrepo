-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2023 at 01:42 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `s`
--
CREATE DATABASE IF NOT EXISTS `s` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `s`;

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `DeleteOld`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteOld` ()   DELETE FROM `employee-status` WHERE date<>CURRENT_DATE()$$

DROP PROCEDURE IF EXISTS `InsertRecord`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertRecord` (IN `tTimeStamp_Out` BIGINT(11), IN `tTimeStamp_In` BIGINT(11), IN `tTolatTimeSpentOut` INT(11), IN `tIsOutside` TINYINT(1), IN `ttimes` INT(11), IN `tout_stamps_x` TEXT, IN `tin_stamps_x` TEXT, IN `Sarcode` INT(4))   INSERT INTO `employee-status` (Timestamp_Out, Timestamp_In,
                               Total_Time_Spent_Out,Is_Outside,
                               Times,out_stamps,in_stamps,barcode)
VALUES (tTimeStamp_Out,tTimeStamp_In, 
        tTolatTimeSpentOut,tIsOutside,
        ttimes,tout_stamps_x,tin_stamps_x,Sarcode)$$

DROP PROCEDURE IF EXISTS `UpdateRecord`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateRecord` (IN `tTimeStamp_Out` BIGINT(11), IN `tTimeStamp_In` BIGINT(11), IN `tTolatTimeSpentOut` INT(11), IN `tIsOutside` TINYINT(1), IN `ttimes` INT(11), IN `tout_stamps_x` TEXT, IN `tin_stamps_x` TEXT, IN `Sarcode` INT(4))   UPDATE `employee-status`
SET Timestamp_Out=tTimeStamp_Out,
Timestamp_In=tTimeStamp_In,
Total_Time_Spent_Out=tTolatTimeSpentOut,
Is_Outside=tIsOutside,
Times=ttimes,
out_stamps=tout_stamps_x,
in_stamps=tin_stamps_x
WHERE barcode=Sarcode$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `employee-status`
--

DROP TABLE IF EXISTS `employee-status`;
CREATE TABLE `employee-status` (
  `barcode` int(4) NOT NULL,
  `Timestamp_Out` bigint(11) NOT NULL DEFAULT 0,
  `Timestamp_In` bigint(11) NOT NULL DEFAULT 0,
  `Total_Time_Spent_Out` int(11) NOT NULL DEFAULT 0,
  `Is_Outside` tinyint(1) NOT NULL DEFAULT 0,
  `Times` int(11) NOT NULL DEFAULT 0,
  `out_stamps` text NOT NULL DEFAULT '\'empty\'',
  `in_stamps` text NOT NULL DEFAULT '\'empty\'',
  `date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employee-status`
--

INSERT INTO `employee-status` (`barcode`, `Timestamp_Out`, `Timestamp_In`, `Total_Time_Spent_Out`, `Is_Outside`, `Times`, `out_stamps`, `in_stamps`, `date`) VALUES
(1057, 1682845409904, 1682838782584, 0, 1, 14, '1682838978813,1682839105593,1682840316009,1682841742097,1682842294883,1682842732591,1682842765046,1682842791273,1682842820038,1682843149357,1682843403328,1682844796524,1682845236317,1682845409904', '1682838782584', '2023-04-30'),
(1866, 1682849177463, 0, 0, 1, 14, '1682838798484,1682839105602,1682841742105,1682842294899,1682842732596,1682842765053,1682842791280,1682842820043,1682843149365,1682843403339,1682844796535,1682845236327,1682845409914,1682849177463', '0', '2023-04-30'),
(2126, 1682845409922, 1682839076957, 218, 1, 13, '1682838858546,1682839105609,1682841742115,1682842294907,1682842732603,1682842765056,1682842791282,1682842820046,1682843149372,1682843403348,1682844796545,1682845236338,1682845409922', '0,1682839076957', '2023-04-30'),
(2147483647, 1682847164232, 1682847164232, 0, 0, 0, '', '1682847158377,1682847164232', '2023-04-30'),
(2147483647, 1682847164232, 1682847164232, 0, 0, 0, '', '1682847158377,1682847164232', '2023-04-30'),
(2132, 1682850421834, 1682850421834, 419, 0, 1, '1682850003106', '1682847679674,1682850421834', '2023-04-30'),
(1888, 1682849799263, 1682849799263, 0, 0, 0, '', '1682849799263', '2023-04-30'),
(2116, 1682851058916, 0, 0, 1, 1, '1682851058916', '', '2023-04-30'),
(1823, 0, 0, 0, 1, 0, '', '', '2023-04-30'),
(1808, 0, 0, 0, 1, 0, '', '', '2023-04-30');

-- --------------------------------------------------------

--
-- Table structure for table `employees-log`
--

DROP TABLE IF EXISTS `employees-log`;
CREATE TABLE `employees-log` (
  `barcode` int(4) NOT NULL,
  `timestamp` int(11) NOT NULL,
  `in or out` varchar(3) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employees-log`
--

INSERT INTO `employees-log` (`barcode`, `timestamp`, `in or out`, `date`) VALUES
(1020, 1231223, 'out', '2023-03-05'),
(2119, 552545, 'in', '2023-03-06'),
(1012, 654987, 'in', '2023-03-06'),
(1058, 100000, 'in', '2023-03-06'),
(1058, 100000, 'in', '2023-03-06'),
(1058, 100000, 'in', '2023-03-06'),
(2119, 1231223, 'in', '2023-03-07');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
