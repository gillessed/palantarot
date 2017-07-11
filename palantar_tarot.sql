-- phpMyAdmin SQL Dump
-- version 4.0.10.14
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Sep 01, 2016 at 06:31 PM
-- Server version: 5.5.50-cll
-- PHP Version: 5.6.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `palantar_tarot`
--

-- --------------------------------------------------------

--
-- Table structure for table `hand`
--

CREATE TABLE IF NOT EXISTS `hand` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'hand ID',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `players` int(1) NOT NULL COMMENT 'How many players in the game',
  `bidder_fk_id` int(11) NOT NULL COMMENT 'player id for bidder',
  `partner_fk_id` int(11) DEFAULT NULL COMMENT 'player id for partner',
  `bid_amt` int(11) NOT NULL COMMENT 'How much the bidder bid',
  `king_called` text COMMENT 'which king was called by bidder',
  `points` int(11) NOT NULL,
  `slam` int(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8735 ;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE IF NOT EXISTS `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'player ID',
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `email` text NOT NULL,
  `emp_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=82 ;

-- --------------------------------------------------------

--
-- Table structure for table `player_hand`
--

CREATE TABLE IF NOT EXISTS `player_hand` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hand_fk_id` int(11) NOT NULL COMMENT 'to associate hand with player',
  `player_fk_id` int(11) NOT NULL COMMENT 'player id',
  `was_bidder` int(11) DEFAULT NULL,
  `was_partner` int(11) DEFAULT NULL,
  `showed_trump` int(11) DEFAULT NULL,
  `one_last` int(11) DEFAULT NULL,
  `points_earned` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=42294 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
