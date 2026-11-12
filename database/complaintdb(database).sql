-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 12, 2026 at 02:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `complaintdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_ai_analysis`
--

CREATE TABLE `tbl_ai_analysis` (
  `analysisID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `urgency` enum('HIGH','NORMAL') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `confidence` decimal(5,4) DEFAULT 0.0000,
  `containsProfanity` tinyint(1) DEFAULT 0,
  `imageAnalysis` text DEFAULT NULL,
  `imageMatch` enum('MATCH','PARTIAL_MATCH','MISMATCH','INCONCLUSIVE') DEFAULT 'INCONCLUSIVE',
  `imageMatchConfidence` decimal(5,4) DEFAULT 0.0000,
  `verificationFlag` tinyint(1) DEFAULT 0,
  `analyzedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `mediaSafety` varchar(30) DEFAULT 'INCONCLUSIVE',
  `mediaSafetyConfidence` decimal(5,4) DEFAULT 0.0000,
  `mediaSafetyReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_ai_analysis`
--

INSERT INTO `tbl_ai_analysis` (`analysisID`, `complaintID`, `category`, `urgency`, `location`, `summary`, `confidence`, `containsProfanity`, `imageAnalysis`, `imageMatch`, `imageMatchConfidence`, `verificationFlag`, `analyzedAt`, `mediaSafety`, `mediaSafetyConfidence`, `mediaSafetyReason`) VALUES
(3, 31, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:28:41', 'INCONCLUSIVE', 0.0000, NULL),
(4, 32, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:33:07', 'INCONCLUSIVE', 0.0000, NULL),
(5, 33, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:34:09', 'INCONCLUSIVE', 0.0000, NULL),
(6, 34, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:38:00', 'INCONCLUSIVE', 0.0000, NULL),
(7, 35, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:38:47', 'INCONCLUSIVE', 0.0000, NULL),
(8, 36, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:39:47', 'INCONCLUSIVE', 0.0000, NULL),
(9, 37, 'Obstruction', 'NORMAL', 'Unknown', '', 0.0000, 0, '', 'INCONCLUSIVE', 0.0000, 0, '2026-08-20 23:41:32', 'INCONCLUSIVE', 0.0000, NULL),
(10, 38, 'Fire', 'HIGH', 'Unknown', 'A resident is urgently requesting assistance due to an active fire.', 0.9900, 0, 'The image is extremely dark and obscured, making it impossible to visually verify any fire or surroundings.', 'INCONCLUSIVE', 0.9500, 1, '2026-08-20 23:56:49', 'INCONCLUSIVE', 0.0000, NULL),
(11, 39, 'Fire', 'HIGH', 'Unknown', 'An active fire has been reported.', 0.9500, 0, 'The image shows an active fire with visible flames and smoke surrounding trees.', 'MATCH', 0.9500, 0, '2026-08-21 03:04:47', 'INCONCLUSIVE', 0.0000, NULL),
(12, 40, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video evidence uploaded. Video analysis is not enabled.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-21 17:17:39', 'INCONCLUSIVE', 0.0000, NULL),
(13, 41, 'Fire', 'HIGH', 'Unknown', 'A resident is urgently requesting assistance due to a strong, active fire in their area.', 0.9800, 0, 'The image shows large, active flames and intense fire, which matches the user\'s report of a strong fire.', 'MATCH', 0.9700, 1, '2026-08-26 01:44:05', 'INCONCLUSIVE', 0.0000, NULL),
(14, 42, 'Flood', 'HIGH', 'Unknown', 'A resident is requesting assistance due to high floodwaters in their area.', 0.9800, 0, 'The image shows a flooded street with multiple residents wading through deep floodwaters.', 'MATCH', 0.9500, 1, '2026-08-26 01:47:41', 'INCONCLUSIVE', 0.0000, NULL),
(15, 43, 'Obstruction', 'NORMAL', 'Unknown', 'A resident is complaining about heavily scattered garbage.', 0.9500, 0, 'The image shows a stock photo of a garbage pile from iStock displayed on a mobile phone screen.', 'PARTIAL_MATCH', 0.9000, 1, '2026-08-26 01:49:47', 'INCONCLUSIVE', 0.0000, NULL),
(16, 44, 'Obstruction', 'NORMAL', 'Unknown', 'A complaint was filed regarding a severe accumulation of garbage.', 0.9500, 0, 'The image is completely dark and does not show any garbage or identifiable objects.', 'MISMATCH', 0.9800, 1, '2026-08-26 01:55:40', 'INCONCLUSIVE', 0.0000, NULL),
(17, 45, 'Obstruction', 'NORMAL', 'Unknown', 'A resident is complaining about obstructions blocking their local area.', 0.9500, 0, 'The image is completely black and does not show any visible obstructions.', 'MISMATCH', 0.9800, 1, '2026-08-26 03:40:00', 'INCONCLUSIVE', 0.0000, NULL),
(18, 46, 'Obstruction', 'NORMAL', 'Unknown', 'The complaint contains only the word \'Shish\' and lacks any descriptive details of an incident.', 0.1000, 0, 'The image is completely black and contains no discernible objects or evidence.', 'INCONCLUSIVE', 0.9500, 0, '2026-08-27 21:47:54', 'SAFE', 0.9900, 'The image is completely black and contains no inappropriate content.'),
(19, 47, 'Flood', 'NORMAL', 'Tinaheros', 'Flooding is reported in Tinaheros.', 0.9500, 0, 'The image shows a hand giving a thumbs-up gesture indoors under a roof, with no visible signs of flooding.', 'MISMATCH', 0.9800, 1, '2026-08-27 21:50:55', 'SAFE', 0.9800, 'The image contains ordinary complaint evidence.'),
(20, 48, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The video frames depict an indoor residential or storage area with clothing and household items. Although a hand gesture is shown, there is no graphic violence, injuries, or sexually explicit material.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-27 22:04:39', 'SAFE', 0.9200, 'The video frames depict an indoor residential or storage area with clothing and household items. Although a hand gesture is shown, there is no graphic violence, injuries, or sexually explicit material.'),
(21, 49, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The frames are extremely blurry and dark, preventing clear identification of any subject matter.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-28 20:09:50', 'INCONCLUSIVE', 0.6500, 'The frames are extremely blurry and dark, preventing clear identification of any subject matter.'),
(22, 50, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The images are extremely blurry and dark, preventing clear identification of any objects or context.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-28 20:33:53', 'INCONCLUSIVE', 0.7500, 'The images are extremely blurry and dark, preventing clear identification of any objects or context.'),
(23, 51, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The frames are extremely dark and blurry, making it impossible to identify any content.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-28 20:48:55', 'INCONCLUSIVE', 0.7500, 'The frames are extremely dark and blurry, making it impossible to identify any content.'),
(24, 52, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The frames are extremely blurry and lack discernible visual information to make a definitive safety classification.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-28 21:05:23', 'INCONCLUSIVE', 0.7500, 'The frames are extremely blurry and lack discernible visual information to make a definitive safety classification.'),
(25, 53, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The frames are extremely dark and blurry, lacking discernible details to determine content safety.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-28 21:13:07', 'INCONCLUSIVE', 0.7200, 'The frames are extremely dark and blurry, lacking discernible details to determine content safety.'),
(26, 54, 'Obstruction', 'NORMAL', 'Unknown', 'Complaint submitted with video evidence.', 0.0000, 0, 'Video safety analysis: The frames are extremely dark and lack sufficient visual detail to determine the content.', 'INCONCLUSIVE', 0.0000, 1, '2026-08-28 21:16:57', 'INCONCLUSIVE', 0.6000, 'The frames are extremely dark and lack sufficient visual detail to determine the content.'),
(27, 55, 'Fire', 'HIGH', 'Unknown', 'A fire incident has been reported.', 0.9500, 0, 'The image is completely black and does not show any signs of fire, smoke, or any identifiable objects.', 'MISMATCH', 0.9800, 1, '2026-09-01 09:17:11', 'SAFE', 0.9900, 'The image is completely black and contains no inappropriate or graphic content.'),
(28, 56, 'Obstruction', 'NORMAL', 'Unknown', 'A power outage is being reported with no electricity in the area.', 0.5000, 0, 'The image depicts a pitch-black indoor setting with household items illuminated only by a flashlight, confirming a power outage.', 'MATCH', 0.9500, 1, '2026-09-01 10:55:49', 'SAFE', 0.9900, 'The image shows a dark room during a blackout, which is safe and relevant to the complaint.'),
(29, 57, 'Fire', 'HIGH', 'Catmon', 'A fire incident is reported in Catmon.', 0.9900, 0, 'The image is completely black and does not show any signs of fire, smoke, or surroundings.', 'MISMATCH', 0.9800, 1, '2026-09-02 05:41:11', 'SAFE', 0.9900, 'The image is completely black and contains no inappropriate content.'),
(30, 58, 'Fire', 'NORMAL', 'Catmon', 'A fire is reported in Catmon.', 0.9500, 0, 'The submitted visual evidence shows a building engulfed in large flames and smoke.', 'MATCH', 0.9500, 1, '2026-09-23 03:30:32', 'SAFE', 0.9500, 'The visual evidence shows a structural fire and contains no inappropriate content.'),
(31, 59, 'Fire', 'HIGH', 'Catmon', 'A strong fire is reported in Catmon.', 0.9900, 0, 'The uploaded image shows a building engulfed in large flames and smoke.', 'MATCH', 0.9800, 1, '2026-09-23 03:37:40', 'SAFE', 0.9900, 'The visual evidence depicts a fire incident and contains no inappropriate or policy-violating content.'),
(32, 60, 'Fire', 'HIGH', 'Malabon', 'A fire is reported in Malabon.', 0.9500, 0, 'The submitted image shows an indoor view looking out an open green door toward an outdoor area with a brick wall and a red cross symbol, with no visible fire, flames, or smoke.', 'INCONCLUSIVE', 0.9000, 0, '2026-09-23 20:52:26', 'SAFE', 0.9900, 'The visual evidence is an ordinary indoor photo and contains no inappropriate content.'),
(33, 61, 'Obstruction', 'NORMAL', 'Araneta Malabon', 'An earthquake is reported in Araneta Malabon.', 0.8500, 0, 'The uploaded image shows an indoor setting with a person sitting on a sofa and looking at a small item. There is no visible evidence of an earthquake, structural damage, or emergency conditions.', 'MISMATCH', 0.9000, 0, '2026-10-01 01:39:46', 'SAFE', 0.9900, 'The visual evidence shows a normal indoor setting and contains no inappropriate or graphic content.'),
(34, 62, 'Fire', 'HIGH', 'Araneta Malabon', 'A fire is reported in Araneta, Malabon.', 0.9500, 0, 'The submitted image shows an indoor room with a person sitting on the floor near a couch, with no visible fire, smoke, or related emergency.', 'MISMATCH', 0.9500, 0, '2026-10-01 01:40:35', 'SAFE', 0.9800, 'The visual evidence is an ordinary indoor photo containing no inappropriate or graphic content.'),
(35, 63, 'Obstruction', 'NORMAL', 'Santulan', 'Garbage is reported in Santulan.', 0.9500, 0, 'The submitted visual evidence shows an open indoor waste bin containing what appears to be trash and packaging materials.', 'PARTIAL_MATCH', 0.8000, 1, '2026-10-01 04:17:41', 'SAFE', 0.9900, 'The visual evidence is ordinary legitimate complaint evidence and contains no inappropriate content.'),
(36, 64, 'Obstruction', 'NORMAL', 'Barangay Santulan', 'Garbage is reported in Barangay Santulan.', 0.9500, 0, 'The submitted visual evidence shows indoor household items, bottles, and shelves, which do not show garbage in Barangay Santulan.', 'MISMATCH', 0.9500, 0, '2026-10-01 04:29:31', 'SAFE', 0.9900, 'The visual evidence shows ordinary indoor items and contains no inappropriate or graphic content.'),
(37, 65, 'Obstruction', 'NORMAL', 'Catmon', 'A pile of garbage is reported blocking the front of a school in Catmon.', 0.9500, 0, 'The uploaded image is completely black and does not show any visible details.', 'INCONCLUSIVE', 0.9900, 0, '2026-10-01 20:24:54', 'SAFE', 0.9900, 'The image is entirely black and contains no inappropriate or harmful content.'),
(38, 66, 'Obstruction', 'NORMAL', 'Longos, Malabon City', 'A foul odor, described as smelling like a dead rat, is reported in Longos, Malabon City.', 0.8500, 0, 'The uploaded image shows a young boy playing on a mobile phone indoors, completely unrelated to the reported foul odor or the location described.', 'MISMATCH', 0.9800, 0, '2026-10-08 05:53:32', 'SAFE', 0.9900, 'The image contains an ordinary, harmless indoor scene with no inappropriate or graphic content.'),
(39, 67, 'Obstruction', 'NORMAL', 'Longos', 'Garbage is reported in Longos.', 0.9500, 0, 'The submitted image shows a black plastic garbage bag placed on the ground next to a concrete wall.', 'MATCH', 0.9500, 1, '2026-10-13 23:48:41', 'SAFE', 0.9800, 'The visual evidence is ordinary legitimate complaint evidence and contains no inappropriate content.'),
(40, 68, 'Traffic', 'NORMAL', 'Catmon', 'Traffic congestion is reported in Catmon.', 0.9500, 0, 'The uploaded image is completely dark and does not clearly show any traffic conditions or recognizable objects.', 'INCONCLUSIVE', 0.9000, 0, '2026-10-14 02:22:53', 'SAFE', 0.9900, 'The visual evidence is a dark, low-quality image containing no inappropriate or harmful content.'),
(41, 69, 'Fire', 'HIGH', 'Ibaba, Malabon', 'A fire incident is reported in Ibaba, Malabon.', 0.9500, 0, 'The image shows the interior of a room or house with people walking around, but no visible flames, smoke, or evidence of a fire.', 'INCONCLUSIVE', 0.9000, 0, '2026-10-14 06:07:39', 'SAFE', 0.9800, 'The visual evidence is an ordinary indoor photograph and contains no inappropriate or graphic content.'),
(42, 70, 'Obstruction', 'NORMAL', 'Del Monte Sabungan', 'Trash is reported piling up near Del Monte Sabungan.', 0.9500, 0, 'The uploaded image is completely dark, black, and provides no visible details to analyze.', 'INCONCLUSIVE', 0.9900, 0, '2026-10-15 01:05:32', 'SAFE', 0.9900, 'The visual evidence contains no inappropriate content, only a dark or uninformative image.'),
(43, 71, 'Obstruction', 'NORMAL', 'palengke ng catmon malapit sa may robinson', 'Garbage is reported accumulated near the Catmon market near Robinson.', 0.9500, 0, 'The submitted image is completely black and provides no visible evidence to analyze.', 'INCONCLUSIVE', 0.9500, 0, '2026-10-15 03:04:21', 'SAFE', 0.9900, 'The visual evidence contains no inappropriate content.'),
(44, 72, 'Obstruction', 'NORMAL', 'Barangay Catmon', 'Neighbors are reported drinking and making noise in Barangay Catmon.', 0.8500, 0, 'The video frames show indoor objects such as a plastic chair, a wall, and curtains, which do not clearly show the reported incident.', 'INCONCLUSIVE', 0.7000, 0, '2026-10-15 03:51:52', 'SAFE', 0.9500, 'The visual evidence is ordinary and contains no inappropriate content.'),
(45, 73, 'Obstruction', 'NORMAL', 'Catmon', 'Scattered garbage is reported in Catmon.', 0.9500, 0, 'The uploaded image is a dark, indistinct reddish-brown surface that shows no clear details related to the reported garbage.', 'INCONCLUSIVE', 0.9000, 0, '2026-10-15 07:19:16', 'SAFE', 0.9800, 'The visual evidence contains no inappropriate, explicit, or graphic content.'),
(46, 74, 'Obstruction', 'NORMAL', 'Tinajeros', 'Garbage is reported in Tinajeros.', 0.9500, 0, 'The submitted image is entirely dark and unclear, providing no visible details.', 'INCONCLUSIVE', 0.9500, 0, '2026-10-15 07:53:20', 'SAFE', 0.9800, 'The image contains no inappropriate content and is simply dark or unclear.'),
(47, 75, 'Fire', 'HIGH', 'Malabon City', 'A fire is reported in Malabon City.', 0.9800, 0, 'The uploaded image shows a laptop and a computer mouse on a desk surface, completely unrelated to a fire incident.', 'MISMATCH', 0.9900, 0, '2026-10-15 08:34:09', 'SAFE', 0.9900, 'The image is a harmless photo of a desk setup and contains no inappropriate or graphic content.'),
(48, 76, 'Obstruction', 'NORMAL', 'Barangay Catmon', 'Scattered garbage is reported in Barangay Catmon.', 0.9500, 0, 'The submitted image shows a computer keyboard and a laptop sticker, which is unrelated to the complaint about scattered garbage.', 'MISMATCH', 0.9800, 0, '2026-10-15 10:26:45', 'SAFE', 0.9900, 'The visual evidence contains ordinary objects and no inappropriate or dangerous content.'),
(49, 77, 'FIRE', 'HIGH', NULL, NULL, 0.0000, 0, NULL, 'INCONCLUSIVE', 0.0000, 0, '2026-10-16 21:45:13', 'INCONCLUSIVE', 0.0000, NULL),
(50, 78, 'Fire', 'HIGH', 'Fourth Emergency Test Cluster', 'Test house fire with heavy smoke and visible flames.', 0.9500, 0, 'Test evidence', 'MATCH', 0.9500, 0, '2026-10-17 08:38:12', 'SAFE', 0.9500, 'Synthetic test data for emergency cluster testing'),
(51, 79, 'Fire', 'HIGH', 'Fourth Emergency Test Cluster', 'Test active fire spreading to a nearby structure.', 0.9500, 0, 'Test evidence', 'MATCH', 0.9500, 0, '2026-10-17 08:38:12', 'SAFE', 0.9500, 'Synthetic test data for emergency cluster testing'),
(52, 80, 'Fire', 'HIGH', 'Fourth Emergency Test Cluster', 'Test fire report with possible occupants inside.', 0.9500, 0, 'Test evidence', 'MATCH', 0.9500, 0, '2026-10-17 08:38:12', 'SAFE', 0.9500, 'Synthetic test data for emergency cluster testing'),
(53, 81, 'Fire', 'HIGH', 'Fourth Emergency Test Cluster', 'Test building fire threatening nearby homes.', 0.9500, 0, 'Test evidence', 'MATCH', 0.9500, 0, '2026-10-17 08:38:12', 'SAFE', 0.9500, 'Synthetic test data for emergency cluster testing'),
(54, 82, 'Fire', 'HIGH', 'Fourth Emergency Test Cluster', 'Test active fire spreading rapidly.', 0.9500, 0, 'Test evidence', 'MATCH', 0.9500, 0, '2026-10-17 08:38:12', 'SAFE', 0.9500, 'Synthetic test data for emergency cluster testing'),
(55, 83, 'Fire', 'HIGH', 'Fourth Emergency Test Cluster', 'Test serious fire emergency with flames and thick smoke.', 0.9500, 0, 'Test evidence', 'MATCH', 0.9500, 0, '2026-10-17 08:38:12', 'SAFE', 0.9500, 'Synthetic test data for emergency cluster testing'),
(56, 84, 'Fire', 'HIGH', 'Acacia, Malabon City', 'Active house fire with spreading flames and heavy smoke.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(57, 85, 'Fire', 'HIGH', 'Baritan, Malabon City', 'Kitchen fire spreading inside a residential property.', 0.8600, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(58, 86, 'Fire', 'HIGH', 'Catmon, Malabon City', 'Commercial fire with possible occupants trapped inside.', 0.8900, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(59, 87, 'Fire', 'HIGH', 'Tonsuya, Malabon City', 'Fire threatening nearby residential properties.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(60, 88, 'Fire', 'HIGH', 'Concepcion, Malabon City', 'Electrical fire producing smoke inside a building.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(61, 89, 'Fire', 'HIGH', 'Dampalit, Malabon City', 'House fire with a person reportedly unable to exit.', 0.9000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(62, 90, 'Fire', 'HIGH', 'Longos, Malabon City', 'Warehouse fire with rapidly spreading flames.', 0.8700, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(63, 91, 'Fire', 'HIGH', 'Potrero, Malabon City', 'Vehicle fire posing a risk to nearby homes.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(64, 92, 'Fire', 'HIGH', 'Ibaba, Malabon City', 'Upper-floor house fire with a possible trapped occupant.', 0.8800, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(65, 93, 'Fire', 'HIGH', 'Niugan, Malabon City', 'Restaurant fire spreading toward the ceiling.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(66, 94, 'Fire', 'HIGH', 'Muzon, Malabon City', 'Apartment fire with residents potentially exposed to smoke.', 0.8600, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(67, 95, 'Fire', 'HIGH', 'Hulong Duhat, Malabon City', 'Outdoor fire threatening nearby residential properties.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(68, 96, 'Fire', 'HIGH', 'Tinajeros, Malabon City', 'Workshop fire with reports of small explosions.', 0.9000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(69, 97, 'Fire', 'HIGH', 'Maysilo, Malabon City', 'Residential fire with occupants not yet fully evacuated.', 0.8700, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(70, 98, 'Fire', 'HIGH', 'Santolan, Malabon City', 'Electrical wiring fire with visible sparks.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(71, 99, 'Fire', 'HIGH', 'Bayan-Bayanan, Malabon City', 'Apartment fire with a reported child inside.', 0.8900, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(72, 100, 'Fire', 'HIGH', 'Panghulo, Malabon City', 'Warehouse fire producing smoke near an adjacent building.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(73, 101, 'Fire', 'HIGH', 'Tugatog, Malabon City', 'Ongoing residential fire with a reported injury.', 0.8800, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(74, 102, 'Flood', 'HIGH', 'Dampalit, Malabon City', 'Rising floodwater trapping residents.', 0.8700, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(75, 103, 'Flood', 'HIGH', 'Panghulo, Malabon City', 'Deep flooding with a vulnerable resident needing assistance.', 0.8600, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(76, 104, 'Flood', 'HIGH', 'Catmon, Malabon City', 'Flooding has stranded people in a low-lying area.', 0.8900, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(77, 105, 'Flood', 'HIGH', 'Tonsuya, Malabon City', 'Floodwater preventing a child from leaving home.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(78, 106, 'Flood', 'HIGH', 'Longos, Malabon City', 'Severe flooding with a resident requesting rescue.', 0.9000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(79, 107, 'Flood', 'HIGH', 'Ibaba, Malabon City', 'Rapidly rising floodwater with a stranded person.', 0.8800, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(80, 108, 'Flood', 'HIGH', 'Hulong Duhat, Malabon City', 'Severe flooding blocking safe passage.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(81, 109, 'Flood', 'NORMAL', 'Acacia, Malabon City', 'Localized flooding following heavy rainfall.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(82, 110, 'Flood', 'NORMAL', 'Baritan, Malabon City', 'Roadside water accumulation slowing traffic.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(83, 111, 'Flood', 'NORMAL', 'Concepcion, Malabon City', 'Shallow flooding outside a school.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(84, 112, 'Flood', 'NORMAL', 'Niugan, Malabon City', 'Poor drainage causing rainwater accumulation.', 0.8000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(85, 113, 'Flood', 'NORMAL', 'Potrero, Malabon City', 'Localized flooding in front of shops.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(86, 114, 'Flood', 'NORMAL', 'Muzon, Malabon City', 'Street-corner flooding after sustained rainfall.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(87, 115, 'Flood', 'NORMAL', 'Maysilo, Malabon City', 'Standing rainwater on a residential street.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(88, 116, 'Flood', 'NORMAL', 'Tañong, Malabon City', 'Floodwater inconveniencing pedestrians.', 0.8600, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(89, 117, 'Flood', 'NORMAL', 'Flores, Malabon City', 'Minor road flooding near homes.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(90, 118, 'Flood', 'NORMAL', 'Baritan, Malabon City', 'Drainage issue causing water accumulation in an alley.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(91, 119, 'Obstruction', 'HIGH', 'Tinajeros, Malabon City', 'Fallen tree completely blocking the road.', 0.8700, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(92, 120, 'Obstruction', 'HIGH', 'Potrero, Malabon City', 'Fallen pole and potentially live electrical wire.', 0.9000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(93, 121, 'Obstruction', 'HIGH', 'Catmon, Malabon City', 'Structural debris blocking a roadway.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(94, 122, 'Obstruction', 'HIGH', 'Longos, Malabon City', 'Overturned truck and spilled cargo obstructing the road.', 0.8800, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(95, 123, 'Obstruction', 'HIGH', 'Concepcion, Malabon City', 'Heavy metal object blocking the road and posing a hazard.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(96, 124, 'Obstruction', 'HIGH', 'Muzon, Malabon City', 'Collapsed wall obstructing residential exits.', 0.8900, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(97, 125, 'Obstruction', 'NORMAL', 'Acacia, Malabon City', 'Abandoned vehicle blocking one traffic lane.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(98, 126, 'Obstruction', 'NORMAL', 'Baritan, Malabon City', 'Construction materials obstructing the sidewalk.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(99, 127, 'Obstruction', 'NORMAL', 'Bayan-Bayanan, Malabon City', 'Garbage obstructing a drainage opening.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(100, 128, 'Obstruction', 'NORMAL', 'Ibaba, Malabon City', 'Parked vehicle blocking a driveway.', 0.8000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(101, 129, 'Obstruction', 'NORMAL', 'Niugan, Malabon City', 'Stored items obstructing pedestrian access.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(102, 130, 'Obstruction', 'NORMAL', 'Hulong Duhat, Malabon City', 'Tree branch partially obstructing the roadside.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(103, 131, 'Obstruction', 'NORMAL', 'Tonsuya, Malabon City', 'Delivery truck blocking an alley entrance.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(104, 132, 'Obstruction', 'NORMAL', 'Maysilo, Malabon City', 'Repair debris left on the sidewalk.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(105, 133, 'Obstruction', 'NORMAL', 'Santolan, Malabon City', 'Cart obstructing a pedestrian passage.', 0.8000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(106, 134, 'Obstruction', 'NORMAL', 'Panghulo, Malabon City', 'Sandbags partially obstructing the roadway.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(107, 135, 'Obstruction', 'NORMAL', 'Tugatog, Malabon City', 'Damaged fence obstructing the sidewalk.', 0.8600, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(108, 136, 'Obstruction', 'NORMAL', 'Flores, Malabon City', 'Garbage accumulation obstructing part of the roadside.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(109, 137, 'Traffic', 'HIGH', 'Potrero, Malabon City', 'Vehicle collision with an injured person trapped inside.', 0.9000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(110, 138, 'Traffic', 'HIGH', 'Catmon, Malabon City', 'Road accident with a reportedly bleeding motorist.', 0.8800, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(111, 139, 'Traffic', 'HIGH', 'Tonsuya, Malabon City', 'Bus collision with reported passenger injuries.', 0.8700, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(112, 140, 'Traffic', 'HIGH', 'Longos, Malabon City', 'Motorcycle crash with a possibly seriously injured victim.', 0.8900, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(113, 141, 'Traffic', 'HIGH', 'Acacia, Malabon City', 'Major collision blocking the roadway.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(114, 142, 'Traffic', 'HIGH', 'Tinajeros, Malabon City', 'Truck collision with an unidentified leaking substance.', 0.8600, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(115, 143, 'Traffic', 'HIGH', 'Baritan, Malabon City', 'Pedestrian struck by a vehicle; victim reportedly unconscious.', 0.9000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(116, 144, 'Traffic', 'HIGH', 'Panghulo, Malabon City', 'Overturned vehicle with a trapped occupant.', 0.8800, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(117, 145, 'Traffic', 'NORMAL', 'Concepcion, Malabon City', 'Traffic congestion caused by a malfunctioning signal.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(118, 146, 'Traffic', 'NORMAL', 'Maysilo, Malabon City', 'Traffic slowdown caused by road repairs.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(119, 147, 'Traffic', 'NORMAL', 'Niugan, Malabon City', 'Congestion caused by double-parked vehicles.', 0.8400, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(120, 148, 'Traffic', 'NORMAL', 'Bayan-Bayanan, Malabon City', 'Rush-hour traffic congestion.', 0.8000, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(121, 149, 'Traffic', 'NORMAL', 'Ibaba, Malabon City', 'Slow traffic caused by delivery vehicles.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(122, 150, 'Traffic', 'NORMAL', 'Santolan, Malabon City', 'Traffic congestion caused by vehicles loading passengers.', 0.8200, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(123, 151, 'Traffic', 'NORMAL', 'Muzon, Malabon City', 'Traffic buildup caused by road maintenance.', 0.8500, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(124, 152, 'Traffic', 'NORMAL', 'Hulong Duhat, Malabon City', 'Congestion caused by roadside parking.', 0.8100, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.'),
(125, 153, 'Traffic', 'NORMAL', 'Tugatog, Malabon City', 'Traffic slowdown near a pedestrian crossing.', 0.8300, 0, 'Simulated test record; no evidence file attached.', 'INCONCLUSIVE', 0.0000, 0, '2026-10-17 11:51:49', 'INCONCLUSIVE', 0.0000, 'Test data only; media safety was not evaluated.');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_attachments`
--

CREATE TABLE `tbl_attachments` (
  `attachmentID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `filePath` varchar(500) NOT NULL,
  `fileType` varchar(50) DEFAULT NULL,
  `uploadedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_attachments`
--

INSERT INTO `tbl_attachments` (`attachmentID`, `complaintID`, `fileName`, `filePath`, `fileType`, `uploadedAt`) VALUES
(1, 1, 'CMP_6a6590c1226158.76080522.png', 'uploads/CMP_6a6590c1226158.76080522.png', NULL, '2026-07-26 12:44:53'),
(2, 2, 'CMP_6a6593eadede88.24679509.png', 'uploads/CMP_6a6593eadede88.24679509.png', NULL, '2026-07-26 12:58:25'),
(3, 3, 'CMP_6a659493ca9240.61711222.png', 'uploads/CMP_6a659493ca9240.61711222.png', NULL, '2026-07-26 13:01:11'),
(4, 4, 'CMP_6a659533c99597.86014745.png', 'uploads/CMP_6a659533c99597.86014745.png', NULL, '2026-07-26 13:03:52'),
(5, 5, 'CMP_6a6595cc643f84.09956103.png', 'uploads/CMP_6a6595cc643f84.09956103.png', NULL, '2026-07-26 13:06:25'),
(6, 6, 'CMP_6a6595f2d36e40.27302043.png', 'uploads/CMP_6a6595f2d36e40.27302043.png', NULL, '2026-07-26 13:07:09'),
(7, 7, 'CMP_6a6596f685e662.34422433.png', 'uploads/CMP_6a6596f685e662.34422433.png', NULL, '2026-07-26 13:11:28'),
(8, 8, 'CMP_6a6597aaa451d3.11818777.png', 'uploads/CMP_6a6597aaa451d3.11818777.png', NULL, '2026-07-26 13:14:22'),
(9, 9, 'CMP_6a659906e5aca8.04712237.png', 'uploads/CMP_6a659906e5aca8.04712237.png', NULL, '2026-07-26 13:20:11'),
(10, 10, 'CMP_6a659938d4eda0.29065510.png', 'uploads/CMP_6a659938d4eda0.29065510.png', NULL, '2026-07-26 13:21:01'),
(11, 11, 'CMP_6a67564b0f7194.99112290.png', 'uploads/CMP_6a67564b0f7194.99112290.png', NULL, '2026-07-27 20:59:59'),
(12, 12, 'CMP_6a6b82f3ad09d6.75312968.png', 'uploads/CMP_6a6b82f3ad09d6.75312968.png', NULL, '2026-07-31 00:59:36'),
(13, 13, 'CMP_6a6ce14a7226e1.44087130.png', 'uploads/CMP_6a6ce14a7226e1.44087130.png', NULL, '2026-08-01 01:54:23'),
(14, 14, 'CMP_6a6ce180128874.11426502.png', 'uploads/CMP_6a6ce180128874.11426502.png', NULL, '2026-08-01 01:55:16'),
(15, 15, 'CMP_6a6ce24e3c6b20.01865523.png', 'uploads/CMP_6a6ce24e3c6b20.01865523.png', NULL, '2026-08-01 01:58:42'),
(16, 16, 'CMP_6a6d61117011a7.94105876.png', 'uploads/CMP_6a6d61117011a7.94105876.png', NULL, '2026-08-01 10:59:34'),
(17, 17, 'CMP_6a716305c083a6.47350661.png', 'uploads/CMP_6a716305c083a6.47350661.png', NULL, '2026-08-04 11:56:59'),
(18, 18, 'CMP_6a71676aa33a26.49193989.png', 'uploads/CMP_6a71676aa33a26.49193989.png', NULL, '2026-08-04 12:15:42'),
(19, 19, 'CMP_6a71692f48e368.41290331.png', 'uploads/CMP_6a71692f48e368.41290331.png', NULL, '2026-08-04 12:23:24'),
(20, 20, 'CMP_6a78ae8156d549.16275232.png', 'uploads/CMP_6a78ae8156d549.16275232.png', NULL, '2026-08-10 00:44:53'),
(21, 21, 'CMP_6a7dd62fabdfe8.79835558.jpg', 'uploads/CMP_6a7dd62fabdfe8.79835558.jpg', NULL, '2026-08-13 22:35:32'),
(22, 22, 'CMP_6a8201c0680572.56585932.jpg', 'uploads/CMP_6a8201c0680572.56585932.jpg', NULL, '2026-08-17 02:30:29'),
(23, 23, 'CMP_6a84b29630b670.41864048.jpg', 'uploads/CMP_6a84b29630b670.41864048.jpg', NULL, '2026-08-19 03:29:27'),
(24, 24, 'CMP_6a85deb1885936.57185146.jpg', 'uploads/CMP_6a85deb1885936.57185146.jpg', NULL, '2026-08-20 00:49:54'),
(25, 25, 'CMP_6a85deda1a0715.18432784.jpg', 'uploads/CMP_6a85deda1a0715.18432784.jpg', NULL, '2026-08-20 00:50:35'),
(26, 26, 'CMP_6a85e2ecd72274.90029696.jpg', 'uploads/CMP_6a85e2ecd72274.90029696.jpg', NULL, '2026-08-20 01:08:03'),
(27, 27, 'CMP_6a85e476df0b50.80183256.jpg', 'uploads/CMP_6a85e476df0b50.80183256.jpg', NULL, '2026-08-20 01:14:34'),
(28, 28, 'CMP_6a85e4c982ea08.09025041.jpg', 'uploads/CMP_6a85e4c982ea08.09025041.jpg', NULL, '2026-08-20 01:15:58'),
(29, 20, 'RES_6a85e975ec9538.13090851.png', 'uploads/resolutions/RES_6a85e975ec9538.13090851.png', NULL, '2026-08-20 01:35:49'),
(30, 27, 'RES_6a85ebf6f267c4.45621597.png', 'uploads/resolutions/RES_6a85ebf6f267c4.45621597.png', NULL, '2026-08-20 01:46:30'),
(34, 26, 'RES_6a85f150260683.38738508.png', 'uploads/resolutions/RES_6a85f150260683.38738508.png', NULL, '2026-08-20 02:09:20'),
(35, 31, 'CMP_6a871d28646d63.59549531.jpg', 'uploads/CMP_6a871d28646d63.59549531.jpg', NULL, '2026-08-20 23:28:41'),
(36, 32, 'CMP_6a871e32bd98f7.38928185.jpg', 'uploads/CMP_6a871e32bd98f7.38928185.jpg', NULL, '2026-08-20 23:33:07'),
(37, 33, 'CMP_6a871e701f9305.35082110.jpg', 'uploads/CMP_6a871e701f9305.35082110.jpg', NULL, '2026-08-20 23:34:09'),
(38, 34, 'CMP_6a871f5788b829.23932327.jpg', 'uploads/CMP_6a871f5788b829.23932327.jpg', NULL, '2026-08-20 23:38:00'),
(39, 35, 'CMP_6a871f86701372.77278557.jpg', 'uploads/CMP_6a871f86701372.77278557.jpg', NULL, '2026-08-20 23:38:47'),
(40, 36, 'CMP_6a871fc222bf67.44450789.jpg', 'uploads/CMP_6a871fc222bf67.44450789.jpg', NULL, '2026-08-20 23:39:47'),
(41, 37, 'CMP_6a87202ba34801.78555859.jpg', 'uploads/CMP_6a87202ba34801.78555859.jpg', NULL, '2026-08-20 23:41:32'),
(42, 38, 'CMP_6a8723bc550407.21370897.jpg', 'uploads/CMP_6a8723bc550407.21370897.jpg', NULL, '2026-08-20 23:56:49'),
(43, 39, 'CMP_6a874fc8254866.11335559.jpg', 'uploads/CMP_6a874fc8254866.11335559.jpg', NULL, '2026-08-21 03:04:47'),
(44, 40, 'CMP_6a8817b39c93a1.11810066.webm', 'uploads/CMP_6a8817b39c93a1.11810066.webm', 'video/webm', '2026-08-21 17:17:39'),
(45, 31, 'RES_6a8c005143ea73.60245491.png', 'uploads/resolutions/RES_6a8c005143ea73.60245491.png', NULL, '2026-08-24 16:26:57'),
(46, 38, 'RES_6a8c063c2b4a75.24137408.png', 'uploads/resolutions/RES_6a8c063c2b4a75.24137408.png', NULL, '2026-08-24 16:52:12'),
(47, 39, 'RES_6a8c06b910ce41.11624104.png', 'uploads/resolutions/RES_6a8c06b910ce41.11624104.png', NULL, '2026-08-24 16:54:17'),
(48, 32, 'RES_6a8c0781589068.96492450.png', 'uploads/resolutions/RES_6a8c0781589068.96492450.png', NULL, '2026-08-24 16:57:37'),
(49, 33, 'RES_6a8c08b75b35e9.31413181.png', 'uploads/resolutions/RES_6a8c08b75b35e9.31413181.png', NULL, '2026-08-24 17:02:47'),
(52, 34, 'RES_6a8c099bdc8540.67547402.png', 'uploads/resolutions/RES_6a8c099bdc8540.67547402.png', NULL, '2026-08-24 17:06:35'),
(53, 41, 'CMP_6a8dd45d38cb52.52923616.jpg', 'uploads/CMP_6a8dd45d38cb52.52923616.jpg', 'image/jpeg', '2026-08-26 01:44:05'),
(54, 42, 'CMP_6a8dd5376cd210.44063651.jpg', 'uploads/CMP_6a8dd5376cd210.44063651.jpg', 'image/jpeg', '2026-08-26 01:47:41'),
(55, 43, 'CMP_6a8dd5b24fcab2.92783765.jpg', 'uploads/CMP_6a8dd5b24fcab2.92783765.jpg', 'image/jpeg', '2026-08-26 01:49:47'),
(56, 44, 'CMP_6a8dd7111be310.72430072.jpg', 'uploads/CMP_6a8dd7111be310.72430072.jpg', 'image/jpeg', '2026-08-26 01:55:40'),
(57, 41, 'RES_6a8def3ea3d325.15700157.png', 'uploads/resolutions/RES_6a8def3ea3d325.15700157.png', NULL, '2026-08-26 03:38:38'),
(58, 45, 'CMP_6a8def87bcf440.01365679.jpg', 'uploads/CMP_6a8def87bcf440.01365679.jpg', 'image/jpeg', '2026-08-26 03:40:00'),
(59, 42, 'RES_6a91110af213d5.00379741.jpeg', 'uploads/resolutions/RES_6a91110af213d5.00379741.jpeg', NULL, '2026-08-27 21:39:38'),
(60, 46, 'CMP_6a9112ef232a20.71963736.jpg', 'uploads/CMP_6a9112ef232a20.71963736.jpg', 'image/jpeg', '2026-08-27 21:47:54'),
(61, 47, 'CMP_6a9113a8ab5543.91098074.jpg', 'uploads/CMP_6a9113a8ab5543.91098074.jpg', 'image/jpeg', '2026-08-27 21:50:55'),
(62, 47, 'RES_6a9115ac82de69.17236624.jpeg', 'uploads/resolutions/RES_6a9115ac82de69.17236624.jpeg', NULL, '2026-08-27 21:59:24'),
(63, 48, 'CMP_6a9116db9ba022.69024403.webm', 'uploads/CMP_6a9116db9ba022.69024403.webm', 'video/webm', '2026-08-27 22:04:39'),
(64, 49, 'CMP_6a924d7a4f7ad7.08527356.webm', 'uploads/CMP_6a924d7a4f7ad7.08527356.webm', 'video/webm', '2026-08-28 20:09:50'),
(65, 49, 'RES_6a925170f039c0.87224202.jpg', 'uploads/resolutions/RES_6a925170f039c0.87224202.jpg', NULL, '2026-08-28 20:26:40'),
(66, 50, 'CMP_6a92531440d0b4.88729937.webm', 'uploads/CMP_6a92531440d0b4.88729937.webm', 'video/webm', '2026-08-28 20:33:53'),
(67, 51, 'CMP_6a9256a141a6a0.13270062.webm', 'uploads/CMP_6a9256a141a6a0.13270062.webm', 'video/webm', '2026-08-28 20:48:55'),
(68, 52, 'CMP_6a925a7ea20228.11670956.webm', 'uploads/CMP_6a925a7ea20228.11670956.webm', 'video/webm', '2026-08-28 21:05:23'),
(69, 53, 'CMP_6a925c4e3f7bb4.51184877.webm', 'uploads/CMP_6a925c4e3f7bb4.51184877.webm', 'video/webm', '2026-08-28 21:13:07'),
(70, 54, 'CMP_6a925d33510487.62065343.webm', 'uploads/CMP_6a925d33510487.62065343.webm', 'video/webm', '2026-08-28 21:16:57'),
(71, 55, 'CMP_6a96fa81d0d181.51620033.jpg', 'uploads/CMP_6a96fa81d0d181.51620033.jpg', 'image/jpeg', '2026-09-01 09:17:11'),
(72, 56, 'CMP_6a97119a06e5b7.99011113.jpg', 'uploads/CMP_6a97119a06e5b7.99011113.jpg', 'image/jpeg', '2026-09-01 10:55:49'),
(73, 57, 'CMP_6a98195acca8c2.06839469.jpg', 'uploads/CMP_6a98195acca8c2.06839469.jpg', 'image/jpeg', '2026-09-02 05:41:11'),
(74, 58, 'CMP_6ab3aa45c6cb23.41692301.jpg', 'uploads/CMP_6ab3aa45c6cb23.41692301.jpg', 'image/jpeg', '2026-09-23 03:30:32'),
(75, 59, 'CMP_6ab3abf1ef22b4.10364663.jpg', 'uploads/CMP_6ab3abf1ef22b4.10364663.jpg', 'image/jpeg', '2026-09-23 03:37:40'),
(76, 60, 'CMP_6ab49e77b765d7.28534113.jpg', 'uploads/CMP_6ab49e77b765d7.28534113.jpg', 'image/jpeg', '2026-09-23 20:52:26'),
(77, 35, 'RES_6aba684032b8c8.80928514.jpg', 'uploads/resolutions/RES_6aba684032b8c8.80928514.jpg', NULL, '2026-09-28 06:14:40'),
(78, 61, 'CMP_6abe1c5052ea76.86859691.jpg', 'uploads/CMP_6abe1c5052ea76.86859691.jpg', 'image/jpeg', '2026-10-01 01:39:46'),
(79, 62, 'CMP_6abe1c809f19b9.04539557.jpg', 'uploads/CMP_6abe1c809f19b9.04539557.jpg', 'image/jpeg', '2026-10-01 01:40:35'),
(80, 63, 'CMP_6abe4153e77ac9.37311748.jpg', 'uploads/CMP_6abe4153e77ac9.37311748.jpg', 'image/jpeg', '2026-10-01 04:17:41'),
(81, 56, 'RES_6abe43b73e6f18.66551912.jpg', 'uploads/resolutions/RES_6abe43b73e6f18.66551912.jpg', NULL, '2026-10-01 04:27:50'),
(82, 64, 'CMP_6abe441a1174a7.07284971.jpg', 'uploads/CMP_6abe441a1174a7.07284971.jpg', 'image/jpeg', '2026-10-01 04:29:31'),
(83, 65, 'CMP_6abf2404196428.06039788.jpg', 'uploads/CMP_6abf2404196428.06039788.jpg', 'image/jpeg', '2026-10-01 20:24:54'),
(84, 66, 'CMP_6ac79249b22864.29987948.jpg', 'uploads/CMP_6ac79249b22864.29987948.jpg', 'image/jpeg', '2026-10-08 05:53:32'),
(85, 67, 'CMP_6acf25c69eed90.70737391.jpg', 'uploads/CMP_6acf25c69eed90.70737391.jpg', 'image/jpeg', '2026-10-13 23:48:41'),
(86, 68, 'CMP_6acf49eb61b705.57185035.jpg', 'uploads/CMP_6acf49eb61b705.57185035.jpg', 'image/jpeg', '2026-10-14 02:22:53'),
(87, 69, 'CMP_6acf7e90d2d1a8.52683590.jpg', 'uploads/CMP_6acf7e90d2d1a8.52683590.jpg', 'image/jpeg', '2026-10-14 06:07:39'),
(88, 70, 'CMP_6ad0894a1ad8d4.08285892.jpg', 'uploads/CMP_6ad0894a1ad8d4.08285892.jpg', 'image/jpeg', '2026-10-15 01:05:32'),
(89, 44, 'RES_6ad08ca5d5c656.83481041.jpg', 'uploads/resolutions/RES_6ad08ca5d5c656.83481041.jpg', NULL, '2026-10-15 01:19:50'),
(90, 70, 'RES_6ad092c5192206.11130102.jpg', 'uploads/resolutions/RES_6ad092c5192206.11130102.jpg', NULL, '2026-10-15 01:45:57'),
(91, 71, 'CMP_6ad0a51d1f24d9.50830832.jpg', 'uploads/CMP_6ad0a51d1f24d9.50830832.jpg', 'image/jpeg', '2026-10-15 03:04:21'),
(92, 71, 'RES_6ad0aa0ca4c425.26703454.jpg', 'uploads/resolutions/RES_6ad0aa0ca4c425.26703454.jpg', NULL, '2026-10-15 03:25:16'),
(93, 72, 'CMP_6ad0b04457acf5.26931136.webm', 'uploads/CMP_6ad0b04457acf5.26931136.webm', 'video/webm', '2026-10-15 03:51:52'),
(94, 72, 'RES_6ad0b1a284ab64.09624018.jpg', 'uploads/resolutions/RES_6ad0b1a284ab64.09624018.jpg', NULL, '2026-10-15 03:57:38'),
(95, 73, 'CMP_6ad0e0e32a6cd2.09191092.jpg', 'uploads/CMP_6ad0e0e32a6cd2.09191092.jpg', 'image/jpeg', '2026-10-15 07:19:16'),
(96, 74, 'CMP_6ad0e8dfc26441.79849482.jpg', 'uploads/CMP_6ad0e8dfc26441.79849482.jpg', 'image/jpeg', '2026-10-15 07:53:20'),
(97, 73, 'RES_6ad0f11da7b1a7.66364271.png', 'uploads/resolutions/RES_6ad0f11da7b1a7.66364271.png', NULL, '2026-10-15 08:28:29'),
(98, 74, 'RES_6ad0f1a2608233.47703966.jpg', 'uploads/resolutions/RES_6ad0f1a2608233.47703966.jpg', NULL, '2026-10-15 08:30:42'),
(99, 75, 'CMP_6ad0f26add3860.89220440.jpg', 'uploads/CMP_6ad0f26add3860.89220440.jpg', 'image/jpeg', '2026-10-15 08:34:09'),
(100, 76, 'CMP_6ad10cce4d1865.79076949.jpg', 'uploads/CMP_6ad10cce4d1865.79076949.jpg', 'image/jpeg', '2026-10-15 10:26:45'),
(101, 76, 'RES_6ad11d44dc58a2.92228712.jpg', 'uploads/resolutions/RES_6ad11d44dc58a2.92228712.jpg', NULL, '2026-10-15 11:36:53'),
(102, 77, 'CMP_6ad2154f8d0db8.21396983.jpg', 'uploads/CMP_6ad2154f8d0db8.21396983.jpg', 'image/jpeg', '2026-10-16 20:15:12'),
(103, 211, 'CMP_6ad2fe7ba0ecd6.55216135.jpg', 'uploads/CMP_6ad2fe7ba0ecd6.55216135.jpg', 'image/jpeg', '2026-10-17 12:50:29');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_citizens`
--

CREATE TABLE `tbl_citizens` (
  `citizenID` int(11) NOT NULL,
  `fullName` varchar(150) NOT NULL,
  `profileImage` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `authProvider` enum('local','google') NOT NULL DEFAULT 'local',
  `googleID` varchar(255) DEFAULT NULL,
  `contactNumber` varchar(20) NOT NULL,
  `passwordHash` varchar(255) DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `verificationStatus` enum('Unverified','Pending','Verified','Rejected') NOT NULL DEFAULT 'Unverified',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `emergencyComplaintUsed` tinyint(1) NOT NULL DEFAULT 0,
  `activeComplaintID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_citizens`
--

INSERT INTO `tbl_citizens` (`citizenID`, `fullName`, `profileImage`, `email`, `authProvider`, `googleID`, `contactNumber`, `passwordHash`, `attachment`, `verificationStatus`, `createdAt`, `emergencyComplaintUsed`, `activeComplaintID`) VALUES
(1, 'Romeo Juntila', 'Complaint/uploads/profile/citizen_1_9fbd285fcfddc831.png', 'roms@gmail.com', 'local', NULL, '98123123132', '$2y$10$nKbT4j5jkoIaxUxxtaPL7OybEVX1faERIP5y0JVivZknT5nGUYo/K', 'clearance_1_4ee5527de616bc34.png', 'Verified', '2026-07-26 12:37:57', 0, NULL),
(2, 'Romeo Juntila', NULL, 'awit@gmail.com', 'local', NULL, '09123812757', '$2y$10$HOSdVQx0zCm5VfLmtv6g1OPLcD945tEMbWLWYx.WpAui9K9jtG8ga', 'clearance_2_1617dc161bf89261.png', 'Verified', '2026-08-01 10:49:17', 0, NULL),
(3, 'SHISH KA TALAGA', NULL, 'shish@gmail.com', 'local', NULL, '09821312321', '$2y$10$Qhc/iJyRECAEuDe3bsxsxOkJbgcGjl9JcKm5r.X.YsVDbo/OFlhB6', 'clearance_3_4f8fd875bdf463d3.png', 'Pending', '2026-08-01 10:56:31', 1, NULL),
(4, 'Ran Shish', NULL, 'romeojuntila012@gmail.com', 'local', NULL, '09213213213', '$2y$10$d/CTC0bb5ENq1Dhu5hCMkeXuy93TmL9sj2LqKeiwnl8jkGsByzE2W', NULL, 'Verified', '2026-08-25 23:11:49', 0, NULL),
(5, 'Hinata shoyo', NULL, 'Juntila01@gmail.com', 'local', NULL, '09123124213', '$2y$10$VOO8DXRmmsgDAmKbMzyfOOfhS8mNTwXg5fw2bDiOo6h4RgtpgSKY.', 'clearance_5_a4944185eaad8685.png', 'Pending', '2026-08-26 18:15:36', 0, NULL),
(6, 'Gene Batiancila', 'Complaint/uploads/profile/citizen_6_66117b31274ee7d1.jpg', 'geneauriabatiancila@gmail.com', 'local', NULL, '09262137060', '$2y$10$5zqSKeIt9kKzbZrr0hiI6u6fmgatdNsNgWadB03Rb4kMCC5X.vqBC', NULL, 'Verified', '2026-08-27 21:21:12', 0, NULL),
(7, 'Joshua Vega', NULL, 'Josh@gmail.com', 'local', NULL, '09334167895', '$2y$10$uq3WiaNidUWssCqiYOcuU.mJz.b99l57ZqjhPNwGshPD5tcD8xrkC', 'clearance_7_c89de457e522cad4.jpg', 'Pending', '2026-08-27 21:21:16', 0, NULL),
(8, 'Joshua Palada', NULL, 'paladajoshua05@gmail.com', 'local', NULL, '09813781606', '$2y$10$03WFZRpEWyHdy3g7YSFa5Oe5lg29gwQ5kqAJ0gV8PNf44cdaXnJ9y', 'clearance_8_89ae774d789193ec.jpg', 'Verified', '2026-08-27 21:34:57', 0, NULL),
(9, 'ArchieMasallo', NULL, 'archiemasallo159@gmail.com', 'local', NULL, '09319627029', '$2y$10$.wpXr6SKzJo2.b7G2tDJw.sVosCnyeIi9zL46zJ6WcGW9w5rHWRcq', NULL, 'Verified', '2026-08-27 21:41:47', 0, NULL),
(10, 'Cabubas Kenny O.', 'Complaint/uploads/profile/citizen_10_d5b471f045ae8b08.jpg', 'cabubasjenny31@gmail.com', 'local', NULL, '09076861872', '$2y$10$MuW.kRteNrzX8j4dvly8duZBZm0KiPWhRQcEf00P/a9d7UyBqiJ7C', 'clearance_10_247cf0f40b449cb5.png', 'Verified', '2026-08-27 21:43:13', 0, NULL),
(11, 'Justine B. Hemar', NULL, 'justinebergavino5@gmail.com', 'local', NULL, '09516012863', '$2y$10$oAbvPW87d8E0QLR.IhU/f.sNjqQu.W.kWhlsVUEu0Hrnoswki0.B.', NULL, 'Verified', '2026-08-27 22:36:37', 0, NULL),
(12, 'George Jordan', NULL, 'george23ph@gmail.com', 'local', NULL, '09284285230', '$2y$10$Hn3CwH9ymDrJq8K6yE22he67jC0ESSFLTub4O2dRH9SW/P4PYOCDO', 'clearance_12_48a8c09884d9f456.jpg', 'Verified', '2026-08-28 19:24:28', 0, NULL),
(13, 'Andrew yea', NULL, 'danaldwaynematados@gmail.com', 'local', NULL, '09300388771', '$2y$10$hrnNzuG8sLcUfWl0DGXCj.bpQ/PhKQW0cSeCOtT3ccgJJKiOofZH2', 'clearance_13_483289f23408cef5.jpg', 'Verified', '2026-08-31 09:42:16', 0, NULL),
(14, 'luna', NULL, 'luna@gmail.com', 'local', NULL, '09111111111', '$2y$10$bvPse/TIhHbUNj5yfbkKXeIZFSYMrlxW55aYhJDLJ8Ht.z0rvVIXe', NULL, '', '2026-09-09 10:56:35', 0, NULL),
(15, 'solid solid', NULL, 'solid@gmail.com', 'local', NULL, '01923123213', '$2y$10$bI1YCZRj2lJ5QZQAPokppOWh748oHnBVTuAU0RzO09kqjU/vgZBlK', NULL, '', '2026-09-16 23:19:22', 0, NULL),
(16, 'Joshua Vega', NULL, 'Joshua@gmail.com', 'local', NULL, '09385858221', '$2y$10$e6yxMCm7mi03YHiuISDaaeGGoUlWfqPuUoRvcYUQ9qIb.mzjsaQQS', 'valid_id_16_7b4d725b7aac7a95.jpg', 'Verified', '2026-09-17 01:44:48', 1, NULL),
(17, 'Tyrone Stark', 'https://lh3.googleusercontent.com/a/ACg8ocLZ4PwAHHmwK9j4Mk1xT8CSc5Y_UPVSZ-nLPMq1SCyaphyPHA=s96-c', 'tyronestark01@gmail.com', 'google', '112223005021613184017', '09893762673', NULL, NULL, 'Unverified', '2026-09-21 10:44:17', 0, NULL),
(18, 'Tyrone Stark', 'https://lh3.googleusercontent.com/a/ACg8ocLkKyiaM-uMgGEEAJ5NYuCaIZNoT6m4cFbhBJmyUGJL5Gtm=s96-c', 'tyronestark01234@gmail.com', 'google', '102715530764033615829', '09823424213', NULL, NULL, 'Verified', '2026-09-21 10:44:51', 0, NULL),
(19, 'Juntila Analiza', 'https://lh3.googleusercontent.com/a/ACg8ocLUw2CoC7PVtKXsYjsOOnJIW_wAH1KCwX3eI7ljJD73IzzwDc4N=s96-c', 'analizajuntila40@gmail.com', 'google', '100878412685280823603', '09231234345', NULL, NULL, 'Unverified', '2026-09-21 10:51:46', 0, NULL),
(20, 'Kenny Cabubas', NULL, 'cabubaskenny738@gmail.com', 'local', NULL, '09167361452', '$2y$10$mSuhgIe9eqsRwQWh2StQsethnJL0AGjQh6GpPPAzzwXyKp03DNQ2K', NULL, 'Unverified', '2026-09-21 13:27:18', 0, NULL),
(21, 'mixx lam', 'https://lh3.googleusercontent.com/a/ACg8ocJ0QeTyabDZGAzZ2o04_gGfyH61wNkRV4ssJLLGQeNDyN5Kbg=s96-c', 'mixxlam69@gmail.com', 'google', '112828382926868484574', '09516012863', NULL, NULL, 'Unverified', '2026-09-22 01:26:37', 0, NULL),
(22, 'Joshua Palada', NULL, 'Joshua22@gmail.com', 'local', NULL, '09813781606', '$2y$12$Mz4FUQNveZ1ZlLCw69B7BuG75LGYMOZSQ3JKodRWI.BBh6iKIIPRm', 'valid_id_22_f26e6da17e9cc8bc.jpg', 'Pending', '2026-09-25 22:35:23', 0, NULL),
(23, 'Palada Joshua', NULL, 'Joshua331@gmail.com', 'local', NULL, '09813781606', '$2y$12$oOJLWYaaD4kLngUnEThDEOgxoCHmyJ28xWVdEvKD/LnUvNa.32ram', NULL, 'Unverified', '2026-09-25 22:43:45', 0, NULL),
(24, 'arcee', NULL, 'arcee@gmail.com', 'local', NULL, '09093652547', '$2y$12$UObQoZXBmkoLzpEXdWz6FO0D8Csou8TgaUXo9dM4bvvfzJgiKYc1W', NULL, 'Unverified', '2026-10-01 22:24:23', 0, NULL),
(25, 'RHOEGIN LAMPAS', 'https://lh3.googleusercontent.com/a/ACg8ocKk2VGv4Pk4_hSxwGjOd_H-00AquLOfbAdaogDhn9oxrQuHkQ=s96-c', 'rhoeginlampas@gmail.com', 'google', '106539735429040355504', '09994911150', NULL, NULL, 'Unverified', '2026-10-03 21:36:30', 0, NULL),
(26, 'Mylene Fronteras', NULL, 'fronterasmylene6@gmail.com', 'local', NULL, '09347088032', '$2y$12$TmxbEGcNDCWHiDdUx0xjIunG8JZsFSKaHKxJSdMaLHiHZZlCisxXK', NULL, 'Unverified', '2026-10-10 06:13:23', 0, NULL),
(27, 'Danica Antonio', NULL, 'daal.antonio.sjc@phinmaed.com', 'local', NULL, '09951739908', '$2y$12$fQ/ETGb0mdWVZzY94H6tgeu.XGSqYKNmYZgpLJcj0LffnYEPPlPfS', NULL, 'Unverified', '2026-10-10 07:26:35', 0, NULL),
(28, 'Joshua Palada', NULL, 'paladajoshua331@gmail.com', 'local', NULL, '09813781606', '$2y$12$2xUEdLtdkhZ.g.xD61I0gO9dCGQmIhtmrHtpvaTqOXy5DObT4Al62', 'valid_id_28_47020bfe0bcf3aa8.jpg', 'Verified', '2026-10-11 04:30:41', 0, NULL),
(29, 'Mark Matulin', NULL, 'markmatulin@gmail.com', 'local', NULL, '09153768973', '$2y$12$piwJI9dvWwIKKbLrmi1Dqu.ocT2IxRh5xu4NRjhfL3DXKY3FpoR7G', NULL, 'Unverified', '2026-10-11 16:10:38', 0, NULL),
(30, 'Yesha Luther', 'https://lh3.googleusercontent.com/a/ACg8ocJ58VNh0y7ModEgU7FG2fFTP3_j0O1a5A1HelXnlKSGAP2vKWQ=s96-c', 'yeshaluther@gmail.com', 'google', '102950844540655860275', '09811734026', NULL, NULL, 'Unverified', '2026-10-11 19:28:46', 0, NULL),
(31, 'Earl Vincent Co', NULL, 'princevincent0124@gmail.com', 'local', NULL, '09238843043', '$2y$12$8X0qrp8bela4qTvxbTBBNO9cTHmYtmVPAeZqMz3sHlf/7fQdco1IK', NULL, 'Unverified', '2026-10-13 04:48:17', 0, NULL),
(32, 'Carl Adrian', NULL, 'cads_31@yahoo.com', 'local', NULL, '09355668354', '$2y$12$GuE.GX61X.QQ.wOVN3JtlOXadAZa0HDVcNoS7iCAMpQYb/ZXMakUW', 'valid_id_32_40ef44f848d05488.jpg', 'Verified', '2026-10-13 23:20:29', 0, NULL),
(33, 'Juan Cruz', NULL, 'jopayestive@gmail.com', 'local', NULL, '09234567891', '$2y$12$3mzzfYSrcu53na.uJoC4G.bDERCCyJu6b4oU9z2ilffInxSgKkJr6', NULL, 'Unverified', '2026-10-14 06:53:11', 0, NULL),
(34, 'thylv Ran', NULL, 'cqtteran@gmail.com', 'local', NULL, '09168218331', '$2y$12$67DZPnUU0Bq78xGIsd07ounkv.KTIJWuvdO7EMn2vkLTfK.i/AmY6', NULL, 'Unverified', '2026-10-14 07:25:58', 0, NULL),
(35, 'Kieth Anjhiela Ang', NULL, 'kiethanjhielaang06@gmail.com', 'local', NULL, '09271241327', '$2y$12$Y1ibv3o14AOmZuqYDpqpcOANOf9OiEUHUKmWK6Aw.jq2M02Ywn51O', NULL, 'Unverified', '2026-10-14 07:44:49', 0, NULL),
(36, 'Andrea Ramos', NULL, 'seixcalicious@gmail.com', 'local', NULL, '09668554380', '$2y$12$R05jGgoypItiIibEBxs5LuLnBFBhC.c5vrmGYqFBYJDyatG.7xRMq', NULL, 'Unverified', '2026-10-14 20:25:14', 0, NULL),
(37, 'kyle perez', 'https://lh3.googleusercontent.com/a/ACg8ocL9q7gMMBMzKhXsl4JybZUxIn5Ij4s6IplbW8cMFUBVTIS0pw=s96-c', 'perezkyle01262019@gmail.com', 'google', '108182094967036194395', '09764340995', NULL, 'valid_id_37_7c3ed1aeabdacce9.jpg', 'Verified', '2026-10-15 00:52:42', 0, NULL),
(38, 'Jocelyn', NULL, 'jocelynroga747@gmail.com', 'local', NULL, '09850375732', '$2y$12$zmRn5khxzLowZqaXTK1.nOZbBh9AiEOwhlIap7JYPDnbgfcks1gwu', 'valid_id_38_1b8dd55aa9a288bf.jpg', 'Verified', '2026-10-15 02:16:55', 0, NULL),
(39, 'Donny Pangilinan', NULL, 'donny@gmail.com', 'local', NULL, '09676454664', '$2y$12$pJ7yVsbadaW8Fok8AoavueeLUl30/05OTa06G4uW48kEFXikGkoq6', 'valid_id_39_8b0044032c189ccc.jpg', 'Verified', '2026-10-15 07:08:32', 0, NULL),
(40, 'Jacaba, Erwin M', NULL, 'jacabaerwin15@gmail.com', 'local', NULL, '09708101163', '$2y$12$QqMhkHceGHJB2wHbcLk2kerC5.U2XaNtUdHE093io/T5v1ZlZbbFW', NULL, 'Unverified', '2026-10-15 08:28:40', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_complaints`
--

CREATE TABLE `tbl_complaints` (
  `complaintID` int(11) NOT NULL,
  `complaintReference` varchar(50) DEFAULT NULL,
  `citizenID` int(11) DEFAULT NULL,
  `assignedStaffID` int(11) DEFAULT NULL,
  `dispatchTeamID` int(11) DEFAULT NULL,
  `dispatchStatus` enum('Assigned','On the Way','Arrived','Resolved','Unable to Resolve') DEFAULT NULL,
  `assignedAt` datetime DEFAULT NULL,
  `onTheWayAt` datetime DEFAULT NULL,
  `arrivedAt` datetime DEFAULT NULL,
  `rawComplaintText` text NOT NULL,
  `status` enum('Pending','Verified','Rejected','In Progress','Resolved','Unable to Resolve') DEFAULT 'Pending',
  `submitIP` varchar(45) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `deadlineAt` datetime DEFAULT NULL,
  `firstResponseAt` datetime DEFAULT NULL,
  `completedAt` datetime DEFAULT NULL,
  `slaStatus` enum('On Time','Warning','Overdue','Completed On Time','Completed Late') DEFAULT 'On Time',
  `aiAnalysisStatus` enum('Completed','Unavailable') NOT NULL DEFAULT 'Completed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_complaints`
--

INSERT INTO `tbl_complaints` (`complaintID`, `complaintReference`, `citizenID`, `assignedStaffID`, `dispatchTeamID`, `dispatchStatus`, `assignedAt`, `onTheWayAt`, `arrivedAt`, `rawComplaintText`, `status`, `submitIP`, `createdAt`, `deadlineAt`, `firstResponseAt`, `completedAt`, `slaStatus`, `aiAnalysisStatus`) VALUES
(1, 'MCAT-000001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'theres sunog here, pls help', 'Rejected', '::1', '2026-07-26 12:44:53', '2026-07-27 12:44:53', '2026-08-03 19:41:29', NULL, 'On Time', 'Completed'),
(2, 'MCAT-000002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'may baha tagal na neto, tulong boss', 'Pending', '::1', '2026-07-26 12:58:25', '2026-07-27 12:58:25', NULL, NULL, 'On Time', 'Completed'),
(3, 'MCAT-000003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'may basura, pls tulong po oh', 'Pending', '::1', '2026-07-26 13:01:11', '2026-07-29 13:01:11', NULL, NULL, 'On Time', 'Completed'),
(4, 'MCAT-000004', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'may nakaharang na motor dito sa kalsada', 'Pending', '::1', '2026-07-26 13:03:52', '2026-07-29 13:03:52', NULL, NULL, 'On Time', 'Completed'),
(5, 'MCAT-000005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'may baha boss pano to?', 'Pending', '::1', '2026-07-26 13:06:25', '2026-07-27 13:06:25', NULL, NULL, 'On Time', 'Completed'),
(6, 'MCAT-000006', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'shish boss', 'Pending', '::1', '2026-07-26 13:07:09', '2026-07-29 13:07:09', NULL, NULL, 'On Time', 'Completed'),
(7, 'MCAT-000007', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'shish awit may pangit', 'Pending', '::1', '2026-07-26 13:11:28', '2026-07-29 13:11:28', NULL, NULL, 'On Time', 'Completed'),
(8, 'MCAT-000008', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'hey boy theres an fire here help pls', 'Pending', '::1', '2026-07-26 13:14:22', '2026-07-27 13:14:22', NULL, NULL, 'On Time', 'Completed'),
(9, 'MCAT-000009', NULL, NULL, 1, NULL, NULL, NULL, NULL, 'awit may sunog ata', 'Rejected', '::1', '2026-07-26 13:20:11', '2026-07-27 13:20:11', '2026-08-03 19:33:57', NULL, 'On Time', 'Completed'),
(10, 'MCAT-000010', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'awit may sunog ba dito boss?', 'Pending', '::1', '2026-07-26 13:21:00', '2026-07-29 13:21:00', NULL, NULL, 'On Time', 'Completed'),
(11, 'MCAT-000011', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'may umaapoy na dtio dahil may nag spark na wire', 'Pending', '::1', '2026-07-27 20:59:59', '2026-07-28 20:59:59', NULL, NULL, 'On Time', 'Completed'),
(12, 'MCAT-000012', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'may sunog dito sa malabon pls help', 'Pending', '::1', '2026-07-31 00:59:36', '2026-08-01 00:59:36', NULL, NULL, 'On Time', 'Completed'),
(13, 'MCAT-000013', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'grabeng basura to pahirapan ah tagla na neto', 'Pending', '::1', '2026-08-01 01:54:23', '2026-08-04 01:54:23', NULL, NULL, 'On Time', 'Completed'),
(14, 'MCAT-000014', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'grabeng basura to, patulong naman oh', 'Pending', '::1', '2026-08-01 01:55:16', '2026-08-04 01:55:16', NULL, NULL, 'On Time', 'Completed'),
(15, 'MCAT-000015', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'yung basura dito antagal na tong nandito ang baho na', 'Pending', '::1', '2026-08-01 01:58:42', '2026-08-03 19:58:42', NULL, NULL, 'On Time', 'Completed'),
(16, 'MCAT-000016', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'lala ya grabe na basura', 'Pending', '::1', '2026-08-01 10:59:34', '2026-08-04 04:59:34', NULL, NULL, 'On Time', 'Completed'),
(17, 'MCAT-000017', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'shishable ang basura dito sa catmon boss', 'Pending', '::1', '2026-08-04 11:56:59', '2026-08-07 05:56:59', NULL, NULL, 'On Time', 'Completed'),
(18, 'MCAT-000018', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'shish sunog boss? lala', 'Pending', '::1', '2026-08-04 12:15:42', '2026-08-05 06:15:42', NULL, NULL, 'On Time', 'Completed'),
(19, 'MCAT-000019', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'shish ary ko po awit sau', 'Pending', '::1', '2026-08-04 12:23:24', '2026-08-07 06:23:24', NULL, NULL, 'On Time', 'Completed'),
(20, 'MCAT-000020', 1, NULL, NULL, 'On the Way', NULL, NULL, NULL, 'theres sunog here in catmon sito 6', 'In Progress', '::1', '2026-08-10 00:44:53', '2026-08-10 18:44:53', '2026-08-20 01:41:43', '2026-08-20 01:35:49', 'On Time', 'Completed'),
(21, 'MCAT-000021', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'may basura nakatambak malapit dito sa amin', 'Pending', '::1', '2026-08-13 22:35:32', '2026-08-16 16:35:32', NULL, NULL, 'On Time', 'Completed'),
(22, 'MCAT-000022', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'daming basura naka kalat sa kalsada', 'Pending', '::1', '2026-08-17 02:30:29', '2026-08-19 20:30:29', NULL, NULL, 'On Time', 'Completed'),
(23, 'MCAT-000023', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'lakas ng ulan, nabaha na dito anlala', 'Pending', '::1', '2026-08-19 03:29:27', '2026-08-21 21:29:27', NULL, NULL, 'On Time', 'Completed'),
(24, 'MCAT-000024', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'tulong may baha na dito sa amin', 'Pending', '::1', '2026-08-20 00:49:54', '2026-08-22 18:49:54', NULL, NULL, 'On Time', 'Completed'),
(25, 'MCAT-000025', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'may sunog na dito sa amin grabe na anlakas', 'Pending', '::1', '2026-08-20 00:50:35', '2026-08-22 18:50:35', NULL, NULL, 'On Time', 'Completed'),
(26, 'MCAT-000026', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may baha na dito tulong oh', 'Resolved', '::1', '2026-08-20 01:08:03', '2026-08-22 19:08:03', '2026-08-20 01:49:12', '2026-08-20 02:09:20', 'On Time', 'Completed'),
(27, 'MCAT-000027', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog', 'Resolved', '::1', '2026-08-20 01:14:34', '2026-08-20 19:14:34', '2026-08-20 01:43:40', '2026-08-20 01:46:30', 'On Time', 'Completed'),
(28, 'MCAT-000028', 3, NULL, NULL, NULL, NULL, NULL, NULL, 'may baha may nalulunod na dito', 'Verified', '::1', '2026-08-20 01:15:58', '2026-08-20 19:15:58', NULL, NULL, 'On Time', 'Completed'),
(31, 'MCAT-000031', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog na dito help', 'Resolved', '::1', '2026-08-20 23:28:41', '2026-08-23 17:28:41', '2026-08-24 00:52:55', '2026-08-24 16:26:57', 'On Time', 'Completed'),
(32, 'MCAT-000032', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog dito sa amin tulong na po dali', 'Resolved', '::1', '2026-08-20 23:33:07', '2026-08-23 17:33:07', '2026-08-24 16:57:12', '2026-08-24 16:57:37', 'On Time', 'Completed'),
(33, 'MCAT-000033', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog na dito sa min anlakas grabe', 'Resolved', '::1', '2026-08-20 23:34:09', '2026-08-23 17:34:09', '2026-08-24 16:59:55', '2026-08-24 17:02:47', 'On Time', 'Completed'),
(34, 'MCAT-000034', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'theres fire here and its so strong', 'Resolved', '::1', '2026-08-20 23:38:00', '2026-08-23 17:38:00', '2026-08-24 17:05:15', '2026-08-24 17:06:35', 'On Time', 'Completed'),
(35, 'MCAT-000035', 1, 1, NULL, 'Resolved', NULL, NULL, NULL, 'theres fire here, pls help me', 'Resolved', '::1', '2026-08-20 23:38:47', '2026-08-23 17:38:47', '2026-08-30 11:37:47', '2026-09-28 06:14:40', 'On Time', 'Completed'),
(36, 'MCAT-000036', 1, 1, NULL, NULL, NULL, NULL, NULL, 'May sunog sa bahay namin sa Barangay Catmon.', 'Rejected', '::1', '2026-08-20 23:39:47', '2026-08-23 17:39:47', NULL, NULL, 'On Time', 'Completed'),
(37, 'MCAT-000037', 1, 1, NULL, NULL, NULL, NULL, NULL, 'May sunog sa bahay namin sa Barangay Catmon', 'Rejected', '::1', '2026-08-20 23:41:32', '2026-08-23 17:41:32', NULL, NULL, 'On Time', 'Completed'),
(38, 'MCAT-000038', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog po tulong nganiii', 'Resolved', '::1', '2026-08-20 23:56:49', '2026-08-21 17:56:49', '2026-08-23 13:24:40', '2026-08-24 16:52:12', 'On Time', 'Completed'),
(39, 'MCAT-000039', 1, NULL, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog dito g', 'Resolved', '::1', '2026-08-21 03:04:47', '2026-08-21 21:04:47', '2026-08-24 00:29:14', '2026-08-24 16:54:17', 'On Time', 'Completed'),
(40, 'MCAT-000040', 1, 1, NULL, 'Resolved', NULL, NULL, NULL, 'may basura anlala grabi ba', 'Resolved', '::1', '2026-08-21 17:17:39', '2026-08-24 11:17:39', '2026-10-13 18:35:50', '2026-10-13 18:37:10', 'On Time', 'Completed'),
(41, 'MCAT-000041', 1, 1, NULL, 'Resolved', NULL, NULL, NULL, 'nagbabaga na yung apoy dito sa amin anlakas grabe tulong po', 'Resolved', '::1', '2026-08-26 01:44:05', '2026-08-26 19:44:05', '2026-08-26 03:29:06', '2026-08-26 03:38:38', 'On Time', 'Completed'),
(42, 'MCAT-000042', 1, 1, NULL, 'Resolved', NULL, NULL, NULL, 'antaas na ng tubig dito sa amin tulong po', 'Resolved', '::1', '2026-08-26 01:47:41', '2026-08-26 19:47:41', '2026-08-26 03:45:05', '2026-08-27 21:39:38', 'On Time', 'Completed'),
(43, 'MCAT-000043', 1, 1, NULL, NULL, NULL, NULL, NULL, 'grabeng basura to pakalat kalat na oh', 'Verified', '::1', '2026-08-26 01:49:47', '2026-08-28 19:49:47', NULL, NULL, 'On Time', 'Completed'),
(44, 'MCAT-000044', 1, 1, NULL, 'Resolved', NULL, NULL, NULL, 'anlala na ng basura grabe talga', 'Resolved', '::1', '2026-08-26 01:55:40', '2026-08-28 19:55:40', '2026-10-13 23:35:42', '2026-10-15 01:19:50', 'On Time', 'Completed'),
(45, 'MCAT-000045', 1, 9, NULL, NULL, NULL, NULL, NULL, 'awit talga grabe mga nakaharang dito sa amin', 'Verified', '::1', '2026-08-26 03:40:00', '2026-08-28 21:40:00', NULL, NULL, 'On Time', 'Completed'),
(46, 'MCAT-000046', 1, 1, 12, 'Assigned', NULL, NULL, NULL, 'Shish', 'Verified', '136.158.41.255', '2026-08-27 21:47:54', '2026-08-31 00:47:54', '2026-10-02 21:00:09', NULL, 'On Time', 'Completed'),
(47, 'MCAT-000047', 8, 1, NULL, 'Resolved', NULL, NULL, NULL, 'Baha na pu dtu sa tinaheros', 'Resolved', '112.203.34.162', '2026-08-27 21:50:55', '2026-08-31 00:50:55', '2026-08-27 21:53:51', '2026-08-27 21:59:24', 'On Time', 'Completed'),
(48, 'MCAT-000048', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'Eto bastos', 'Rejected', '112.203.34.162', '2026-08-27 22:04:39', '2026-08-31 01:04:39', NULL, NULL, 'On Time', 'Completed'),
(49, 'MCAT-000049', 12, 1, NULL, 'Resolved', NULL, NULL, NULL, 'sonog po', 'Resolved', '175.176.37.137', '2026-08-28 20:09:50', '2026-08-31 23:09:50', '2026-08-28 20:19:33', '2026-08-28 20:26:40', 'On Time', 'Completed'),
(50, 'MCAT-000050', 12, NULL, NULL, NULL, NULL, NULL, NULL, 'tanginamo bbm', 'Rejected', '175.176.37.137', '2026-08-28 20:33:53', '2026-08-31 23:33:53', NULL, NULL, 'On Time', 'Completed'),
(51, 'MCAT-000051', 12, NULL, NULL, NULL, NULL, NULL, NULL, 'tanginamo allen kalbo', 'Rejected', '175.176.37.137', '2026-08-28 20:48:55', '2026-08-31 23:48:56', NULL, NULL, 'On Time', 'Completed'),
(52, 'MCAT-000052', 12, NULL, NULL, NULL, NULL, NULL, NULL, 'tanginang buhay 2', 'Rejected', '175.176.37.137', '2026-08-28 21:05:23', '2026-09-01 00:05:23', NULL, NULL, 'On Time', 'Completed'),
(53, 'MCAT-000053', 12, NULL, NULL, NULL, NULL, NULL, NULL, 'ulol tanginamo jorji', 'Rejected', '175.176.37.137', '2026-08-28 21:13:07', '2026-09-01 00:13:07', NULL, NULL, 'On Time', 'Completed'),
(54, 'MCAT-000054', 12, NULL, NULL, NULL, NULL, NULL, NULL, 'tanginamo jorji ulol', 'Rejected', '175.176.37.137', '2026-08-28 21:16:57', '2026-09-01 00:16:56', NULL, NULL, 'On Time', 'Completed'),
(55, 'MCAT-000055', 1, 1, NULL, 'Resolved', NULL, NULL, NULL, 'may sunog ya', 'Resolved', '136.158.41.255', '2026-09-01 09:17:11', '2026-09-02 12:17:11', '2026-09-29 03:53:40', '2026-09-29 22:00:23', 'On Time', 'Completed'),
(56, 'MCAT-000056', 11, 1, NULL, 'Resolved', NULL, NULL, NULL, 'wala kuryente', 'Resolved', '136.158.40.191', '2026-09-01 10:55:49', '2026-09-04 13:55:49', '2026-10-01 04:25:48', '2026-10-01 04:27:50', 'On Time', 'Completed'),
(57, 'MCAT-000057', 1, 7, NULL, NULL, NULL, NULL, NULL, 'may sunog dito sa catmon', 'Rejected', '136.158.41.255', '2026-09-02 05:41:11', '2026-09-03 08:41:12', NULL, NULL, 'On Time', 'Completed'),
(58, 'MAL-COM-2026-000058', 18, 3, NULL, NULL, NULL, NULL, NULL, 'May sunog na Dito sa amin sa catmon', 'Verified', '136.158.41.255', '2026-09-23 03:30:32', '2026-09-26 06:30:31', NULL, NULL, 'On Time', 'Completed'),
(59, 'MAL-COM-2026-000059', 18, 1, NULL, NULL, NULL, NULL, NULL, 'May sunog na dito sa catmon, grabe anlakas', 'Rejected', '136.158.41.255', '2026-09-23 03:37:40', '2026-09-24 06:37:40', NULL, NULL, 'On Time', 'Completed'),
(60, 'MAL-COM-2026-000060', 16, 7, 8, 'On the Way', NULL, NULL, NULL, 'may sunog dto sa malabon', 'Rejected', '112.203.47.95', '2026-09-23 20:52:26', '2026-09-24 23:52:25', '2026-10-01 04:11:36', NULL, 'On Time', 'Completed'),
(61, 'MAL-COM-2026-000061', 10, 1, NULL, NULL, NULL, NULL, NULL, 'May lindol dto sa Araneta Malabon', 'Rejected', '136.158.40.191', '2026-10-01 01:39:46', '2026-10-04 04:39:45', NULL, NULL, 'On Time', 'Completed'),
(62, 'MAL-COM-2026-000062', 10, 1, NULL, NULL, NULL, NULL, NULL, 'May sunog Dito sa Araneta Malabon', 'Rejected', '136.158.40.191', '2026-10-01 01:40:35', '2026-10-02 04:40:34', NULL, NULL, 'On Time', 'Completed'),
(63, 'MAL-COM-2026-000063', 16, 1, NULL, 'Resolved', NULL, NULL, NULL, 'May basura po dto sa santulan', 'Resolved', '136.158.40.191', '2026-10-01 04:17:41', '2026-10-04 07:17:41', '2026-10-01 04:19:26', '2026-10-08 01:28:35', 'On Time', 'Completed'),
(64, 'MAL-COM-2026-000064', 11, 1, NULL, NULL, NULL, NULL, NULL, 'may basura dito sa bargy santulan', 'Rejected', '136.158.40.191', '2026-10-01 04:29:31', '2026-10-04 07:29:32', NULL, NULL, 'On Time', 'Completed'),
(65, 'MAL-COM-2026-000065', 9, 1, NULL, NULL, NULL, NULL, NULL, 'may tambak ng basura dito sa harap ng school sa catmon', 'Rejected', '136.158.40.163', '2026-10-01 20:24:54', '2026-10-04 23:24:53', NULL, NULL, 'On Time', 'Completed'),
(66, 'MAL-COM-2026-000066', 6, 8, 12, 'Assigned', NULL, NULL, NULL, 'baho dito amoy taong daga dito sa longos Malabon city', 'In Progress', '136.158.43.66', '2026-10-08 05:53:32', '2026-10-11 08:53:32', '2026-10-15 08:31:25', NULL, 'On Time', 'Completed'),
(67, 'MAL-COM-2026-000067', 16, 11, NULL, NULL, NULL, NULL, NULL, 'May basura dto sa Longos', 'Rejected', '112.198.70.245', '2026-10-13 23:48:41', '2026-10-17 02:48:41', NULL, NULL, 'On Time', 'Completed'),
(68, 'MAL-COM-2026-000068', 16, 1, NULL, 'Unable to Resolve', NULL, NULL, NULL, 'Traffic po dto sa catmon', 'Unable to Resolve', '136.158.41.50', '2026-10-14 02:22:53', '2026-10-17 05:22:53', '2026-10-14 04:40:12', '2026-10-14 05:38:07', 'On Time', 'Completed'),
(69, 'MAL-COM-2026-000069', 6, 7, NULL, NULL, NULL, NULL, NULL, 'may sunog na barbeque dito sa ibaba malabon', 'Rejected', '136.158.43.193', '2026-10-14 06:07:39', '2026-10-15 09:07:39', NULL, NULL, 'On Time', 'Completed'),
(70, 'MAL-COM-2026-000070', 37, 1, NULL, 'Resolved', NULL, NULL, NULL, 'Trash Piling up near Del Monte \"Sabungan\"', 'Resolved', '136.158.43.69', '2026-10-15 01:05:32', '2026-10-18 04:05:31', '2026-10-15 01:09:55', '2026-10-15 01:45:57', 'On Time', 'Completed'),
(71, 'MAL-COM-2026-000071', 38, 1, NULL, 'Resolved', NULL, NULL, NULL, 'May mga nakita po akong mga basura dito sa may palengke ng catmon malapit sa may robinson', 'Resolved', '113.19.143.225', '2026-10-15 03:04:21', '2026-10-18 06:04:21', '2026-10-15 03:18:36', '2026-10-15 03:25:16', 'On Time', 'Completed'),
(72, 'MAL-COM-2026-000072', 32, 1, NULL, 'Resolved', NULL, NULL, NULL, 'Maingay mga kapitbahay ko nagiinuman dito sa Barangay Catmon.', 'Resolved', '175.176.24.55', '2026-10-15 03:51:52', '2026-10-18 06:51:52', '2026-10-15 03:54:25', '2026-10-15 03:57:38', 'On Time', 'Completed'),
(73, 'MAL-COM-2026-000073', 39, 1, NULL, 'Resolved', NULL, NULL, NULL, 'daming kalat na basura dito sa catmon', 'Resolved', '136.158.41.50', '2026-10-15 07:19:16', '2026-10-18 10:19:17', '2026-10-15 07:20:25', '2026-10-15 08:28:29', 'On Time', 'Completed'),
(74, 'MAL-COM-2026-000074', 28, 1, NULL, 'Resolved', NULL, NULL, NULL, 'madaming basura dto sa tinajeros', 'Resolved', '112.203.44.54', '2026-10-15 07:53:20', '2026-10-18 10:53:21', '2026-10-15 08:18:25', '2026-10-15 08:30:42', 'On Time', 'Completed'),
(75, 'MAL-COM-2026-000075', 40, 1, NULL, NULL, NULL, NULL, NULL, 'May sunog sa Malabon City', 'Rejected', '175.176.28.60', '2026-10-15 08:34:09', '2026-10-16 11:34:09', NULL, NULL, 'On Time', 'Completed'),
(76, 'MAL-COM-2026-000076', 39, 1, NULL, 'Resolved', NULL, NULL, NULL, 'Kalat kalat nanaman mga Basura dito sa barangay catmon', 'Resolved', '136.158.41.50', '2026-10-15 10:26:45', '2026-10-18 13:26:44', '2026-10-15 10:27:49', '2026-10-15 11:36:53', 'On Time', 'Completed'),
(77, 'MAL-COM-2026-000077', 39, 1, 8, 'Assigned', NULL, NULL, NULL, 'may basura dito sa catmon', 'Rejected', '::1', '2026-10-16 20:15:12', '2026-10-17 20:15:12', '2026-10-16 21:46:20', NULL, 'On Time', 'Completed'),
(78, 'TEST-CLUSTER-080', 2, 7, 7, 'Assigned', NULL, NULL, NULL, 'Sunog sa isang bahay. Malakas ang apoy at may makapal na usok.', 'In Progress', '127.0.0.1', '2026-10-17 08:38:12', '2026-10-18 08:38:12', '2026-10-17 08:41:48', NULL, 'On Time', 'Completed'),
(79, 'TEST-CLUSTER-081', 3, 7, 7, 'Assigned', NULL, NULL, NULL, 'There is an active house fire. The flames are spreading to a nearby structure.', 'In Progress', '127.0.0.1', '2026-10-17 08:38:12', '2026-10-18 08:38:12', '2026-10-17 08:41:48', NULL, 'On Time', 'Completed'),
(80, 'TEST-CLUSTER-082', 4, 7, 7, 'Assigned', NULL, NULL, NULL, 'May sunog sa malapit na building at posibleng may mga taong nasa loob.', 'In Progress', '127.0.0.1', '2026-10-17 08:38:12', '2026-10-18 08:38:12', '2026-10-17 08:41:48', NULL, 'On Time', 'Completed'),
(81, 'TEST-CLUSTER-083', 5, 7, 7, 'Assigned', NULL, NULL, NULL, 'A building is on fire with heavy smoke spreading into nearby homes.', 'In Progress', '127.0.0.1', '2026-10-17 08:38:12', '2026-10-18 08:38:12', '2026-10-17 08:41:48', NULL, 'On Time', 'Completed'),
(82, 'TEST-CLUSTER-084', 6, 7, 7, 'Assigned', NULL, NULL, NULL, 'May aktibong sunog at mabilis kumakalat ang apoy. Kailangan agad ng responders.', 'In Progress', '127.0.0.1', '2026-10-17 08:38:12', '2026-10-18 08:38:12', '2026-10-17 08:41:48', NULL, 'On Time', 'Completed'),
(83, 'TEST-CLUSTER-085', 2, 7, 7, 'Assigned', NULL, NULL, NULL, 'There is a serious fire emergency with visible flames and thick smoke.', 'In Progress', '127.0.0.1', '2026-10-17 08:38:12', '2026-10-18 08:38:12', '2026-10-17 08:41:48', NULL, 'On Time', 'Completed'),
(84, 'MCAT-T-1792209108-001', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May sunog sa isang bahay sa Acacia. Makapal ang usok at kumakalat ang apoy.', 'Resolved', 'TEST-1792209109-001', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(85, 'MCAT-T-1792209108-002', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunog po sa kusina ng bahay namin sa Baritan. Lumalaki na ang apoy.', 'Resolved', 'TEST-1792209109-002', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(86, 'MCAT-T-1792209108-003', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May nasusunog na tindahan sa Catmon. May mga tao pang nasa loob.', 'Resolved', 'TEST-1792209109-003', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(87, 'MCAT-T-1792209108-004', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May malaking sunog sa Tonsuya at malapit sa mga bahay ang apoy.', 'Resolved', 'TEST-1792209109-004', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(88, 'MCAT-T-1792209108-005', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'Nasusunog ang electrical panel ng building sa Concepcion. May usok sa loob.', 'Resolved', 'TEST-1792209109-005', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(89, 'MCAT-T-1792209108-006', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunog sa bahay sa Dampalit. Hindi makalabas ang isang matanda dahil sa usok.', 'Resolved', 'TEST-1792209109-006', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(90, 'MCAT-T-1792209108-007', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'May sunog sa maliit na bodega sa Longos at mabilis kumalat ang apoy.', 'Resolved', 'TEST-1792209109-007', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(91, 'MCAT-T-1792209108-008', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Nasusunog ang isang sasakyan sa tabi ng mga bahay sa Potrero.', 'Resolved', 'TEST-1792209109-008', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(92, 'MCAT-T-1792209108-009', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'May sunog sa second floor ng bahay sa Ibaba. May naiwan pang tao sa taas.', 'Resolved', 'TEST-1792209109-009', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(93, 'MCAT-T-1792209108-010', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunog po sa karinderya sa Niugan. Umaabot na sa kisame ang apoy.', 'Resolved', 'TEST-1792209109-010', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(94, 'MCAT-T-1792209108-011', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May apoy at makapal na usok sa apartment sa Muzon. May mga residente sa loob.', 'Resolved', 'TEST-1792209109-011', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(95, 'MCAT-T-1792209108-012', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'Nasusunog ang mga nakatambak na materyales sa Hulong Duhat at malapit ang mga bahay.', 'Resolved', 'TEST-1792209109-012', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(96, 'MCAT-T-1792209108-013', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunog sa talyer sa Tinajeros. May sumasabog na maliliit na bagay.', 'Resolved', 'TEST-1792209109-013', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(97, 'MCAT-T-1792209108-014', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'May nasusunog na bahay sa Maysilo. Hindi pa nailalabas ang lahat ng residente.', 'Resolved', 'TEST-1792209109-014', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(98, 'MCAT-T-1792209108-015', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May sunog sa electrical wiring sa Santolan at may spark sa kisame.', 'Resolved', 'TEST-1792209109-015', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(99, 'MCAT-T-1792209108-016', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'Nasusunog ang isang apartment sa Bayan-Bayanan. May batang nasa loob ayon sa kapitbahay.', 'Resolved', 'TEST-1792209109-016', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(100, 'MCAT-T-1792209108-017', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May malaking sunog sa bodega sa Panghulo at papunta na ang usok sa katabing building.', 'Resolved', 'TEST-1792209109-017', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(101, 'MCAT-T-1792209108-018', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunog sa bahay sa Tugatog. May taong nasugatan at patuloy pa ang apoy.', 'Resolved', 'TEST-1792209109-018', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(102, 'MCAT-T-1792209108-019', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'Mabilis tumaas ang baha sa Dampalit at may mga residenteng hindi makalabas ng bahay.', 'Resolved', 'TEST-1792209109-019', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(103, 'MCAT-T-1792209108-020', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'Malalim na ang baha sa Panghulo at may matandang nangangailangan ng tulong.', 'Resolved', 'TEST-1792209109-020', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(104, 'MCAT-T-1792209108-021', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'Bumuhos ang tubig sa mababang lugar ng Catmon at may mga taong na-stranded.', 'Resolved', 'TEST-1792209109-021', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(105, 'MCAT-T-1792209108-022', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Bumaha sa Tonsuya at may batang naipit sa bahay dahil sa taas ng tubig.', 'Resolved', 'TEST-1792209109-022', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(106, 'MCAT-T-1792209108-023', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'Umaabot na sa dibdib ang baha sa isang bahagi ng Longos at may residenteng humihingi ng rescue.', 'Resolved', 'TEST-1792209109-023', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(107, 'MCAT-T-1792209108-024', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May mabilis na pagtaas ng baha sa Ibaba at may taong na-stranded sa bubong.', 'Resolved', 'TEST-1792209109-024', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(108, 'MCAT-T-1792209108-025', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'Bumaha nang malalim sa Hulong Duhat at hindi madaanan ng mga residente ang kalsada.', 'Resolved', 'TEST-1792209109-025', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(109, 'MCAT-T-1792209108-026', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'May baha sa ilang bahagi ng Acacia matapos ang malakas na ulan.', 'Pending', 'TEST-1792209109-026', '2026-10-17 09:51:49', '2026-10-20 09:51:49', NULL, NULL, 'On Time', 'Completed'),
(110, 'MCAT-T-1792209108-027', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'Naiipon ang tubig sa kalsada sa Baritan at bumabagal ang mga sasakyan.', 'Resolved', 'TEST-1792209109-027', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(111, 'MCAT-T-1792209108-028', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'May mababaw na baha sa labas ng paaralan sa Concepcion.', 'Rejected', 'TEST-1792209109-028', '2026-10-17 07:51:49', '2026-10-20 07:51:49', NULL, NULL, 'On Time', 'Completed'),
(112, 'MCAT-T-1792209108-029', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'Hindi agad umaagos ang tubig-ulan sa isang kalye sa Niugan.', 'Pending', 'TEST-1792209109-029', '2026-10-17 06:51:49', '2026-10-20 06:51:49', NULL, NULL, 'On Time', 'Completed'),
(113, 'MCAT-T-1792209108-030', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'May tubig-baha sa tapat ng ilang tindahan sa Potrero.', 'Resolved', 'TEST-1792209109-030', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(114, 'MCAT-T-1792209108-031', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'Bumaha sa kanto ng Muzon matapos ang tuloy-tuloy na ulan.', 'Pending', 'TEST-1792209109-031', '2026-10-17 04:51:49', '2026-10-20 04:51:49', NULL, NULL, 'On Time', 'Completed'),
(115, 'MCAT-T-1792209108-032', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May naipong tubig sa residential street sa Maysilo.', 'Resolved', 'TEST-1792209109-032', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(116, 'MCAT-T-1792209108-033', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'Baha sa bahagi ng Tañong at hirap dumaan ang mga naglalakad.', 'Rejected', 'TEST-1792209109-033', '2026-10-17 02:51:49', '2026-10-20 02:51:49', NULL, NULL, 'On Time', 'Completed'),
(117, 'MCAT-T-1792209108-034', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'May tubig sa kalsada malapit sa mga bahay sa Flores.', 'Pending', 'TEST-1792209109-034', '2026-10-17 01:51:49', '2026-10-20 01:51:49', NULL, NULL, 'On Time', 'Completed'),
(118, 'MCAT-T-1792209108-035', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'Mabagal ang drainage at naiipon ang tubig sa isang eskinita sa Baritan.', 'Resolved', 'TEST-1792209109-035', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(119, 'MCAT-T-1792209108-036', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May malaking puno na bumagsak at nakaharang sa buong kalsada sa Tinajeros.', 'Resolved', 'TEST-1792209109-036', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(120, 'MCAT-T-1792209108-037', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'May bumagsak na poste sa kalsada sa Potrero at may nakalaylay na live wire.', 'Resolved', 'TEST-1792209109-037', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(121, 'MCAT-T-1792209108-038', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May malaking debris mula sa gumuhong pader na nakaharang sa daan sa Catmon.', 'Resolved', 'TEST-1792209109-038', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(122, 'MCAT-T-1792209108-039', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May truck na tumagilid at tumapon ang karga sa kalsada sa Longos.', 'Resolved', 'TEST-1792209109-039', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(123, 'MCAT-T-1792209108-040', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'May malaking bakal na bumagsak sa daan sa Concepcion at muntik nang tumama sa tao.', 'Resolved', 'TEST-1792209109-040', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(124, 'MCAT-T-1792209108-041', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'May gumuhong bahagi ng pader at nakaharang sa labasan ng mga bahay sa Muzon.', 'Resolved', 'TEST-1792209109-041', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(125, 'MCAT-T-1792209108-042', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'May abandonadong sasakyan na nakaharang sa isang lane sa Acacia.', 'Pending', 'TEST-1792209109-042', '2026-10-17 05:51:49', '2026-10-20 05:51:49', NULL, NULL, 'On Time', 'Completed'),
(126, 'MCAT-T-1792209108-043', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May mga construction material na nakatambak sa sidewalk sa Baritan.', 'Resolved', 'TEST-1792209109-043', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(127, 'MCAT-T-1792209108-044', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'May basurang nakaharang sa drainage opening sa Bayan-Bayanan.', 'Rejected', 'TEST-1792209109-044', '2026-10-17 03:51:49', '2026-10-20 03:51:49', NULL, NULL, 'On Time', 'Completed'),
(128, 'MCAT-T-1792209108-045', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May nakaparadang sasakyan sa tapat ng driveway sa Ibaba.', 'Pending', 'TEST-1792209109-045', '2026-10-17 02:51:49', '2026-10-20 02:51:49', NULL, NULL, 'On Time', 'Completed'),
(129, 'MCAT-T-1792209108-046', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May mga kahon at gamit na nakaharang sa sidewalk sa Niugan.', 'Resolved', 'TEST-1792209109-046', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(130, 'MCAT-T-1792209108-047', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'May sanga ng puno sa gilid ng kalsada sa Hulong Duhat.', 'Pending', 'TEST-1792209109-047', '2026-10-17 00:51:49', '2026-10-20 00:51:49', NULL, NULL, 'On Time', 'Completed'),
(131, 'MCAT-T-1792209108-048', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'May delivery truck na nakaharang sa entrance ng eskinita sa Tonsuya.', 'Resolved', 'TEST-1792209109-048', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(132, 'MCAT-T-1792209108-049', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'May debris mula sa repair work na naiwan sa sidewalk sa Maysilo.', 'Rejected', 'TEST-1792209109-049', '2026-10-17 10:51:49', '2026-10-20 10:51:49', NULL, NULL, 'On Time', 'Completed'),
(133, 'MCAT-T-1792209108-050', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May nakaharang na kariton sa pedestrian passage sa Santolan.', 'Pending', 'TEST-1792209109-050', '2026-10-17 09:51:49', '2026-10-20 09:51:49', NULL, NULL, 'On Time', 'Completed'),
(134, 'MCAT-T-1792209108-051', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'May mga sako ng buhangin sa daanan sa Panghulo.', 'Resolved', 'TEST-1792209109-051', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(135, 'MCAT-T-1792209108-052', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May sirang bahagi ng bakod na nakaharang sa sidewalk sa Tugatog.', 'Pending', 'TEST-1792209109-052', '2026-10-17 07:51:49', '2026-10-20 07:51:49', NULL, NULL, 'On Time', 'Completed'),
(136, 'MCAT-T-1792209108-053', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May tambak ng basura sa gilid ng kalsada sa Flores.', 'Resolved', 'TEST-1792209109-053', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(137, 'MCAT-T-1792209108-054', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'Banggaan ng dalawang sasakyan sa highway sa Potrero. May taong naipit at nasugatan.', 'Resolved', 'TEST-1792209109-054', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(138, 'MCAT-T-1792209108-055', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'May aksidente sa kalsada sa Catmon at may tumutulong dugo mula sa isang motorista.', 'Resolved', 'TEST-1792209109-055', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(139, 'MCAT-T-1792209108-056', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'May bus na bumangga sa poste sa Tonsuya at may mga pasaherong nasugatan.', 'Resolved', 'TEST-1792209109-056', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(140, 'MCAT-T-1792209108-057', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May motorcycle crash sa Longos at hindi gumagalaw ang isang biktima.', 'Resolved', 'TEST-1792209109-057', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(141, 'MCAT-T-1792209108-058', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'May malaking banggaan sa Acacia at nakaharang ang mga sasakyan sa buong kalsada.', 'Resolved', 'TEST-1792209109-058', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(142, 'MCAT-T-1792209108-059', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May truck accident sa Tinajeros at may tumagas na hindi kilalang likido.', 'Resolved', 'TEST-1792209109-059', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(143, 'MCAT-T-1792209108-060', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May nabanggang pedestrian sa Baritan at walang malay ang biktima.', 'Resolved', 'TEST-1792209109-060', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(144, 'MCAT-T-1792209108-061', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'May sasakyang tumaob sa Panghulo at may taong hindi makalabas.', 'Resolved', 'TEST-1792209109-061', '2026-10-14 11:51:49', '2026-10-15 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(145, 'MCAT-T-1792209108-062', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'Matinding traffic sa Concepcion dahil sa sirang traffic light.', 'Pending', 'TEST-1792209109-062', '2026-10-17 09:51:49', '2026-10-20 09:51:49', NULL, NULL, 'On Time', 'Completed'),
(146, 'MCAT-T-1792209108-063', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'Mabagal ang daloy ng sasakyan sa Maysilo dahil sa road repair.', 'Resolved', 'TEST-1792209109-063', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(147, 'MCAT-T-1792209108-064', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'May traffic congestion sa Niugan dahil sa double parking.', 'Rejected', 'TEST-1792209109-064', '2026-10-17 07:51:49', '2026-10-20 07:51:49', NULL, NULL, 'On Time', 'Completed'),
(148, 'MCAT-T-1792209108-065', 2, NULL, NULL, NULL, NULL, NULL, NULL, 'Mahaba ang pila ng sasakyan sa Bayan-Bayanan dahil sa rush hour.', 'Pending', 'TEST-1792209109-065', '2026-10-17 06:51:49', '2026-10-20 06:51:49', NULL, NULL, 'On Time', 'Completed'),
(149, 'MCAT-T-1792209108-066', 4, NULL, NULL, NULL, NULL, NULL, NULL, 'May mabagal na daloy ng trapiko sa Ibaba dahil sa delivery vehicles.', 'Resolved', 'TEST-1792209109-066', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(150, 'MCAT-T-1792209108-067', 6, NULL, NULL, NULL, NULL, NULL, NULL, 'May traffic sa Santolan dahil sa mga sasakyang naghihintay ng pasahero.', 'Pending', 'TEST-1792209109-067', '2026-10-17 04:51:49', '2026-10-20 04:51:49', NULL, NULL, 'On Time', 'Completed'),
(151, 'MCAT-T-1792209108-068', 8, NULL, NULL, NULL, NULL, NULL, NULL, 'May pagsisikip ng trapiko sa Muzon dahil sa road maintenance.', 'Resolved', 'TEST-1792209109-068', '2026-10-14 11:51:49', '2026-10-17 11:51:49', '2026-10-15 11:51:49', '2026-10-16 11:51:49', 'Completed On Time', 'Completed'),
(152, 'MCAT-T-1792209108-069', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'May traffic sa Hulong Duhat dahil sa mga sasakyang nakaparada sa gilid.', 'Rejected', 'TEST-1792209109-069', '2026-10-17 02:51:49', '2026-10-20 02:51:49', NULL, NULL, 'On Time', 'Completed'),
(153, 'MCAT-T-1792209108-070', 10, NULL, NULL, NULL, NULL, NULL, NULL, 'Mabagal ang trapiko sa Tugatog dahil sa pedestrian crossing.', 'Pending', 'TEST-1792209109-070', '2026-10-17 01:51:49', '2026-10-20 01:51:49', NULL, NULL, 'On Time', 'Completed'),
(211, 'MAL-COM-2026-000211', 39, NULL, NULL, NULL, NULL, NULL, NULL, 'traffic na dito sa catmon, tulong po', 'Pending', '::1', '2026-10-17 12:50:29', NULL, NULL, NULL, NULL, 'Unavailable');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_complaint_history`
--

CREATE TABLE `tbl_complaint_history` (
  `historyID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `actorType` enum('SystemUser','Citizen','DispatchTeam','System') NOT NULL,
  `actorID` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `oldStatus` varchar(50) DEFAULT NULL,
  `newStatus` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_complaint_locations`
--

CREATE TABLE `tbl_complaint_locations` (
  `complaintLocationID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` decimal(10,2) DEFAULT NULL,
  `recordedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_complaint_locations`
--

INSERT INTO `tbl_complaint_locations` (`complaintLocationID`, `complaintID`, `latitude`, `longitude`, `accuracy`, `recordedAt`) VALUES
(1, 20, 14.66575435, 120.96277766, 183.00, '2026-08-10 00:44:53'),
(2, 21, 14.66580512, 120.96281475, 138.00, '2026-08-13 22:35:32'),
(3, 22, 14.66576306, 120.96276912, 163.00, '2026-08-17 02:30:29'),
(4, 23, 14.66581990, 120.96284009, 148.00, '2026-08-19 03:29:27'),
(5, 24, 14.66576093, 120.96275750, 148.00, '2026-08-20 00:49:54'),
(6, 25, 14.66576306, 120.96276912, 163.00, '2026-08-20 00:50:35'),
(7, 26, 14.66576306, 120.96276912, 163.00, '2026-08-20 01:08:03'),
(8, 27, 14.66576306, 120.96276912, 163.00, '2026-08-20 01:14:34'),
(9, 28, 14.66576093, 120.96275750, 148.00, '2026-08-20 01:15:58'),
(10, 31, 14.66576306, 120.96276912, 163.00, '2026-08-20 23:28:41'),
(11, 32, 14.66577211, 120.96276166, 185.00, '2026-08-20 23:33:07'),
(12, 33, 14.66576306, 120.96276912, 163.00, '2026-08-20 23:34:09'),
(13, 34, 14.66576359, 120.96277060, 156.00, '2026-08-20 23:38:00'),
(14, 35, 14.66576093, 120.96275750, 148.00, '2026-08-20 23:38:47'),
(15, 36, 14.66576306, 120.96276912, 163.00, '2026-08-20 23:39:47'),
(16, 37, 14.66576093, 120.96275750, 148.00, '2026-08-20 23:41:32'),
(17, 38, 14.66576306, 120.96276912, 163.00, '2026-08-20 23:56:49'),
(18, 39, 14.66576306, 120.96276912, 163.00, '2026-08-21 03:04:47'),
(19, 40, 14.66577198, 120.96276233, 185.00, '2026-08-21 17:17:39'),
(20, 41, 14.66577211, 120.96276166, 185.00, '2026-08-26 01:44:05'),
(21, 42, 14.66577211, 120.96276166, 185.00, '2026-08-26 01:47:41'),
(22, 43, 14.66576306, 120.96276912, 163.00, '2026-08-26 01:49:47'),
(23, 44, 14.66576306, 120.96276912, 163.00, '2026-08-26 01:55:40'),
(24, 45, 14.66581828, 120.96282147, 143.00, '2026-08-26 03:40:00'),
(25, 46, 14.66574280, 120.96284790, 20.00, '2026-08-27 21:47:54'),
(26, 47, 14.69094470, 121.00343820, 19.38, '2026-08-27 21:50:55'),
(27, 48, 14.69075800, 121.00351380, 19.85, '2026-08-27 22:04:39'),
(28, 49, 14.46273401, 120.88500336, 187.00, '2026-08-28 20:09:50'),
(29, 50, 14.46257990, 120.88505802, 143.00, '2026-08-28 20:33:53'),
(30, 51, 14.46259011, 120.88505280, 141.00, '2026-08-28 20:48:55'),
(31, 52, 14.46273401, 120.88500336, 187.00, '2026-08-28 21:05:23'),
(32, 53, 14.46273401, 120.88500336, 187.00, '2026-08-28 21:13:07'),
(33, 54, 14.46257990, 120.88505802, 143.00, '2026-08-28 21:16:57'),
(34, 55, 14.66566238, 120.96281120, 148.00, '2026-09-01 09:17:11'),
(35, 56, 14.69261156, 120.95727973, 5.00, '2026-09-01 10:55:49'),
(36, 57, 14.66585938, 120.96268763, 292.00, '2026-09-02 05:41:11'),
(37, 58, 14.66574660, 120.96287010, 14.03, '2026-09-23 03:30:32'),
(38, 59, 14.66576950, 120.96285750, 13.90, '2026-09-23 03:37:40'),
(39, 60, 14.69100780, 121.00340750, 15.60, '2026-09-23 20:52:26'),
(40, 61, 14.69256570, 120.95735410, 20.00, '2026-10-01 01:39:46'),
(41, 62, 14.69256690, 120.95735400, 20.00, '2026-10-01 01:40:35'),
(42, 63, 14.69257130, 120.95735590, 16.57, '2026-10-01 04:17:41'),
(43, 64, 14.69260375, 120.95728909, 5.00, '2026-10-01 04:29:31'),
(44, 65, 14.66412960, 120.96239670, 13.33, '2026-10-01 20:24:54'),
(45, 66, 14.65324280, 120.95949490, 15.71, '2026-10-08 05:53:32'),
(46, 67, 14.65869590, 120.95022270, 11.48, '2026-10-13 23:48:41'),
(47, 68, 14.66578620, 120.96286010, 14.28, '2026-10-14 02:22:53'),
(48, 69, 14.65324620, 120.95949410, 13.93, '2026-10-14 06:07:39'),
(49, 70, 14.66666667, 120.98739268, 2000.00, '2026-10-15 01:05:32'),
(50, 71, 14.66085730, 120.96100050, 17.43, '2026-10-15 03:04:21'),
(51, 72, 14.66569370, 120.96267830, 13.79, '2026-10-15 03:51:52'),
(52, 73, 14.66582035, 120.96276322, 180.00, '2026-10-15 07:19:16'),
(53, 74, 14.69096300, 121.00342040, 20.00, '2026-10-15 07:53:20'),
(54, 75, 14.68559350, 120.95392340, 28.59, '2026-10-15 08:34:09'),
(55, 76, 14.66578630, 120.96285890, 14.29, '2026-10-15 10:26:45'),
(56, 77, 14.66576895, 120.96284685, 206.00, '2026-10-16 20:15:12'),
(57, 78, 14.67000000, 120.96700000, 10.00, '2026-10-17 08:38:12'),
(58, 79, 14.67018000, 120.96715000, 10.00, '2026-10-17 08:38:12'),
(59, 80, 14.66985000, 120.96685000, 10.00, '2026-10-17 08:38:12'),
(60, 81, 14.67012000, 120.96690000, 10.00, '2026-10-17 08:38:12'),
(61, 82, 14.66992000, 120.96718000, 10.00, '2026-10-17 08:38:12'),
(62, 83, 14.67005000, 120.96695000, 10.00, '2026-10-17 08:38:12'),
(63, 84, 14.66520000, 120.95710000, 25.00, '2026-10-17 11:51:49'),
(64, 85, 14.66240000, 120.95180000, 25.00, '2026-10-17 11:51:49'),
(65, 86, 14.67210000, 120.95890000, 25.00, '2026-10-17 11:51:49'),
(66, 87, 14.67610000, 120.96120000, 25.00, '2026-10-17 11:51:49'),
(67, 88, 14.65910000, 120.95030000, 25.00, '2026-10-17 11:51:49'),
(68, 89, 14.68210000, 120.95110000, 25.00, '2026-10-17 11:51:49'),
(69, 90, 14.67320000, 120.94750000, 25.00, '2026-10-17 11:51:49'),
(70, 91, 14.66840000, 120.97010000, 25.00, '2026-10-17 11:51:49'),
(71, 92, 14.66010000, 120.95630000, 25.00, '2026-10-17 11:51:49'),
(72, 93, 14.66630000, 120.94820000, 25.00, '2026-10-17 11:51:49'),
(73, 94, 14.67010000, 120.95340000, 25.00, '2026-10-17 11:51:49'),
(74, 95, 14.68410000, 120.95810000, 25.00, '2026-10-17 11:51:49'),
(75, 96, 14.68910000, 120.96040000, 25.00, '2026-10-17 11:51:49'),
(76, 97, 14.66310000, 120.96420000, 25.00, '2026-10-17 11:51:49'),
(77, 98, 14.65780000, 120.95930000, 25.00, '2026-10-17 11:51:49'),
(78, 99, 14.67510000, 120.95460000, 25.00, '2026-10-17 11:51:49'),
(79, 100, 14.69310000, 120.94910000, 25.00, '2026-10-17 11:51:49'),
(80, 101, 14.66710000, 120.96210000, 25.00, '2026-10-17 11:51:49'),
(81, 102, 14.68130000, 120.95210000, 25.00, '2026-10-17 11:51:49'),
(82, 103, 14.69240000, 120.95010000, 25.00, '2026-10-17 11:51:49'),
(83, 104, 14.67110000, 120.95910000, 25.00, '2026-10-17 11:51:49'),
(84, 105, 14.67710000, 120.96210000, 25.00, '2026-10-17 11:51:49'),
(85, 106, 14.67410000, 120.94610000, 25.00, '2026-10-17 11:51:49'),
(86, 107, 14.66110000, 120.95710000, 25.00, '2026-10-17 11:51:49'),
(87, 108, 14.68510000, 120.95910000, 25.00, '2026-10-17 11:51:49'),
(88, 109, 14.66410000, 120.95610000, 25.00, '2026-10-17 11:51:49'),
(89, 110, 14.66310000, 120.95210000, 25.00, '2026-10-17 11:51:49'),
(90, 111, 14.65810000, 120.95110000, 25.00, '2026-10-17 11:51:49'),
(91, 112, 14.66710000, 120.94910000, 25.00, '2026-10-17 11:51:49'),
(92, 113, 14.66910000, 120.97110000, 25.00, '2026-10-17 11:51:49'),
(93, 114, 14.67110000, 120.95410000, 25.00, '2026-10-17 11:51:49'),
(94, 115, 14.66210000, 120.96510000, 25.00, '2026-10-17 11:51:49'),
(95, 116, 14.65610000, 120.96310000, 25.00, '2026-10-17 11:51:49'),
(96, 117, 14.68010000, 120.95510000, 25.00, '2026-10-17 11:51:49'),
(97, 118, 14.66110000, 120.95010000, 25.00, '2026-10-17 11:51:49'),
(98, 119, 14.68810000, 120.96110000, 25.00, '2026-10-17 11:51:49'),
(99, 120, 14.66910000, 120.96910000, 25.00, '2026-10-17 11:51:49'),
(100, 121, 14.67210000, 120.95710000, 25.00, '2026-10-17 11:51:49'),
(101, 122, 14.67510000, 120.94810000, 25.00, '2026-10-17 11:51:49'),
(102, 123, 14.65910000, 120.95210000, 25.00, '2026-10-17 11:51:49'),
(103, 124, 14.67010000, 120.95510000, 25.00, '2026-10-17 11:51:49'),
(104, 125, 14.66510000, 120.95810000, 25.00, '2026-10-17 11:51:49'),
(105, 126, 14.66210000, 120.95310000, 25.00, '2026-10-17 11:51:49'),
(106, 127, 14.67610000, 120.95510000, 25.00, '2026-10-17 11:51:49'),
(107, 128, 14.66110000, 120.95510000, 25.00, '2026-10-17 11:51:49'),
(108, 129, 14.66610000, 120.94910000, 25.00, '2026-10-17 11:51:49'),
(109, 130, 14.68310000, 120.95810000, 25.00, '2026-10-17 11:51:49'),
(110, 131, 14.67710000, 120.96010000, 25.00, '2026-10-17 11:51:49'),
(111, 132, 14.66310000, 120.96410000, 25.00, '2026-10-17 11:51:49'),
(112, 133, 14.65810000, 120.96010000, 25.00, '2026-10-17 11:51:49'),
(113, 134, 14.69210000, 120.94810000, 25.00, '2026-10-17 11:51:49'),
(114, 135, 14.66810000, 120.96310000, 25.00, '2026-10-17 11:51:49'),
(115, 136, 14.67910000, 120.95610000, 25.00, '2026-10-17 11:51:49'),
(116, 137, 14.66950000, 120.97050000, 25.00, '2026-10-17 11:51:49'),
(117, 138, 14.67150000, 120.95850000, 25.00, '2026-10-17 11:51:49'),
(118, 139, 14.67650000, 120.96150000, 25.00, '2026-10-17 11:51:49'),
(119, 140, 14.67450000, 120.94750000, 25.00, '2026-10-17 11:51:49'),
(120, 141, 14.66550000, 120.95750000, 25.00, '2026-10-17 11:51:49'),
(121, 142, 14.68950000, 120.96050000, 25.00, '2026-10-17 11:51:49'),
(122, 143, 14.66250000, 120.95250000, 25.00, '2026-10-17 11:51:49'),
(123, 144, 14.69350000, 120.94950000, 25.00, '2026-10-17 11:51:49'),
(124, 145, 14.65950000, 120.95150000, 25.00, '2026-10-17 11:51:49'),
(125, 146, 14.66350000, 120.96450000, 25.00, '2026-10-17 11:51:49'),
(126, 147, 14.66650000, 120.94950000, 25.00, '2026-10-17 11:51:49'),
(127, 148, 14.67550000, 120.95550000, 25.00, '2026-10-17 11:51:49'),
(128, 149, 14.66050000, 120.95650000, 25.00, '2026-10-17 11:51:49'),
(129, 150, 14.65750000, 120.96050000, 25.00, '2026-10-17 11:51:49'),
(130, 151, 14.67050000, 120.95450000, 25.00, '2026-10-17 11:51:49'),
(131, 152, 14.68450000, 120.95850000, 25.00, '2026-10-17 11:51:49'),
(132, 153, 14.66750000, 120.96250000, 25.00, '2026-10-17 11:51:49'),
(190, 211, 14.64985806, 120.98393021, 88.00, '2026-10-17 12:50:29');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_dispatch_locations`
--

CREATE TABLE `tbl_dispatch_locations` (
  `locationID` int(11) NOT NULL,
  `teamID` int(11) NOT NULL,
  `complaintID` int(11) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy` decimal(10,2) DEFAULT NULL,
  `recordedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_dispatch_logs`
--

CREATE TABLE `tbl_dispatch_logs` (
  `logID` int(11) NOT NULL,
  `complaintID` int(11) DEFAULT NULL,
  `systemUserID` int(11) DEFAULT NULL,
  `dispatchTeamID` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_dispatch_logs`
--

INSERT INTO `tbl_dispatch_logs` (`logID`, `complaintID`, `systemUserID`, `dispatchTeamID`, `action`, `details`, `createdAt`) VALUES
(1, 20, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-17 01:44:23'),
(2, 20, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-17 01:51:32'),
(3, 20, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-20 01:42:42'),
(4, 27, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-20 01:46:15'),
(5, 27, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-20 01:46:17'),
(6, 26, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-20 01:49:37'),
(7, 26, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-20 01:50:35'),
(8, 38, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-23 13:27:38'),
(9, 38, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-23 13:27:43'),
(10, 38, NULL, 6, 'Unable to Resolve', 'Other - Fake', '2026-08-23 13:35:49'),
(11, 39, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 00:29:32'),
(12, 39, NULL, 6, 'Unable to Resolve', 'Other - shihs', '2026-08-24 00:52:48'),
(13, 31, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 00:53:02'),
(14, 31, NULL, 6, 'Unable to Resolve', 'Other', '2026-08-24 01:06:31'),
(15, 31, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 01:06:46'),
(16, 31, NULL, 6, 'Unable to Resolve', 'Other', '2026-08-24 01:16:02'),
(17, 31, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 01:17:14'),
(18, 31, NULL, 6, 'Unable to Resolve', 'Other', '2026-08-24 01:27:02'),
(19, 31, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 01:27:17'),
(20, 31, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-24 16:22:10'),
(21, 38, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 16:51:35'),
(22, 38, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-24 16:51:52'),
(23, 39, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 16:53:56'),
(24, 39, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-24 16:53:58'),
(25, 32, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 16:57:19'),
(26, 32, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-24 16:57:25'),
(27, 33, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 17:02:31'),
(28, 33, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-24 17:02:38'),
(29, 34, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-24 17:05:25'),
(30, 34, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-24 17:05:30'),
(34, 41, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-26 03:37:59'),
(35, 41, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-26 03:38:26'),
(36, 42, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-27 12:13:52'),
(37, 42, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-27 21:39:05'),
(38, 47, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-27 21:54:19'),
(39, 47, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-27 21:58:50'),
(40, 49, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-28 20:21:32'),
(41, 49, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-08-28 20:26:00'),
(42, 35, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-08-30 11:40:00'),
(43, 35, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-09-02 05:52:48'),
(44, 55, NULL, 6, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-09-29 21:59:54'),
(45, 55, NULL, 6, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-09-29 22:00:01'),
(46, 56, NULL, 12, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-01 04:26:13'),
(47, 56, NULL, 12, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-01 04:26:20'),
(48, 56, NULL, 12, 'Assistance Requested', 'Safety concern - complete resolved', '2026-10-01 04:26:46'),
(49, 63, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-08 01:28:16'),
(50, 63, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-08 01:28:23'),
(51, 40, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-13 18:36:45'),
(52, 40, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-13 18:36:50'),
(53, 44, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-13 23:36:28'),
(54, 68, NULL, 11, 'Unable to Resolve', 'Safety issue - we can\'t solve this', '2026-10-14 05:38:07'),
(55, 44, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 01:12:57'),
(56, 70, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-15 01:21:19'),
(57, 70, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 01:41:13'),
(58, 71, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-15 03:20:28'),
(59, 71, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 03:23:13'),
(60, 72, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-15 03:55:09'),
(61, 72, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 03:56:11'),
(62, 73, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-15 07:20:46'),
(63, 73, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 08:23:35'),
(64, 74, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-15 08:29:06'),
(65, 74, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 08:29:55'),
(66, 76, NULL, 9, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-15 10:28:02'),
(67, 76, NULL, 9, 'Arrived at Location', 'Dispatch team arrived at the complaint location.', '2026-10-15 11:32:38'),
(68, 60, NULL, 8, 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', '2026-10-17 11:39:22');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_dispatch_teams`
--

CREATE TABLE `tbl_dispatch_teams` (
  `teamID` int(11) NOT NULL,
  `teamName` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `teamLeader` varchar(100) DEFAULT NULL,
  `contactNumber` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `passwordHash` varchar(255) DEFAULT NULL,
  `status` enum('Available','Dispatched','On Break','Offline') DEFAULT 'Available',
  `currentComplaintID` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `currentLatitude` decimal(10,7) DEFAULT NULL,
  `currentLongitude` decimal(10,7) DEFAULT NULL,
  `locationAccuracy` decimal(10,2) DEFAULT NULL,
  `lastLocationUpdate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_dispatch_teams`
--

INSERT INTO `tbl_dispatch_teams` (`teamID`, `teamName`, `department`, `teamLeader`, `contactNumber`, `email`, `passwordHash`, `status`, `currentComplaintID`, `createdAt`, `currentLatitude`, `currentLongitude`, `locationAccuracy`, `lastLocationUpdate`) VALUES
(6, 'teamba', 'BFP', 'Diwata', '09218932313', 'diwata@gmail.com', '$2y$10$ETpsCPTYo1WbeOwNmz22muEXK.fgIfpGvHHCCAa20xqh8.5f0nbLG', 'Available', NULL, '2026-08-14 16:42:17', 14.6657609, 120.9627575, 148.00, '2026-08-30 11:52:58'),
(7, 'BFPdispatch', 'BFP', 'Joshua', '09123412321', 'BFPteam@gmail.com', '$2y$12$b49S2s0KI6mH5GtTNU6XT./yFBj6LTvKhQ3af2f4lIEAVcx.JCWKG', 'Dispatched', 78, '2026-09-29 18:27:18', NULL, NULL, NULL, NULL),
(8, 'BFPteam', 'BFP', 'joshua', '09123213342', 'BFPteam2@gmail.com', '$2y$12$CaC7PzVZ.86FCDnSfVki4eVGx8dkm5no3RGh38xz/tWWbFBhqAADO', 'Dispatched', 60, '2026-09-29 18:31:07', 14.6498648, 120.9839450, 80.00, '2026-10-17 11:40:06'),
(9, 'MCATteam', 'MCAT', 'archie', '09123421312', 'MCATteam@gmail.com', '$2y$12$SVO.OID8.Blobezj/FV1UOiouMMwhg9R9ROtZX68X4AnndywZ/7mK', 'Available', NULL, '2026-09-29 18:33:37', 14.6657825, 120.9628622, 11.29, '2026-10-15 10:28:20'),
(10, 'Fireforce', 'BFP', 'Ms.Josie', '09319627029', 'josie@gmail.com', '$2y$12$boDXjH85denry39icMMyK.5H4PMhu.6x.yP5yA1DFAZFWnGwHo652', 'Available', NULL, '2026-09-29 18:50:44', NULL, NULL, NULL, NULL),
(11, 'PSTMO team', 'PSTMO', 'justine', '09213412321', 'PSTMOteam@gmail.com', '$2y$12$qV7VwKbkXV7MoOEYPkfcr.Ibds3iiscOzYxeIjPVsATuSeujHikri', 'Available', NULL, '2026-09-30 22:53:38', NULL, NULL, NULL, NULL),
(12, 'MCAT', 'MCAT', 'Carlo Simbugan', '09123125712', 'Joshua22@gmail.com', '$2y$12$L9Bm.PKosNPmaxXAEzJ7VuFuHgxVJLOrkpajr.1ig2lyUg3GmNMRq', 'Dispatched', 46, '2026-10-01 11:20:48', NULL, NULL, NULL, NULL),
(13, 'PSTMO', 'PSTMO', 'John Palomar', '09572846221', 'John@gmail.com', '$2y$12$0qxYLAgKot0oTBG11.CG3ONNkkG77mC1Kja/QLoDa7EjjQawV43je', 'Available', NULL, '2026-10-02 05:32:40', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_emergency_clusters`
--

CREATE TABLE `tbl_emergency_clusters` (
  `clusterID` int(11) NOT NULL,
  `clusterReference` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `severity` enum('EMERGENCY','CRITICAL') NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `representativeComplaintID` int(11) NOT NULL,
  `dispatchTeamID` int(11) DEFAULT NULL,
  `status` enum('Detected','Verified','Dispatched','On the Way','Arrived','Resolved','Unable to Resolve') NOT NULL DEFAULT 'Detected',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `dispatchedAt` datetime DEFAULT NULL,
  `resolvedAt` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_emergency_clusters`
--

INSERT INTO `tbl_emergency_clusters` (`clusterID`, `clusterReference`, `category`, `severity`, `latitude`, `longitude`, `representativeComplaintID`, `dispatchTeamID`, `status`, `createdAt`, `dispatchedAt`, `resolvedAt`) VALUES
(1, 'EC-20261017-084148-78', 'Fire', 'EMERGENCY', 14.67000000, 120.96700000, 78, 7, 'Dispatched', '2026-10-17 08:41:48', '2026-10-17 08:41:48', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_emergency_cluster_complaints`
--

CREATE TABLE `tbl_emergency_cluster_complaints` (
  `clusterComplaintID` int(11) NOT NULL,
  `clusterID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `isRepresentative` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_emergency_cluster_complaints`
--

INSERT INTO `tbl_emergency_cluster_complaints` (`clusterComplaintID`, `clusterID`, `complaintID`, `isRepresentative`, `createdAt`) VALUES
(1, 1, 78, 1, '2026-10-17 08:41:48'),
(2, 1, 79, 0, '2026-10-17 08:41:48'),
(3, 1, 80, 0, '2026-10-17 08:41:48'),
(4, 1, 81, 0, '2026-10-17 08:41:48'),
(5, 1, 82, 0, '2026-10-17 08:41:48'),
(6, 1, 83, 0, '2026-10-17 08:41:48');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_feedback`
--

CREATE TABLE `tbl_feedback` (
  `feedbackID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `rating` tinyint(1) NOT NULL,
  `comments` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tbl_feedback`
--

INSERT INTO `tbl_feedback` (`feedbackID`, `complaintID`, `rating`, `comments`, `createdAt`) VALUES
(1, 27, 5, 'GGEZ BRUH', '2026-08-21 23:15:44'),
(2, 41, 5, 'ambilis ng response W chat', '2026-08-26 03:40:46'),
(3, 26, 1, 'too slow', '2026-08-29 11:01:22'),
(4, 56, 1, 'salamat, maraming salamat', '2026-10-01 04:28:48'),
(5, 70, 5, NULL, '2026-10-15 01:46:35'),
(6, 71, 5, 'The system is helpful because users can easily send their problems and concerns, and the team will work to fix them. It makes reporting problems easier and helps users find solutions quickly. I hope the system will continue to improve and provide faster and more effective service.', '2026-10-15 03:40:11'),
(7, 72, 5, 'Nice one natulog agad mga kapitbahay ko thanks.', '2026-10-15 03:58:23'),
(8, 74, 5, NULL, '2026-10-15 08:31:44');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_notifications`
--

CREATE TABLE `tbl_notifications` (
  `notificationID` int(11) NOT NULL,
  `citizenID` int(11) NOT NULL,
  `complaintID` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'complaint',
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_notifications`
--

INSERT INTO `tbl_notifications` (`notificationID`, `citizenID`, `complaintID`, `title`, `message`, `type`, `isRead`, `createdAt`) VALUES
(1, 1, 31, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-24 08:22:10'),
(2, 1, 38, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-24 08:48:05'),
(3, 1, 38, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-24 08:51:35'),
(4, 1, 38, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-24 08:51:52'),
(5, 1, 39, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-24 08:53:45'),
(6, 1, 39, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-24 08:53:56'),
(7, 1, 39, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-24 08:53:58'),
(8, 1, 32, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-24 08:57:12'),
(9, 1, 32, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-24 08:57:19'),
(10, 1, 32, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-24 08:57:25'),
(11, 1, 33, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-24 08:59:55'),
(12, 1, 33, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-24 09:02:31'),
(13, 1, 33, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-24 09:02:38'),
(14, 1, 34, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-24 09:05:15'),
(15, 1, 34, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-24 09:05:25'),
(16, 1, 34, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-24 09:05:30'),
(17, 1, 34, 'Complaint Resolved', 'Your complaint #34 has been resolved by the Malabon City Action Team.', 'complaint', 1, '2026-08-24 09:06:35'),
(18, 1, 41, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-25 19:29:06'),
(22, 1, 41, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-25 19:37:59'),
(23, 1, 41, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-25 19:38:26'),
(24, 1, 41, 'Complaint Resolved', 'Your complaint #41 has been resolved by the Malabon City Action Team.', 'complaint', 1, '2026-08-25 19:38:38'),
(30, 1, 42, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-25 19:45:05'),
(31, 1, 42, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-27 19:13:52'),
(32, 1, 42, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-28 04:39:05'),
(33, 1, 42, 'Complaint Resolved', 'Your complaint #42 has been resolved by the Malabon City Action Team.', 'complaint', 1, '2026-08-28 04:39:38'),
(34, 8, 47, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 0, '2026-08-28 04:53:51'),
(35, 8, 47, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-08-28 04:54:19'),
(36, 8, 47, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-08-28 04:58:50'),
(37, 8, 47, 'Complaint Resolved', 'Your complaint #47 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-08-28 04:59:24'),
(38, 12, 49, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-29 03:19:33'),
(39, 12, 49, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-29 03:21:32'),
(40, 12, 49, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-08-29 03:26:00'),
(41, 12, 49, 'Complaint Resolved', 'Your complaint #49 has been resolved by the Malabon City Action Team.', 'complaint', 1, '2026-08-29 03:26:40'),
(42, 1, 35, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'complaint', 1, '2026-08-30 18:37:47'),
(43, 1, 35, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-08-30 18:40:00'),
(44, 1, 35, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-09-02 12:52:48'),
(45, 1, 55, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-15 08:39:09'),
(46, 1, 57, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-15 09:37:55'),
(49, 1, 37, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-23 10:01:27'),
(50, 1, 35, 'Complaint Resolved', 'Your complaint #35 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-09-28 13:14:40'),
(51, 18, 58, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-29 08:08:55'),
(52, 18, 58, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-09-29 08:09:01'),
(53, 1, 55, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-09-29 10:53:32'),
(54, 1, 55, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-09-29 10:53:40'),
(55, 1, 55, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-09-29 10:53:40'),
(56, 1, 37, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-09-29 10:56:41'),
(57, 1, 21, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-29 16:44:18'),
(58, 1, 40, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-29 16:44:35'),
(59, 1, 40, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-09-29 16:44:38'),
(60, 1, 35, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-30 01:21:44'),
(61, 1, 44, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-09-30 01:59:56'),
(62, 1, 55, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-09-30 04:59:54'),
(63, 1, 55, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-09-30 05:00:01'),
(64, 1, 55, 'Complaint Resolved', 'Your complaint #55 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-09-30 05:00:23'),
(67, 10, 62, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-01 09:12:09'),
(68, 10, 62, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-01 09:12:14'),
(69, 18, 59, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-01 11:11:12'),
(70, 16, 60, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-01 11:11:14'),
(71, 16, 60, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-01 11:11:20'),
(72, 16, 60, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-01 11:11:36'),
(73, 16, 60, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-01 11:11:36'),
(74, 16, 60, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-01 11:13:13'),
(75, 16, 63, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-01 11:18:56'),
(76, 16, 63, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-01 11:18:57'),
(77, 16, 63, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-01 11:19:26'),
(78, 16, 63, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-01 11:19:26'),
(79, 16, 63, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-01 11:24:01'),
(80, 11, 56, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-01 11:25:41'),
(81, 11, 56, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-01 11:25:42'),
(82, 11, 56, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-01 11:25:48'),
(83, 11, 56, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-01 11:25:48'),
(84, 11, 56, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-01 11:26:13'),
(85, 11, 56, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-01 11:26:20'),
(86, 11, 56, 'Complaint Resolved', 'Your complaint #56 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-01 11:27:50'),
(87, 1, 43, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-02 03:13:44'),
(88, 1, 43, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-02 03:19:11'),
(89, 1, 44, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-02 03:19:21'),
(90, 18, 59, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-02 03:25:30'),
(91, 9, 65, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-02 03:26:15'),
(92, 1, 45, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-02 04:37:33'),
(93, 1, 46, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-02 05:10:21'),
(94, 1, 46, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-02 05:10:22'),
(95, 1, 45, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-03 03:47:32'),
(96, 1, 46, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-03 04:00:09'),
(97, 1, 46, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-03 04:00:09'),
(98, 1, 46, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-08 08:20:20'),
(99, 16, 63, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-08 08:28:16'),
(100, 16, 63, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-08 08:28:23'),
(101, 16, 63, 'Complaint Resolved', 'Your complaint #63 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-08 08:28:35'),
(103, 10, 62, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-14 01:22:02'),
(104, 18, 59, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-14 01:22:34'),
(105, 10, 61, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-14 01:22:48'),
(106, 10, 61, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-14 01:22:52'),
(107, 11, 64, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-14 01:32:03'),
(108, 9, 65, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-14 01:32:41'),
(109, 1, 31, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-14 01:32:45'),
(110, 11, 64, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-14 01:32:59'),
(111, 11, 64, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-14 01:33:01'),
(112, 6, 66, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 1, '2026-10-14 01:35:21'),
(113, 1, 40, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-14 01:35:50'),
(114, 1, 40, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-14 01:35:50'),
(115, 1, 40, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-14 01:36:45'),
(116, 1, 40, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-14 01:36:50'),
(117, 1, 40, 'Complaint Resolved', 'Your complaint #40 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-14 01:37:10'),
(119, 6, 66, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 1, '2026-10-14 06:35:12'),
(121, 1, 44, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-14 06:35:42'),
(122, 1, 44, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-14 06:35:42'),
(123, 1, 44, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-14 06:36:28'),
(124, 16, 67, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-14 06:50:00'),
(125, 16, 67, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-14 07:08:28'),
(126, 16, 68, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-14 09:25:50'),
(127, 16, 68, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-14 09:25:54'),
(128, 16, 68, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-14 11:40:12'),
(129, 16, 68, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-14 11:40:12'),
(130, 16, 68, 'Complaint Unable to Resolve', 'Your complaint #68 could not be resolved by the Malabon City Action Team. Reason: Safety issue - we can\'t solve this', 'complaint', 0, '2026-10-14 12:38:07'),
(131, 6, 69, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 08:06:48'),
(132, 37, 70, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 1, '2026-10-15 08:07:35'),
(133, 37, 70, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 1, '2026-10-15 08:09:24'),
(134, 37, 70, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 1, '2026-10-15 08:09:55'),
(135, 37, 70, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 1, '2026-10-15 08:09:55'),
(136, 1, 44, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-15 08:12:57'),
(137, 1, 44, 'Complaint Resolved', 'Your complaint #44 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-15 08:19:50'),
(138, 37, 70, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 1, '2026-10-15 08:21:19'),
(139, 37, 70, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 1, '2026-10-15 08:41:13'),
(140, 37, 70, 'Complaint Resolved', 'Your complaint #70 has been resolved by the Malabon City Action Team.', 'complaint', 1, '2026-10-15 08:45:57'),
(141, 38, 71, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 10:14:51'),
(142, 38, 71, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-15 10:18:20'),
(143, 38, 71, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-15 10:18:36'),
(144, 38, 71, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-15 10:18:36'),
(145, 38, 71, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-15 10:20:28'),
(146, 38, 71, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-15 10:23:13'),
(147, 38, 71, 'Complaint Resolved', 'Your complaint #71 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-15 10:25:16'),
(148, 32, 72, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 10:53:12'),
(149, 32, 72, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-15 10:54:12'),
(150, 32, 72, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-15 10:54:25'),
(151, 32, 72, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-15 10:54:25'),
(152, 32, 72, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-15 10:55:09'),
(153, 32, 72, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-15 10:56:11'),
(154, 32, 72, 'Complaint Resolved', 'Your complaint #72 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-15 10:57:38'),
(155, 39, 73, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 14:20:12'),
(156, 39, 73, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-15 14:20:14'),
(157, 39, 73, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-15 14:20:25'),
(158, 39, 73, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-15 14:20:25'),
(159, 39, 73, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-15 14:20:46'),
(160, 28, 74, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 14:54:28'),
(161, 28, 74, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-15 15:18:05'),
(162, 28, 74, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-15 15:18:25'),
(163, 28, 74, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-15 15:18:25'),
(164, 39, 73, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-15 15:23:35'),
(165, 39, 73, 'Complaint Resolved', 'Your complaint #73 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-15 15:28:29'),
(166, 28, 74, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-15 15:29:06'),
(167, 28, 74, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-15 15:29:55'),
(168, 28, 74, 'Complaint Resolved', 'Your complaint #74 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-15 15:30:42'),
(169, 6, 66, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-15 15:31:25'),
(170, 6, 66, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-15 15:31:25'),
(171, 40, 75, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 17:24:50'),
(172, 39, 76, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-15 17:27:42'),
(173, 39, 76, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-15 17:27:45'),
(174, 39, 76, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-15 17:27:49'),
(175, 39, 76, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-15 17:27:49'),
(176, 39, 76, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-15 17:28:02'),
(177, 39, 76, 'Dispatch Team Has Arrived', 'The dispatch team has arrived at the location of your complaint.', 'complaint', 0, '2026-10-15 18:32:38'),
(178, 39, 76, 'Complaint Resolved', 'Your complaint #76 has been resolved by the Malabon City Action Team.', 'complaint', 0, '2026-10-15 18:36:53'),
(179, 39, 77, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-16 13:05:49'),
(180, 39, 77, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-16 13:46:07'),
(181, 39, 77, 'Response Team Dispatched', 'A response team has been dispatched to your complaint and will respond as soon as possible.', 'dispatched', 0, '2026-10-16 13:46:20'),
(182, 39, 77, 'Complaint Accepted', 'Your complaint has been accepted by a dispatch team and is now being handled.', 'dispatched', 0, '2026-10-16 13:46:20'),
(183, 39, 77, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-16 22:14:52'),
(184, 40, 75, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-16 22:15:27'),
(185, 6, 69, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-16 22:16:08'),
(186, 1, 57, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-17 00:33:30'),
(187, 16, 60, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-17 00:33:39'),
(188, 6, 69, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-17 00:34:16'),
(189, 2, 78, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-17 00:38:49'),
(190, 2, 78, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-17 00:40:53'),
(191, 3, 79, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-17 00:40:53'),
(192, 4, 80, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-17 00:40:53'),
(193, 5, 81, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-17 00:40:53'),
(194, 6, 82, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-17 00:40:53'),
(195, 2, 83, 'Complaint Verified', 'Your complaint has been verified by the administration and is now being processed.', 'complaint', 0, '2026-10-17 00:40:53'),
(196, 2, 78, 'Response Team Dispatched', 'A response team has been dispatched to an emergency incident affecting your reported area. Your complaint is now being handled.', 'dispatched', 0, '2026-10-17 00:41:48'),
(197, 2, 78, 'Complaint Accepted', 'Your complaint has been accepted by the response team and is now part of an active emergency response.', 'dispatched', 0, '2026-10-17 00:41:48'),
(198, 3, 79, 'Response Team Dispatched', 'A response team has been dispatched to an emergency incident affecting your reported area. Your complaint is now being handled.', 'dispatched', 0, '2026-10-17 00:41:48'),
(199, 3, 79, 'Complaint Accepted', 'Your complaint has been accepted by the response team and is now part of an active emergency response.', 'dispatched', 0, '2026-10-17 00:41:48'),
(200, 4, 80, 'Response Team Dispatched', 'A response team has been dispatched to an emergency incident affecting your reported area. Your complaint is now being handled.', 'dispatched', 0, '2026-10-17 00:41:48'),
(201, 4, 80, 'Complaint Accepted', 'Your complaint has been accepted by the response team and is now part of an active emergency response.', 'dispatched', 0, '2026-10-17 00:41:48'),
(202, 5, 81, 'Response Team Dispatched', 'A response team has been dispatched to an emergency incident affecting your reported area. Your complaint is now being handled.', 'dispatched', 0, '2026-10-17 00:41:48'),
(203, 5, 81, 'Complaint Accepted', 'Your complaint has been accepted by the response team and is now part of an active emergency response.', 'dispatched', 0, '2026-10-17 00:41:48'),
(204, 6, 82, 'Response Team Dispatched', 'A response team has been dispatched to an emergency incident affecting your reported area. Your complaint is now being handled.', 'dispatched', 0, '2026-10-17 00:41:48'),
(205, 6, 82, 'Complaint Accepted', 'Your complaint has been accepted by the response team and is now part of an active emergency response.', 'dispatched', 0, '2026-10-17 00:41:48'),
(206, 2, 83, 'Response Team Dispatched', 'A response team has been dispatched to an emergency incident affecting your reported area. Your complaint is now being handled.', 'dispatched', 0, '2026-10-17 00:41:48'),
(207, 2, 83, 'Complaint Accepted', 'Your complaint has been accepted by the response team and is now part of an active emergency response.', 'dispatched', 0, '2026-10-17 00:41:48'),
(208, 16, 60, 'Dispatch Team Is On the Way', 'The dispatch team assigned to your complaint has started responding and is now on the way.', 'complaint', 0, '2026-10-17 03:39:22'),
(209, 1, 84, 'Complaint Viewed', 'Your complaint has been viewed by the administration.', 'viewed', 0, '2026-10-19 04:37:33'),
(210, 1, 37, 'Complaint Rejected', 'Your complaint has been rejected by the administration. Please check your complaint details or contact the appropriate department for further assistance.', 'complaint', 0, '2026-10-19 04:43:52');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_operational_logs`
--

CREATE TABLE `tbl_operational_logs` (
  `logID` int(11) NOT NULL,
  `complaintID` int(11) DEFAULT NULL,
  `actorType` enum('Citizen','System User','Dispatch Team','System') NOT NULL,
  `actorID` int(11) DEFAULT NULL,
  `actorName` varchar(150) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `oldValue` text DEFAULT NULL,
  `newValue` text DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_operational_logs`
--

INSERT INTO `tbl_operational_logs` (`logID`, `complaintID`, `actorType`, `actorID`, `actorName`, `action`, `description`, `oldValue`, `newValue`, `ipAddress`, `createdAt`) VALUES
(1, NULL, '', 1, 'admin@gmail.com', 'LOGIN', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 03:09:00'),
(2, NULL, 'System', 1, 'admin@gmail.com', 'VERIFICATION_APPROVED', 'Citizen #2 (Romeo Juntila) verification was approved.', 'Rejected', 'Verified', '::1', '2026-08-26 03:16:34'),
(3, NULL, '', 6, 'diwata@gmail.com', 'LOGIN', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-08-26 03:32:27'),
(4, 41, 'Dispatch Team', 6, 'teamba', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '::1', '2026-08-26 03:37:59'),
(5, 41, 'Dispatch Team', 6, 'teamba', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '::1', '2026-08-26 03:38:26'),
(6, 41, '', 6, 'teamba', 'COMPLAINT_RESOLVED', 'Dispatch team resolved complaint #41. Resolution note: gg ez', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '::1', '2026-08-26 03:38:38'),
(7, NULL, 'Citizen', 1, 'roms@gmail.com', 'LOGIN', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 03:39:19'),
(8, 45, 'Citizen', 1, 'roms@gmail.com', 'COMPLAINT_SUBMITTED', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '::1', '2026-08-26 03:40:00'),
(9, 41, 'Citizen', 1, 'roms@gmail.com', 'FEEDBACK_SUBMITTED', 'Citizen submitted feedback for complaint #41. Rating: 5/5.', NULL, 'Rating: 5/5', '::1', '2026-08-26 03:40:46'),
(10, NULL, 'System', 5, 'tyronestark01234@gmail.com', 'Password Reset', 'Password was successfully reset for tyronestark01234@gmail.com.', NULL, 'Password Reset', '::1', '2026-08-26 03:42:20'),
(11, 42, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #42 status from \'Pending\' to \'Verified\'.', 'Pending', 'Verified', '::1', '2026-08-26 03:43:00'),
(12, 42, 'System', NULL, 'Dispatch Team #6', 'Complaint Dispatched', 'Complaint #42 was accepted and assigned to dispatch team #6.', NULL, '6', '::1', '2026-08-26 03:45:05'),
(13, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 08:30:31'),
(14, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 09:23:06'),
(15, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 17:59:17'),
(16, NULL, 'Citizen', 4, 'romeojuntila012@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 18:11:24'),
(17, NULL, 'Citizen', 5, 'Hinata shoyo', 'Citizen Registration', 'New citizen account registered with email Juntila01@gmail.com.', NULL, 'Registered', '::1', '2026-08-26 18:15:36'),
(18, NULL, 'Citizen', 5, 'Juntila01@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 18:15:47'),
(19, NULL, 'Citizen', 5, 'Juntila01@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', '', 'Pending', '::1', '2026-08-26 18:17:11'),
(20, NULL, 'Citizen', 5, 'Juntila01@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 18:18:42'),
(21, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 18:34:50'),
(22, NULL, '', 4, 'mark@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 18:35:11'),
(23, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 18:36:22'),
(24, NULL, '', 4, 'mark@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 18:38:39'),
(25, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-08-26 18:48:05'),
(26, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-08-26 19:11:56'),
(27, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 11:37:06'),
(28, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 11:39:09'),
(29, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 12:09:37'),
(30, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 12:13:40'),
(31, 42, 'Dispatch Team', 6, 'teamba', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.255', '2026-08-27 12:13:52'),
(32, NULL, 'System', 5, 'tyronestark01234@gmail.com', 'Password Reset', 'Password was successfully reset for tyronestark01234@gmail.com.', NULL, 'Password Reset', '136.158.41.255', '2026-08-27 12:15:19'),
(33, NULL, 'Citizen', 6, 'Gene Batiancila', 'Citizen Registration', 'New citizen account registered with email geneauriabatiancila@gmail.com.', NULL, 'Registered', '136.158.42.170', '2026-08-27 21:21:12'),
(34, NULL, 'Citizen', 7, 'Joshua Vega', 'Citizen Registration', 'New citizen account registered with email Josh@gmail.com.', NULL, 'Registered', '112.203.34.162', '2026-08-27 21:21:16'),
(35, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.42.170', '2026-08-27 21:21:22'),
(36, NULL, 'Citizen', 7, 'Josh@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:21:36'),
(37, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.42.170', '2026-08-27 21:22:14'),
(38, NULL, 'Citizen', 7, 'Josh@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', '', 'Pending', '112.203.34.162', '2026-08-27 21:22:26'),
(39, NULL, 'Citizen', 7, 'Josh@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:24:07'),
(40, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:30:41'),
(41, NULL, 'Citizen', 8, 'Joshua Palada', 'Citizen Registration', 'New citizen account registered with email paladajoshua05@gmail.com.', NULL, 'Registered', '112.203.55.98', '2026-08-27 21:34:57'),
(42, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:35:30'),
(43, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:36:33'),
(44, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #8 (Joshua Palada) verification was approved.', '', 'Verified', '136.158.41.255', '2026-08-27 21:37:09'),
(45, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:37:44'),
(46, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:38:27'),
(47, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:38:55'),
(48, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', 'Verified', 'Pending', '112.203.34.162', '2026-08-27 21:38:58'),
(49, 42, 'Dispatch Team', 6, 'teamba', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.255', '2026-08-27 21:39:05'),
(50, 42, '', 6, 'teamba', 'Complaint Resolved', 'Dispatch team resolved complaint #42. Resolution note: Iniwan ka na', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.255', '2026-08-27 21:39:38'),
(51, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:41:38'),
(52, NULL, 'Citizen', 9, 'ArchieMasallo', 'Citizen Registration', 'New citizen account registered with email archiemasallo159@gmail.com.', NULL, 'Registered', '136.158.40.117', '2026-08-27 21:41:47'),
(53, NULL, 'Citizen', 10, 'Cabubas Kenny O.', 'Citizen Registration', 'New citizen account registered with email cabubasjenny31@gmail.com.', NULL, 'Registered', '112.203.133.155', '2026-08-27 21:43:13'),
(54, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:43:26'),
(55, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.117', '2026-08-27 21:43:33'),
(56, NULL, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.133.155', '2026-08-27 21:43:41'),
(57, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:44:05'),
(58, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #8 (Joshua Palada) verification was approved.', 'Pending', 'Verified', '136.158.41.255', '2026-08-27 21:44:24'),
(59, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #9 (ArchieMasallo) verification was approved.', '', 'Verified', '136.158.41.255', '2026-08-27 21:44:28'),
(60, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #10 (Cabubas Kenny O.) verification was approved.', '', 'Verified', '136.158.41.255', '2026-08-27 21:44:34'),
(61, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.42.170', '2026-08-27 21:46:49'),
(62, NULL, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', 'Verified', 'Pending', '112.203.133.155', '2026-08-27 21:47:17'),
(63, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:47:24'),
(64, 46, 'Citizen', 1, 'roms@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.41.255', '2026-08-27 21:47:54'),
(65, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.42.170', '2026-08-27 21:48:35'),
(66, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:48:37'),
(67, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 21:48:57'),
(68, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #10 (Cabubas Kenny O.) verification was approved.', 'Pending', 'Verified', '136.158.41.255', '2026-08-27 21:49:08'),
(69, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #6 (Gene Batiancila) verification was approved.', '', 'Verified', '136.158.41.255', '2026-08-27 21:49:28'),
(70, 47, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Flood | Urgency: NORMAL', '112.203.34.162', '2026-08-27 21:50:55'),
(71, 47, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #47 status from \'Pending\' to \'Verified\'.', 'Pending', 'Verified', '136.158.41.255', '2026-08-27 21:53:49'),
(72, 47, 'System', NULL, 'Dispatch Team #6', 'Complaint Dispatched', 'Complaint #47 was accepted and assigned to dispatch team #6.', NULL, '6', '136.158.41.255', '2026-08-27 21:53:51'),
(73, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 21:54:09'),
(74, 47, 'Dispatch Team', 6, 'teamba', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.255', '2026-08-27 21:54:19'),
(75, 47, 'Dispatch Team', 6, 'teamba', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.255', '2026-08-27 21:58:50'),
(76, 47, '', 6, 'teamba', 'Complaint Resolved', 'Dispatch team resolved complaint #47. Resolution note: Gg ez no baha, ELBAPH ON TOP', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.255', '2026-08-27 21:59:24'),
(77, NULL, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.34.162', '2026-08-27 22:03:05'),
(78, 48, 'Citizen', 8, 'paladajoshua05@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '112.203.34.162', '2026-08-27 22:04:39'),
(79, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.42.170', '2026-08-27 22:27:32'),
(80, NULL, 'Citizen', 11, 'Justine B. Hemar', 'Citizen Registration', 'New citizen account registered with email justinebergavino5@gmail.com.', NULL, 'Registered', '136.158.40.53', '2026-08-27 22:36:37'),
(81, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.53', '2026-08-27 22:37:23'),
(82, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.53', '2026-08-27 22:39:07'),
(83, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 23:05:49'),
(84, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #11 (Justine B. Hemar) verification was approved.', '', 'Verified', '136.158.41.255', '2026-08-27 23:05:58'),
(85, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-27 23:39:04'),
(86, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.53', '2026-08-28 03:19:27'),
(87, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.53', '2026-08-28 03:19:28'),
(88, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 04:21:53'),
(89, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 04:23:59'),
(90, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 04:24:50'),
(91, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.117', '2026-08-28 05:15:53'),
(92, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.117', '2026-08-28 05:24:28'),
(93, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 08:08:35'),
(94, NULL, '', 4, 'mark@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 08:08:57'),
(95, NULL, 'Citizen', 12, 'George Jordan', 'Citizen Registration', 'New citizen account registered with email george23ph@gmail.com.', NULL, 'Registered', '175.176.37.137', '2026-08-28 19:24:28'),
(96, NULL, 'Citizen', 12, 'george23ph@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.37.137', '2026-08-28 19:24:45'),
(97, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 19:32:01'),
(98, NULL, 'Citizen', 12, 'george23ph@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.37.137', '2026-08-28 19:46:44'),
(99, NULL, 'Citizen', 12, 'george23ph@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', '', 'Pending', '175.176.37.137', '2026-08-28 19:47:02'),
(100, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #12 (George Jordan) verification was approved.', 'Pending', 'Verified', '136.158.41.255', '2026-08-28 20:01:12'),
(101, 49, 'Citizen', 12, 'george23ph@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.37.137', '2026-08-28 20:09:50'),
(102, 49, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #49 status from \'Pending\' to \'Verified\'.', 'Pending', 'Verified', '136.158.41.255', '2026-08-28 20:19:31'),
(103, 49, 'System', NULL, 'Dispatch Team #6', 'Complaint Dispatched', 'Complaint #49 was accepted and assigned to dispatch team #6.', NULL, '6', '136.158.41.255', '2026-08-28 20:19:33'),
(104, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 20:21:17'),
(105, 49, 'Dispatch Team', 6, 'teamba', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.255', '2026-08-28 20:21:32'),
(106, 49, 'Dispatch Team', 6, 'teamba', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.255', '2026-08-28 20:26:00'),
(107, 49, '', 6, 'teamba', 'Complaint Resolved', 'Dispatch team resolved complaint #49. Resolution note: Ez boi, walang bitaw yung sonog', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.255', '2026-08-28 20:26:40'),
(108, 50, 'Citizen', 12, 'george23ph@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.37.137', '2026-08-28 20:33:53'),
(109, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 20:45:24'),
(110, 51, 'Citizen', 12, 'george23ph@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.37.137', '2026-08-28 20:48:55'),
(111, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 20:51:12'),
(112, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 20:55:05'),
(113, 52, 'Citizen', 12, 'george23ph@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.37.137', '2026-08-28 21:05:23'),
(114, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 21:07:16'),
(115, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-28 21:07:53'),
(116, 53, 'Citizen', 12, 'george23ph@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.37.137', '2026-08-28 21:13:07'),
(117, 54, 'Citizen', 12, 'george23ph@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.37.137', '2026-08-28 21:16:57'),
(118, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.117', '2026-08-28 21:55:56'),
(119, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.53', '2026-08-28 22:14:11'),
(120, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-29 10:56:45'),
(121, 26, 'Citizen', 1, 'roms@gmail.com', 'Feedback Submitted', 'Citizen submitted feedback for complaint #26. Rating: 1/5.', NULL, 'Rating: 1/5', '136.158.41.255', '2026-08-29 11:01:22'),
(122, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-29 11:01:51'),
(123, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-30 11:32:25'),
(124, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-30 11:37:01'),
(125, 35, 'System', NULL, 'Dispatch Team #6', 'Complaint Dispatched', 'Complaint #35 was accepted and assigned to dispatch team #6.', NULL, '6', '136.158.41.255', '2026-08-30 11:37:47'),
(126, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-30 11:38:11'),
(127, 35, 'Dispatch Team', 6, 'teamba', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.255', '2026-08-30 11:40:00'),
(128, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-30 11:40:27'),
(129, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-31 09:41:25'),
(130, NULL, 'Citizen', 13, 'Andrew yea', 'Citizen Registration', 'New citizen account registered with email danaldwaynematados@gmail.com.', NULL, 'Registered', '136.158.41.255', '2026-08-31 09:42:16'),
(131, NULL, 'Citizen', 13, 'danaldwaynematados@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-31 09:42:46'),
(132, NULL, 'Citizen', 13, 'danaldwaynematados@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-31 09:42:46'),
(133, NULL, 'Citizen', 13, 'danaldwaynematados@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', '', 'Pending', '136.158.41.255', '2026-08-31 09:44:25'),
(134, NULL, 'Citizen', 13, 'danaldwaynematados@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a Barangay Clearance for verification.', 'Pending', 'Pending', '136.158.41.255', '2026-08-31 09:44:32'),
(135, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #13 (Andrew yea) verification was approved.', 'Pending', 'Verified', '136.158.41.255', '2026-08-31 09:44:49'),
(136, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #13 (Andrew yea) verification was approved.', 'Verified', 'Verified', '136.158.41.255', '2026-08-31 09:45:59'),
(137, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-31 09:47:17'),
(138, NULL, 'Citizen', 13, 'danaldwaynematados@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-08-31 09:48:10'),
(139, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 08:23:26'),
(140, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 08:41:27'),
(141, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 08:43:46'),
(142, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Password Reset', 'Password was successfully reset for justinebergavino5@gmail.com.', NULL, 'Password Reset', '136.158.40.191', '2026-09-01 08:48:26'),
(143, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-01 08:48:46'),
(144, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 08:54:03'),
(145, NULL, 'Citizen', 13, 'danaldwaynematados@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.155', '2026-09-01 08:56:47'),
(146, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 09:12:47'),
(147, 55, 'Citizen', 1, 'roms@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '136.158.41.255', '2026-09-01 09:17:11'),
(148, 56, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.40.191', '2026-09-01 10:55:49'),
(149, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 11:00:41'),
(150, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 11:01:16'),
(151, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-01 11:02:25'),
(152, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-02 05:09:13'),
(153, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-02 05:10:08'),
(154, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-02 05:40:26'),
(155, 57, 'Citizen', 1, 'roms@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '136.158.41.255', '2026-09-02 05:41:11'),
(156, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-02 05:42:23'),
(157, 57, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #57 status from \'Pending\' to \'Verified\'.', 'Pending', 'Verified', '136.158.41.255', '2026-09-02 05:45:16'),
(158, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-02 05:52:11'),
(159, 35, 'Dispatch Team', 6, 'teamba', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.255', '2026-09-02 05:52:48'),
(160, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-06 22:53:12'),
(161, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-06 22:54:18'),
(162, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-09 10:27:16'),
(163, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-09 10:27:29'),
(164, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-09 10:43:38'),
(165, NULL, 'Citizen', 14, 'luna', 'Citizen Registration', 'New citizen account registered with email luna@gmail.com.', NULL, 'Registered', '49.144.149.85', '2026-09-09 10:56:35'),
(166, NULL, 'Citizen', 14, 'luna@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '49.144.149.85', '2026-09-09 10:56:46'),
(167, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-10 06:50:02'),
(168, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-11 00:17:30'),
(169, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-11 00:26:23'),
(170, NULL, 'Citizen', 14, 'luna@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '49.144.149.85', '2026-09-11 00:43:53'),
(171, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-11 00:45:22'),
(172, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-11 00:46:45'),
(173, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-11 02:55:58'),
(174, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-14 23:59:00'),
(175, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-15 00:50:42'),
(176, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-15 00:53:44'),
(177, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-16 23:18:42'),
(178, NULL, 'Citizen', 15, 'solid solid', 'Citizen Registration', 'New citizen account registered with email solid@gmail.com.', NULL, 'Registered', '136.158.41.255', '2026-09-16 23:19:22'),
(179, NULL, 'Citizen', 15, 'solid@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-16 23:19:39'),
(180, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-16 23:40:01'),
(181, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-16 23:54:01'),
(182, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-17 01:03:13'),
(183, NULL, 'Citizen', 16, 'Joshua Vega', 'Citizen Registration', 'New citizen account registered with email Joshua@gmail.com.', NULL, 'Registered', '136.158.40.191', '2026-09-17 01:44:48'),
(184, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-17 01:45:05'),
(185, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-17 02:33:44'),
(186, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Password Reset', 'Password was successfully reset for geneauriabatiancila@gmail.com.', NULL, 'Password Reset', '136.158.43.66', '2026-09-17 07:49:07'),
(187, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.43.66', '2026-09-17 07:49:34'),
(188, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.24.47', '2026-09-17 21:35:58'),
(189, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 18:05:06'),
(190, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 18:19:47'),
(191, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 18:21:51'),
(192, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Password Reset', 'Password was successfully reset for justinebergavino5@gmail.com.', NULL, 'Password Reset', '136.158.40.191', '2026-09-18 18:31:50'),
(193, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 18:32:57'),
(194, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 18:35:47'),
(195, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 19:06:34'),
(196, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 19:09:28'),
(197, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-18 19:18:20'),
(198, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-20 18:25:51'),
(199, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.133.132', '2026-09-20 22:46:53'),
(200, NULL, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.133.132', '2026-09-20 22:55:08'),
(201, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.133.132', '2026-09-20 22:58:18'),
(202, NULL, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.133.132', '2026-09-20 23:02:46'),
(203, NULL, 'Citizen', 17, 'Tyrone Stark', 'Citizen Google Registration', 'New citizen account registered using Google with email tyronestark01@gmail.com.', NULL, 'Registered', '136.158.41.255', '2026-09-21 10:44:17'),
(204, NULL, 'Citizen', 18, 'Tyrone Stark', 'Citizen Google Registration', 'New citizen account registered using Google with email tyronestark01234@gmail.com.', NULL, 'Registered', '136.158.41.255', '2026-09-21 10:44:51'),
(205, NULL, 'Citizen', 18, 'tyronestark01234@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.255', '2026-09-21 10:50:56'),
(206, NULL, 'Citizen', 19, 'Juntila Analiza', 'Citizen Google Registration', 'New citizen account registered using Google with email analizajuntila40@gmail.com.', NULL, 'Registered', '136.158.41.255', '2026-09-21 10:51:46'),
(207, NULL, 'Citizen', 18, 'tyronestark01234@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.255', '2026-09-21 10:55:08'),
(208, NULL, 'Citizen', 20, 'Kenny Cabubas', 'Citizen Registration', 'New citizen account registered with email cabubaskenny738@gmail.com.', NULL, 'Registered', '112.203.133.132', '2026-09-21 13:27:18'),
(209, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-21 21:06:47'),
(210, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-21 21:07:10'),
(211, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-21 21:40:27'),
(212, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-21 21:41:37'),
(213, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-21 21:43:29'),
(214, NULL, 'Citizen', 21, 'mixx lam', 'Citizen Google Registration', 'New citizen account registered using Google with email mixxlam69@gmail.com.', NULL, 'Registered', '136.158.40.191', '2026-09-22 01:26:37'),
(215, NULL, 'Citizen', 21, 'mixxlam69@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.40.191', '2026-09-22 01:27:05'),
(216, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-22 23:04:23'),
(217, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-23 00:52:18'),
(218, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-23 02:28:27'),
(219, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-23 02:35:03'),
(220, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-23 02:59:02'),
(221, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-23 03:01:13'),
(222, NULL, 'Citizen', 18, 'tyronestark01234@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.255', '2026-09-23 03:06:23'),
(223, 58, 'Citizen', 18, 'tyronestark01234@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: NORMAL', '136.158.41.255', '2026-09-23 03:30:32'),
(224, 59, 'Citizen', 18, 'tyronestark01234@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '136.158.41.255', '2026-09-23 03:37:40'),
(225, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-23 20:30:56'),
(226, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.42.25', '2026-09-23 20:48:12'),
(227, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.47.95', '2026-09-23 20:50:11'),
(228, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', '', 'Pending', '112.203.47.95', '2026-09-23 20:51:15'),
(229, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '112.203.47.95', '2026-09-23 20:51:20'),
(230, 60, 'Citizen', 16, 'Joshua@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '112.203.47.95', '2026-09-23 20:52:26'),
(231, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-25 04:05:41'),
(232, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-25 04:09:27'),
(233, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-25 04:12:08'),
(234, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-25 04:12:30'),
(235, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-25 04:13:48'),
(236, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-25 04:14:20'),
(237, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-25 04:15:35'),
(238, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-25 04:38:25'),
(239, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-25 04:39:53'),
(240, NULL, 'System', 3, 'awit@gmail.com', 'Verification Approved', 'Citizen #16 (Joshua Vega) verification was approved.', 'Pending', 'Verified', '112.203.46.166', '2026-09-25 22:29:58'),
(241, NULL, 'Citizen', 22, 'Joshua Palada', 'Citizen Registration', 'New citizen account registered with email Joshua22@gmail.com.', NULL, 'Registered', '112.203.46.166', '2026-09-25 22:35:23'),
(242, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-25 22:35:50'),
(243, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Unverified', 'Pending', '112.203.46.166', '2026-09-25 22:36:30'),
(244, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '112.203.46.166', '2026-09-25 22:36:32'),
(245, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '112.203.46.166', '2026-09-25 22:36:34'),
(246, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '112.203.46.166', '2026-09-25 22:36:35'),
(247, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '112.203.46.166', '2026-09-25 22:36:37'),
(248, NULL, 'Citizen', 22, 'Joshua22@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '112.203.46.166', '2026-09-25 22:36:38'),
(249, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-25 22:40:05'),
(250, NULL, 'Citizen', 23, 'Palada Joshua', 'Citizen Registration', 'New citizen account registered with email Joshua331@gmail.com.', NULL, 'Registered', '112.203.46.166', '2026-09-25 22:43:45'),
(251, NULL, 'Citizen', 23, 'Joshua331@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-25 22:44:13'),
(252, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-25 22:47:59'),
(253, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.133.132', '2026-09-26 00:44:09'),
(254, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-28 06:12:49'),
(255, 35, '', 6, 'teamba', 'Complaint Resolved', 'Dispatch team resolved complaint #35. Resolution note: we resolve the issue', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '112.203.46.166', '2026-09-28 06:14:40'),
(256, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-28 06:19:00'),
(257, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-28 06:19:33'),
(258, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-09-28 06:31:26'),
(259, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 00:50:54'),
(260, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 00:51:05'),
(261, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 00:51:39'),
(262, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 00:58:31'),
(263, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 01:06:53'),
(264, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 01:08:17'),
(265, 58, '', 3, 'awit@gmail.com', 'Update Complaint Status', 'System user changed complaint #58 status from \'Pending\' to \'Verified\'. Department: BFP.', 'Pending', 'Verified', '136.158.40.191', '2026-09-29 01:09:01'),
(266, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 01:13:18'),
(267, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 03:48:13'),
(268, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 03:53:11'),
(269, 55, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #55 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-09-29 03:53:32'),
(270, 55, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #55 (FIRE, HIGH) to dispatch team #6 (BFP).', NULL, '6', '136.158.40.191', '2026-09-29 03:53:40'),
(271, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 03:54:44'),
(272, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 03:56:29'),
(273, 37, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-09-29 03:56:41'),
(274, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 04:11:55'),
(275, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 08:24:23'),
(276, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 08:25:05'),
(277, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 09:42:23'),
(278, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 09:43:31'),
(279, 40, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #40 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-09-29 09:44:38'),
(280, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 09:53:13'),
(281, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-29 11:07:07'),
(282, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-29 11:22:58'),
(283, NULL, '', 1, 'admin@gmail.com', 'Created Dispatch Team', 'Created dispatch team #8 (BFPteam) under BFP.', NULL, NULL, '136.158.41.255', '2026-09-29 11:31:07'),
(284, NULL, '', 1, 'admin@gmail.com', 'Created Dispatch Team', 'Created dispatch team #9 (MCATteam) under MCAT.', NULL, NULL, '136.158.41.255', '2026-09-29 11:33:37'),
(285, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 11:42:16'),
(286, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 11:46:51'),
(287, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 11:49:09'),
(288, NULL, '', 3, 'awit@gmail.com', 'Created Dispatch Team', 'Created dispatch team #10 (Fireforce) under BFP.', NULL, NULL, '136.158.40.191', '2026-09-29 11:50:44'),
(289, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 18:02:59'),
(290, NULL, '', 1, 'admin@gmail.com', 'Created System User', 'Created system user \'Edward Gonzaga\' (edward@gmail.com) with role \'staff\' in department \'MCAT\'.', NULL, NULL, '136.158.40.191', '2026-09-29 18:06:32'),
(291, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 18:07:27'),
(292, 57, '', 3, 'awit@gmail.com', 'Update Complaint Status', 'System user changed complaint #57 status from \'Verified\' to \'Verified\'. Department: BFP.', 'Verified', 'Verified', '136.158.40.191', '2026-09-29 18:32:21'),
(293, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 18:35:28'),
(294, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 18:43:34'),
(295, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 18:45:55'),
(296, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 21:54:36'),
(297, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 21:58:57'),
(298, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 21:59:41'),
(299, 55, 'Dispatch Team', 6, 'teamba', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.40.191', '2026-09-29 21:59:54'),
(300, 55, 'Dispatch Team', 6, 'teamba', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.40.191', '2026-09-29 22:00:01'),
(301, 55, '', 6, 'teamba', 'Complaint Resolved', 'Dispatch team resolved complaint #55. Resolution note: we complete the mission', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.40.191', '2026-09-29 22:00:23'),
(302, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 22:00:43'),
(303, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-29 22:06:48'),
(304, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-30 06:20:52');
INSERT INTO `tbl_operational_logs` (`logID`, `complaintID`, `actorType`, `actorID`, `actorName`, `action`, `description`, `oldValue`, `newValue`, `ipAddress`, `createdAt`) VALUES
(305, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-30 06:20:54'),
(306, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-30 06:21:15'),
(307, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-30 09:13:10'),
(308, NULL, '', 4, 'mark@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-30 09:14:38'),
(309, NULL, '', 4, 'mark@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-30 15:22:35'),
(310, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-09-30 15:32:30'),
(311, NULL, '', 1, 'admin@gmail.com', 'Created System User', 'Created system user \'sugarcream\' (sugar@gmail.com) with role \'staff\' in department \'MCAT\'.', NULL, NULL, '136.158.41.255', '2026-09-30 15:33:16'),
(312, NULL, '', 1, 'admin@gmail.com', 'Created System User', 'Created system user \'creamsugar\' (cream@gmail.com) with role \'admin\' in department \'IT\'.', NULL, NULL, '136.158.41.255', '2026-09-30 15:49:07'),
(313, NULL, '', 1, 'admin@gmail.com', 'Created Dispatch Team', 'Created dispatch team #11 (PSTMO team) under PSTMO.', NULL, NULL, '136.158.41.255', '2026-09-30 15:53:38'),
(314, NULL, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-09-30 23:50:32'),
(315, NULL, '', 3, 'awit@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 01:15:28'),
(316, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 01:18:17'),
(317, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 01:23:42'),
(318, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 01:25:46'),
(319, NULL, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 01:38:51'),
(320, 61, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.40.191', '2026-10-01 01:39:46'),
(321, 62, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '136.158.40.191', '2026-10-01 01:40:35'),
(322, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 02:05:07'),
(323, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-10-01 02:12:14'),
(324, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.40.191', '2026-10-01 02:12:16'),
(325, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.40.191', '2026-10-01 02:12:18'),
(326, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.40.191', '2026-10-01 02:12:19'),
(327, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.40.191', '2026-10-01 02:12:19'),
(328, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:09:27'),
(329, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:10:40'),
(330, 60, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #60 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-10-01 04:11:20'),
(331, 60, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #60 (FIRE, HIGH) to dispatch team #8 (BFP).', NULL, '8', '136.158.40.191', '2026-10-01 04:11:36'),
(332, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:11:56'),
(333, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:12:07'),
(334, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:12:31'),
(335, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:12:48'),
(336, 60, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #60 status from \'In Progress\' to \'Verified\'. Department: IT.', 'In Progress', 'Verified', '136.158.40.191', '2026-10-01 04:13:13'),
(337, 60, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #60 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.40.191', '2026-10-01 04:13:49'),
(338, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:16:24'),
(339, 63, 'Citizen', 16, 'Joshua@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.40.191', '2026-10-01 04:17:41'),
(340, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:18:10'),
(341, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:18:32'),
(342, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-10-01 04:18:57'),
(343, 63, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #63 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '136.158.40.191', '2026-10-01 04:19:26'),
(344, NULL, '', 1, 'admin@gmail.com', 'Created Dispatch Team', 'Created dispatch team #12 (MCAT) under MCAT.', NULL, NULL, '136.158.40.191', '2026-10-01 04:20:48'),
(345, NULL, '', 12, 'Joshua22@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:21:00'),
(346, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.191', '2026-10-01 04:21:31'),
(347, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'In Progress\' to \'Verified\'. Department: IT.', 'In Progress', 'Verified', '136.158.40.191', '2026-10-01 04:24:01'),
(348, 56, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #56 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.40.191', '2026-10-01 04:25:42'),
(349, 56, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #56 (OBSTRUCTION, NORMAL) to dispatch team #12 (MCAT).', NULL, '12', '136.158.40.191', '2026-10-01 04:25:48'),
(350, 56, 'Dispatch Team', 12, 'MCAT', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.40.191', '2026-10-01 04:26:13'),
(351, 56, 'Dispatch Team', 12, 'MCAT', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.40.191', '2026-10-01 04:26:20'),
(352, 56, '', 12, 'MCAT', 'ASSISTANCE_REQUESTED', 'Dispatch team requested assistance for complaint #56. Reason: Safety concern - complete resolved', NULL, 'Assistance Requested', '136.158.40.191', '2026-10-01 04:26:46'),
(353, 56, '', 12, 'MCAT', 'Complaint Resolved', 'Dispatch team resolved complaint #56. Resolution note: we already fixed the problem', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.40.191', '2026-10-01 04:27:50'),
(354, 56, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Feedback Submitted', 'Citizen submitted feedback for complaint #56. Rating: 1/5.', NULL, 'Rating: 1/5', '136.158.40.191', '2026-10-01 04:28:48'),
(355, 64, 'Citizen', 11, 'justinebergavino5@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.40.191', '2026-10-01 04:29:31'),
(356, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:05:47'),
(357, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:11:44'),
(358, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:12:28'),
(359, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:14:50'),
(360, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:20:42'),
(361, NULL, '', 1, 'admin@gmail.com', 'Created System User', 'Created system user \'Rico Belmonte\' (rico@gmail.com) with role \'admin\' in department \'MCAT\'.', NULL, NULL, '112.203.46.166', '2026-10-01 19:21:51'),
(362, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:24:52'),
(363, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:27:23'),
(364, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 19:29:08'),
(365, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:12:31'),
(366, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:12:31'),
(367, NULL, '', 11, 'rico@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:19:01'),
(368, 43, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #43 status from \'Pending\' to \'Verified\'. Department: MCAT.', 'Pending', 'Verified', '136.158.40.163', '2026-10-01 20:19:11'),
(369, 43, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #43 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:13'),
(370, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Pending\' to \'Verified\'. Department: MCAT.', 'Pending', 'Verified', '136.158.40.163', '2026-10-01 20:19:21'),
(371, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:22'),
(372, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:22'),
(373, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:23'),
(374, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:23'),
(375, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:23'),
(376, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:23'),
(377, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:24'),
(378, 44, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: MCAT.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:19:24'),
(379, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:21:13'),
(380, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:21:52'),
(381, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:22:50'),
(382, 65, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.40.163', '2026-10-01 20:24:54'),
(383, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:25:20'),
(384, 59, '', 7, 'Marc@gmail.com', 'Update Complaint Status', 'System user changed complaint #59 status from \'Pending\' to \'Verified\'. Department: BFP.', 'Pending', 'Verified', '136.158.40.163', '2026-10-01 20:25:30'),
(385, 59, '', 7, 'Marc@gmail.com', 'Update Complaint Status', 'System user changed complaint #59 status from \'Verified\' to \'Verified\'. Department: BFP.', 'Verified', 'Verified', '136.158.40.163', '2026-10-01 20:25:34'),
(386, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:26:04'),
(387, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:27:30'),
(388, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 20:32:04'),
(389, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-01 21:10:55'),
(390, NULL, '', 9, 'sugar@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-01 21:11:33'),
(391, NULL, '', 9, 'sugar@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-01 21:33:17'),
(392, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-01 22:09:50'),
(393, 40, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #40 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.41.255', '2026-10-01 22:10:08'),
(394, 43, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #43 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.41.255', '2026-10-01 22:10:13'),
(395, 46, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #46 status from \'Pending\' to \'Verified\'. Department: IT.', 'Pending', 'Verified', '136.158.41.255', '2026-10-01 22:10:22'),
(396, 44, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '136.158.41.255', '2026-10-01 22:10:33'),
(397, NULL, 'Citizen', 24, 'arcee', 'Citizen Registration', 'New citizen account registered with email arcee@gmail.com.', NULL, 'Registered', '136.158.40.163', '2026-10-01 22:24:23'),
(398, NULL, 'Citizen', 24, 'arcee@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 22:24:40'),
(399, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.163', '2026-10-01 22:26:15'),
(400, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 22:27:47'),
(401, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 22:30:25'),
(402, NULL, '', 1, 'admin@gmail.com', 'Created Dispatch Team', 'Created dispatch team #13 (PSTMO) under PSTMO.', NULL, NULL, '112.203.46.166', '2026-10-01 22:32:40'),
(403, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT.', 'Verified', 'Verified', '112.203.46.166', '2026-10-01 22:34:30'),
(404, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 22:35:41'),
(405, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 22:37:52'),
(406, NULL, '', 12, 'Joshua22@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '112.203.46.166', '2026-10-01 22:41:03'),
(407, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-02 20:28:12'),
(408, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-02 20:29:02'),
(409, NULL, '', 9, 'sugar@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-02 20:29:23'),
(410, 45, '', 9, 'sugar@gmail.com', 'Update Complaint Status', 'System user changed complaint #45 status from \'Pending\' to \'Verified\'. Department: MCAT. Role: staff.', 'Pending', 'Verified', '136.158.41.255', '2026-10-02 20:47:32'),
(411, NULL, '', 9, 'sugar@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-02 20:48:13'),
(412, 46, '', 9, 'sugar@gmail.com', 'Complaint Dispatched', 'System user from MCAT assigned complaint #46 (OBSTRUCTION, NORMAL) to dispatch team #12 (MCAT).', NULL, '12', '136.158.41.255', '2026-10-02 21:00:09'),
(413, NULL, 'Citizen', 25, 'RHOEGIN LAMPAS', 'Citizen Google Registration', 'New citizen account registered using Google with email rhoeginlampas@gmail.com.', NULL, 'Registered', '112.209.160.179', '2026-10-03 21:36:30'),
(414, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-07 23:07:21'),
(415, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-07 23:08:24'),
(416, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-07 23:11:42'),
(417, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-07 23:12:09'),
(418, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-07 23:12:49'),
(419, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-07 23:38:05'),
(420, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:11:57'),
(421, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '136.158.41.255', '2026-10-08 01:12:39'),
(422, NULL, '', 12, 'Joshua22@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:17:23'),
(423, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:17:53'),
(424, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '136.158.41.255', '2026-10-08 01:18:20'),
(425, NULL, '', 12, 'Joshua22@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:18:47'),
(426, NULL, '', 12, 'Joshua22@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:20:05'),
(427, 46, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #46 status from \'In Progress\' to \'Verified\'. Department: IT. Role: admin.', 'In Progress', 'Verified', '136.158.41.255', '2026-10-08 01:20:20'),
(428, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '136.158.41.255', '2026-10-08 01:21:00'),
(429, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '136.158.41.255', '2026-10-08 01:22:34'),
(430, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '136.158.41.255', '2026-10-08 01:22:36'),
(431, 63, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #63 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '136.158.41.255', '2026-10-08 01:22:36'),
(432, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:25:02'),
(433, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 01:27:58'),
(434, 63, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.255', '2026-10-08 01:28:16'),
(435, 63, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.255', '2026-10-08 01:28:23'),
(436, 63, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #63. Resolution note: done', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.255', '2026-10-08 01:28:35'),
(437, NULL, '', 12, 'Joshua22@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 02:10:52'),
(438, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 02:11:16'),
(439, NULL, 'Citizen', 9, 'archiemasallo159@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-08 02:21:02'),
(440, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.43.66', '2026-10-08 05:50:45'),
(441, 66, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.43.66', '2026-10-08 05:53:32'),
(442, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-09 22:04:16'),
(443, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.255', '2026-10-09 22:17:30'),
(444, NULL, 'Citizen', 12, 'george23ph@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.158.224.182', '2026-10-10 01:05:06'),
(445, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.131.7', '2026-10-10 04:34:20'),
(446, NULL, 'Citizen', 10, 'cabubasjenny31@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.131.7', '2026-10-10 04:38:50'),
(447, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.131.7', '2026-10-10 05:08:18'),
(448, NULL, 'Citizen', 26, 'Mylene Fronteras', 'Citizen Registration', 'New citizen account registered with email fronterasmylene6@gmail.com.', NULL, 'Registered', '131.226.102.117', '2026-10-10 06:13:23'),
(449, NULL, 'Citizen', 26, 'fronterasmylene6@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '131.226.102.117', '2026-10-10 06:13:37'),
(450, NULL, 'Citizen', 27, 'Danica Antonio', 'Citizen Registration', 'New citizen account registered with email daal.antonio.sjc@phinmaed.com.', NULL, 'Registered', '175.176.27.186', '2026-10-10 07:26:35'),
(451, NULL, 'Citizen', 27, 'daal.antonio.sjc@phinmaed.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.27.186', '2026-10-10 07:27:04'),
(452, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-10 07:29:25'),
(453, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-10 07:29:56'),
(454, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-11 04:18:09'),
(455, NULL, 'Citizen', 28, 'Joshua Palada', 'Citizen Registration', 'New citizen account registered with email paladajoshua331@gmail.com.', NULL, 'Registered', '112.203.44.54', '2026-10-11 04:30:41'),
(456, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-11 04:31:09'),
(457, NULL, 'Citizen', 29, 'Mark Matulin', 'Citizen Registration', 'New citizen account registered with email markmatulin@gmail.com.', NULL, 'Registered', '138.84.143.104', '2026-10-11 16:10:38'),
(458, NULL, 'Citizen', 29, 'markmatulin@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '138.84.143.104', '2026-10-11 16:10:54'),
(459, NULL, 'Citizen', 30, 'Yesha Luther', 'Citizen Google Registration', 'New citizen account registered using Google with email yeshaluther@gmail.com.', NULL, 'Registered', '209.35.167.235', '2026-10-11 19:28:46'),
(460, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-11 19:32:09'),
(461, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-12 16:31:47'),
(462, NULL, 'Citizen', 31, 'Earl Vincent Co', 'Citizen Registration', 'New citizen account registered with email princevincent0124@gmail.com.', NULL, 'Registered', '175.176.31.1', '2026-10-13 04:48:17'),
(463, NULL, 'Citizen', 31, 'princevincent0124@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.31.1', '2026-10-13 04:48:40'),
(464, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-13 06:53:22'),
(465, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-13 06:55:38'),
(466, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-13 06:55:58'),
(467, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Verified\' to \'Rejected\'. Department: IT. Role: admin.', 'Verified', 'Rejected', '112.203.44.54', '2026-10-13 18:22:02'),
(468, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:04'),
(469, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:08'),
(470, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:08'),
(471, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:09'),
(472, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:11'),
(473, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:11'),
(474, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:20'),
(475, 62, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #62 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:21'),
(476, 59, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #59 status from \'Verified\' to \'Rejected\'. Department: IT. Role: admin.', 'Verified', 'Rejected', '112.203.44.54', '2026-10-13 18:22:34'),
(477, 59, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #59 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:35'),
(478, 59, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #59 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '112.203.44.54', '2026-10-13 18:22:36'),
(479, 61, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #61 status from \'Pending\' to \'Rejected\'. Department: IT. Role: admin.', 'Pending', 'Rejected', '112.203.44.54', '2026-10-13 18:22:52'),
(480, 40, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #40 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '112.203.44.54', '2026-10-13 18:27:38'),
(481, 40, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #40 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '112.203.44.54', '2026-10-13 18:27:50'),
(482, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-13 18:31:08'),
(483, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-13 18:31:44'),
(484, 65, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #65 status from \'Pending\' to \'Rejected\'. Department: IT. Role: admin.', 'Pending', 'Rejected', '112.203.44.54', '2026-10-13 18:32:41'),
(485, 64, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #64 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '112.203.44.54', '2026-10-13 18:32:59'),
(486, 64, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #64 status from \'Verified\' to \'Rejected\'. Department: IT. Role: admin.', 'Verified', 'Rejected', '112.203.44.54', '2026-10-13 18:33:01'),
(487, 40, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #40 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '112.203.44.54', '2026-10-13 18:35:42'),
(488, 40, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #40 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '112.203.44.54', '2026-10-13 18:35:50'),
(489, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-13 18:36:20'),
(490, 40, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '112.203.44.54', '2026-10-13 18:36:45'),
(491, 40, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '112.203.44.54', '2026-10-13 18:36:50'),
(492, 40, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #40. Resolution note: resolved', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '112.203.44.54', '2026-10-13 18:37:10'),
(493, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-13 18:38:14'),
(494, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-13 21:53:19'),
(495, NULL, 'Citizen', 32, 'Carl Adrian', 'Citizen Registration', 'New citizen account registered with email cads_31@yahoo.com.', NULL, 'Registered', '112.203.168.107', '2026-10-13 23:20:29'),
(496, NULL, 'Citizen', 32, 'cads_31@yahoo.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.168.107', '2026-10-13 23:20:49'),
(497, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '58.69.102.97', '2026-10-13 23:29:03'),
(498, 37, '', 8, 'edward@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Verified\' to \'Verified\'. Department: MCAT. Role: staff.', 'Verified', 'Verified', '58.69.102.97', '2026-10-13 23:29:52'),
(499, 37, '', 8, 'edward@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Verified\' to \'Verified\'. Department: MCAT. Role: staff.', 'Verified', 'Verified', '58.69.102.97', '2026-10-13 23:30:18'),
(500, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '58.69.102.97', '2026-10-13 23:33:06'),
(501, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '175.176.29.203', '2026-10-13 23:33:51'),
(502, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '175.176.29.203', '2026-10-13 23:35:12'),
(503, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:13'),
(504, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:13'),
(505, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:13'),
(506, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:15'),
(507, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:15'),
(508, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:15'),
(509, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:15'),
(510, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:15'),
(511, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:15'),
(512, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:16'),
(513, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:16'),
(514, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:16'),
(515, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:16'),
(516, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:16'),
(517, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:16'),
(518, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:17'),
(519, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:17'),
(520, 66, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:17'),
(521, 37, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:24'),
(522, 44, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:31'),
(523, 44, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #44 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '175.176.29.203', '2026-10-13 23:35:33'),
(524, 44, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #44 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '175.176.29.203', '2026-10-13 23:35:42'),
(525, 44, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '58.69.102.97', '2026-10-13 23:36:28'),
(526, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.198.70.245', '2026-10-13 23:45:09'),
(527, 67, 'Citizen', 16, 'Joshua@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '112.198.70.245', '2026-10-13 23:48:41'),
(528, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '112.198.70.245', '2026-10-13 23:49:19'),
(529, NULL, '', 11, 'rico@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '58.69.102.97', '2026-10-14 00:07:37'),
(530, 67, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #67 status from \'Pending\' to \'Rejected\'. Department: MCAT. Role: admin.', 'Pending', 'Rejected', '58.69.102.97', '2026-10-14 00:08:28'),
(531, 67, '', 11, 'rico@gmail.com', 'Update Complaint Status', 'System user changed complaint #67 status from \'Rejected\' to \'Rejected\'. Department: MCAT. Role: admin.', 'Rejected', 'Rejected', '58.69.102.97', '2026-10-14 00:08:32'),
(532, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:20:29'),
(533, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:22:05'),
(534, 68, 'Citizen', 16, 'Joshua@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Traffic | Urgency: NORMAL', '136.158.41.50', '2026-10-14 02:22:53'),
(535, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:23:52'),
(536, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:25:14'),
(537, 68, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #68 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '136.158.41.50', '2026-10-14 02:25:54'),
(538, NULL, '', 11, 'PSTMOteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:26:27'),
(539, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:26:58'),
(540, NULL, '', 1, 'admin@gmail.com', 'Created System User', 'Created system user \'Edwardo Calimlim\' (edwardo@gmail.com) with role \'admin\' in department \'PSTMO\'.', NULL, NULL, '136.158.41.50', '2026-10-14 02:29:24'),
(541, NULL, '', 12, 'edwardo@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 02:29:46'),
(542, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 04:12:05'),
(543, NULL, '', 6, 'diwata@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 04:35:21'),
(544, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 04:36:38'),
(545, NULL, '', 11, 'PSTMOteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 04:39:40'),
(546, 68, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #68 (TRAFFIC, NORMAL) to dispatch team #11 (PSTMO).', NULL, '11', '136.158.41.50', '2026-10-14 04:40:12'),
(547, NULL, '', 11, 'PSTMOteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 05:26:15'),
(548, 68, '', 11, 'PSTMO team', 'Unable to Resolve Complaint', 'Dispatch team marked complaint #68 as unable to resolve. Reason: Safety issue - we can\'t solve this', 'assigned', 'Unable to Resolve', '136.158.41.50', '2026-10-14 05:38:07'),
(549, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 05:38:41'),
(550, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 05:52:49'),
(551, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-14 06:01:56'),
(552, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-14 06:04:05'),
(553, 69, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '136.158.43.193', '2026-10-14 06:07:39'),
(554, NULL, 'Citizen', 33, 'Juan Cruz', 'Citizen Registration', 'New citizen account registered with email jopayestive@gmail.com.', NULL, 'Registered', '112.209.162.243', '2026-10-14 06:53:11'),
(555, NULL, 'Citizen', 33, 'jopayestive@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.209.162.243', '2026-10-14 06:53:28'),
(556, NULL, 'Citizen', 33, 'jopayestive@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.209.162.243', '2026-10-14 06:53:51'),
(557, NULL, 'Citizen', 33, 'jopayestive@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.209.162.243', '2026-10-14 06:56:59'),
(558, NULL, 'Citizen', 34, 'thylv Ran', 'Citizen Registration', 'New citizen account registered with email cqtteran@gmail.com.', NULL, 'Registered', '180.194.196.55', '2026-10-14 07:25:58'),
(559, NULL, 'Citizen', 34, 'cqtteran@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '180.194.196.55', '2026-10-14 07:30:54'),
(560, NULL, 'Citizen', 17, 'tyronestark01@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.50', '2026-10-14 07:38:01'),
(561, NULL, 'Citizen', 6, 'geneauriabatiancila@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-14 07:41:42'),
(562, NULL, 'Citizen', 35, 'Kieth Anjhiela Ang', 'Citizen Registration', 'New citizen account registered with email kiethanjhielaang06@gmail.com.', NULL, 'Registered', '112.200.163.32', '2026-10-14 07:44:49'),
(563, NULL, 'Citizen', 35, 'kiethanjhielaang06@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.200.163.32', '2026-10-14 07:45:23'),
(564, NULL, '', 11, 'rico@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-14 07:48:26'),
(565, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 07:53:57'),
(566, NULL, 'Citizen', 17, 'tyronestark01@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.50', '2026-10-14 07:54:51'),
(567, NULL, 'Citizen', 17, 'tyronestark01@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.50', '2026-10-14 07:55:18'),
(568, NULL, '', 5, 'tyronestark01234@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 08:28:46'),
(569, NULL, 'Citizen', 18, 'tyronestark01234@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.41.50', '2026-10-14 08:29:34'),
(570, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 09:19:37'),
(571, NULL, 'Citizen', 36, 'Andrea Ramos', 'Citizen Registration', 'New citizen account registered with email seixcalicious@gmail.com.', NULL, 'Registered', '112.200.172.7', '2026-10-14 20:25:14'),
(572, NULL, 'Citizen', 36, 'seixcalicious@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.200.172.7', '2026-10-14 20:26:03'),
(573, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 23:48:12'),
(574, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-14 23:48:13'),
(575, NULL, 'Citizen', 16, 'Joshua@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 00:26:41'),
(576, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 00:27:57'),
(577, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Unverified', 'Pending', '136.158.41.50', '2026-10-15 00:28:58'),
(578, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:01');
INSERT INTO `tbl_operational_logs` (`logID`, `complaintID`, `actorType`, `actorID`, `actorName`, `action`, `description`, `oldValue`, `newValue`, `ipAddress`, `createdAt`) VALUES
(579, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:07'),
(580, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:11'),
(581, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:16'),
(582, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:22'),
(583, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:27'),
(584, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:31'),
(585, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:35'),
(586, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:41'),
(587, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:49'),
(588, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:29:55'),
(589, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:30:01'),
(590, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:30:06'),
(591, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:30:11'),
(592, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:30:18'),
(593, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:30:21'),
(594, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.41.50', '2026-10-15 00:30:26'),
(595, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 00:35:15'),
(596, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #28 (Joshua Palada) verification was approved.', 'Pending', 'Verified', '136.158.41.50', '2026-10-15 00:35:36'),
(597, NULL, 'Citizen', 37, 'kyle perez', 'Citizen Google Registration', 'New citizen account registered using Google with email perezkyle01262019@gmail.com.', NULL, 'Registered', '136.158.43.69', '2026-10-15 00:52:42'),
(598, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.43.69', '2026-10-15 00:54:29'),
(599, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Unverified', 'Pending', '136.158.43.69', '2026-10-15 00:55:26'),
(600, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:55:30'),
(601, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:55:34'),
(602, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:55:38'),
(603, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:55:45'),
(604, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:55:51'),
(605, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:55:56'),
(606, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:56:02'),
(607, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:56:07'),
(608, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:56:12'),
(609, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '136.158.43.69', '2026-10-15 00:56:18'),
(610, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #37 (kyle perez) verification was approved.', 'Pending', 'Verified', '136.158.41.50', '2026-10-15 00:58:27'),
(611, 70, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.43.69', '2026-10-15 01:05:32'),
(612, 70, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #70 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '136.158.41.50', '2026-10-15 01:09:24'),
(613, 70, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #70 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '136.158.41.50', '2026-10-15 01:09:55'),
(614, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 01:12:06'),
(615, 44, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.50', '2026-10-15 01:12:57'),
(616, 44, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #44. Resolution note: nalinis na yung mga nakaharang na basura', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.50', '2026-10-15 01:19:50'),
(617, 70, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.50', '2026-10-15 01:21:19'),
(618, 70, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.50', '2026-10-15 01:41:13'),
(619, 70, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #70. Resolution note: ggs okay na nalinis na namin yung kalat', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.50', '2026-10-15 01:45:57'),
(620, 70, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'Feedback Submitted', 'Citizen submitted feedback for complaint #70. Rating: 5/5.', NULL, 'Rating: 5/5', '136.158.43.69', '2026-10-15 01:46:35'),
(621, NULL, 'Citizen', 37, 'perezkyle01262019@gmail.com', 'Login', 'Citizen logged into the system using Google authentication.', NULL, NULL, '136.158.43.69', '2026-10-15 01:55:19'),
(622, NULL, 'Citizen', 38, 'Jocelyn', 'Citizen Registration', 'New citizen account registered with email jocelynroga747@gmail.com.', NULL, 'Registered', '113.19.143.225', '2026-10-15 02:16:55'),
(623, NULL, 'Citizen', 38, 'jocelynroga747@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '113.19.143.225', '2026-10-15 02:18:39'),
(624, NULL, 'Citizen', 38, 'jocelynroga747@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '113.19.143.225', '2026-10-15 02:20:22'),
(625, NULL, 'Citizen', 38, 'jocelynroga747@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '113.19.143.225', '2026-10-15 02:26:27'),
(626, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 02:27:22'),
(627, NULL, 'Citizen', 38, 'jocelynroga747@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '113.19.143.225', '2026-10-15 02:35:02'),
(628, NULL, 'Citizen', 38, 'jocelynroga747@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Unverified', 'Pending', '113.19.143.225', '2026-10-15 02:45:43'),
(629, NULL, 'Citizen', 38, 'jocelynroga747@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '113.19.143.225', '2026-10-15 02:45:45'),
(630, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #38 (Jocelyn) verification was approved.', 'Pending', 'Verified', '175.176.29.203', '2026-10-15 02:48:34'),
(631, 71, 'Citizen', 38, 'jocelynroga747@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '113.19.143.225', '2026-10-15 03:04:21'),
(632, 71, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #71 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '175.176.29.203', '2026-10-15 03:18:20'),
(633, 71, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #71 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '175.176.29.203', '2026-10-15 03:18:36'),
(634, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '175.176.29.203', '2026-10-15 03:19:43'),
(635, 71, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '175.176.29.203', '2026-10-15 03:20:28'),
(636, 71, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '175.176.29.203', '2026-10-15 03:23:13'),
(637, 71, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #71. Resolution note: nalinis na namin ang kalat malapit sa robinson', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '175.176.29.203', '2026-10-15 03:25:16'),
(638, 71, 'Citizen', 38, 'jocelynroga747@gmail.com', 'Feedback Submitted', 'Citizen submitted feedback for complaint #71. Rating: 5/5.', NULL, 'Rating: 5/5', '113.19.143.225', '2026-10-15 03:40:11'),
(639, NULL, 'Citizen', 32, 'cads_31@yahoo.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.24.55', '2026-10-15 03:43:21'),
(640, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '175.176.29.203', '2026-10-15 03:45:20'),
(641, NULL, 'Citizen', 32, 'cads_31@yahoo.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Unverified', 'Pending', '175.176.24.55', '2026-10-15 03:45:55'),
(642, NULL, 'Citizen', 32, 'cads_31@yahoo.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '175.176.24.55', '2026-10-15 03:46:02'),
(643, NULL, 'Citizen', 32, 'cads_31@yahoo.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Pending', 'Pending', '175.176.24.55', '2026-10-15 03:46:05'),
(644, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #32 (Carl Adrian) verification was approved.', 'Pending', 'Verified', '175.176.29.203', '2026-10-15 03:46:37'),
(645, 72, 'Citizen', 32, 'cads_31@yahoo.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '175.176.24.55', '2026-10-15 03:51:52'),
(646, 72, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #72 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '175.176.29.203', '2026-10-15 03:54:12'),
(647, 72, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #72 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '175.176.29.203', '2026-10-15 03:54:25'),
(648, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '175.176.29.203', '2026-10-15 03:54:47'),
(649, 72, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '175.176.29.203', '2026-10-15 03:55:09'),
(650, 72, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '175.176.29.203', '2026-10-15 03:56:11'),
(651, 72, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #72. Resolution note: tumahimik na sila bossing', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '175.176.29.203', '2026-10-15 03:57:38'),
(652, 72, 'Citizen', 32, 'cads_31@yahoo.com', 'Feedback Submitted', 'Citizen submitted feedback for complaint #72. Rating: 5/5.', NULL, 'Rating: 5/5', '175.176.24.55', '2026-10-15 03:58:23'),
(653, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 07:03:35'),
(654, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 07:04:27'),
(655, NULL, 'Citizen', 39, 'Donny Pangilinan', 'Citizen Registration', 'New citizen account registered with email donny@gmail.com.', NULL, 'Registered', '136.158.41.50', '2026-10-15 07:08:32'),
(656, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 07:08:56'),
(657, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 07:09:11'),
(658, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 07:10:00'),
(659, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 07:10:30'),
(660, NULL, 'Citizen', 39, 'donny@gmail.com', 'VERIFICATION_SUBMITTED', 'Citizen submitted a valid ID that passed the AI document-format validation and is waiting for admin verification.', 'Unverified', 'Pending', '136.158.41.50', '2026-10-15 07:10:56'),
(661, NULL, 'System', 1, 'admin@gmail.com', 'Verification Approved', 'Citizen #39 (Donny Pangilinan) verification was approved.', 'Pending', 'Verified', '136.158.41.50', '2026-10-15 07:18:31'),
(662, 73, 'Citizen', 39, 'donny@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.41.50', '2026-10-15 07:19:16'),
(663, 73, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #73 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '136.158.41.50', '2026-10-15 07:20:14'),
(664, 73, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #73 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '136.158.41.50', '2026-10-15 07:20:25'),
(665, 73, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.50', '2026-10-15 07:20:46'),
(666, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '112.203.44.54', '2026-10-15 07:52:28'),
(667, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.185', '2026-10-15 07:52:49'),
(668, 74, 'Citizen', 28, 'paladajoshua331@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '112.203.44.54', '2026-10-15 07:53:20'),
(669, 74, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #74 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '136.158.40.185', '2026-10-15 08:18:05'),
(670, 74, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #74 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '136.158.40.185', '2026-10-15 08:18:25'),
(671, NULL, 'Citizen', 28, 'paladajoshua331@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.40.185', '2026-10-15 08:21:14'),
(672, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.40.185', '2026-10-15 08:23:13'),
(673, 73, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.40.185', '2026-10-15 08:23:35'),
(674, NULL, '', 12, 'edwardo@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-15 08:27:14'),
(675, 73, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #73. Resolution note: nalinis na ang mga tambak na basura sa tinajeros', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.40.185', '2026-10-15 08:28:29'),
(676, NULL, 'Citizen', 40, 'Jacaba, Erwin M', 'Citizen Registration', 'New citizen account registered with email jacabaerwin15@gmail.com.', NULL, 'Registered', '175.176.28.60', '2026-10-15 08:28:40'),
(677, 74, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.40.185', '2026-10-15 08:29:06'),
(678, NULL, 'Citizen', 40, 'jacabaerwin15@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '175.176.28.60', '2026-10-15 08:29:17'),
(679, NULL, '', 8, 'edward@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-15 08:29:49'),
(680, 74, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.40.185', '2026-10-15 08:29:55'),
(681, 74, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #74. Resolution note: nalinis na ang mga naka kalat sa tinajeros', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.40.185', '2026-10-15 08:30:42'),
(682, 66, '', 8, 'edward@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: MCAT. Role: staff.', 'Verified', 'Verified', '136.158.43.193', '2026-10-15 08:31:17'),
(683, 66, '', 8, 'edward@gmail.com', 'Update Complaint Status', 'System user changed complaint #66 status from \'Verified\' to \'Verified\'. Department: MCAT. Role: staff.', 'Verified', 'Verified', '136.158.43.193', '2026-10-15 08:31:20'),
(684, 66, '', 8, 'edward@gmail.com', 'Complaint Dispatched', 'System user from MCAT assigned complaint #66 (OBSTRUCTION, NORMAL) to dispatch team #12 (MCAT).', NULL, '12', '136.158.43.193', '2026-10-15 08:31:25'),
(685, 74, 'Citizen', 28, 'paladajoshua331@gmail.com', 'Feedback Submitted', 'Citizen submitted feedback for complaint #74. Rating: 5/5.', NULL, 'Rating: 5/5', '136.158.40.185', '2026-10-15 08:31:44'),
(686, NULL, '', 11, 'rico@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.43.193', '2026-10-15 08:33:13'),
(687, 75, 'Citizen', 40, 'jacabaerwin15@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Fire | Urgency: HIGH', '175.176.28.60', '2026-10-15 08:34:09'),
(688, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.40.185', '2026-10-15 08:48:41'),
(689, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:15:13'),
(690, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:15:46'),
(691, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:24:24'),
(692, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:25:38'),
(693, 76, 'Citizen', 39, 'donny@gmail.com', 'Complaint Submitted', 'Citizen submitted a new complaint.', NULL, 'Status: Pending | Category: Obstruction | Urgency: NORMAL', '136.158.41.50', '2026-10-15 10:26:45'),
(694, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:27:05'),
(695, 76, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #76 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '136.158.41.50', '2026-10-15 10:27:45'),
(696, 76, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #76 (OBSTRUCTION, NORMAL) to dispatch team #9 (MCAT).', NULL, '9', '136.158.41.50', '2026-10-15 10:27:49'),
(697, 76, 'Dispatch Team', 9, 'MCATteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '136.158.41.50', '2026-10-15 10:28:02'),
(698, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:30:22'),
(699, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:38:58'),
(700, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:40:41'),
(701, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 10:56:30'),
(702, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 11:24:08'),
(703, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 11:31:36'),
(704, NULL, '', 9, 'MCATteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '136.158.41.50', '2026-10-15 11:32:31'),
(705, 76, 'Dispatch Team', 9, 'MCATteam', 'Arrived at Location', 'Dispatch team arrived at the complaint location.', 'On the Way', 'Arrived', '136.158.41.50', '2026-10-15 11:32:38'),
(706, 76, '', 9, 'MCATteam', 'Complaint Resolved', 'Dispatch team resolved complaint #76. Resolution note: Malinis na ho ang kalat', 'Dispatch Status: Arrived | Complaint Status: In Progress', 'Dispatch Status: Resolved | Complaint Status: Resolved', '136.158.41.50', '2026-10-15 11:36:53'),
(707, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-10-16 20:14:50'),
(708, 77, 'Citizen', 39, 'donny@gmail.com', 'Complaint Submitted - Manual Review', 'Complaint saved because AI analysis was unavailable.', NULL, 'Status: Pending | AI Analysis: Unavailable', '::1', '2026-10-16 20:15:12'),
(709, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-16 21:05:14'),
(710, 77, '', 1, 'admin@gmail.com', 'Manual Complaint Review', 'System user manually classified complaint #77. Category: FIRE. Urgency: HIGH. Response deadline: 2026-10-17 20:15:12. Department: IT. Role: admin.', 'AI Analysis Unavailable', 'Manual Review Completed', '::1', '2026-10-16 21:45:13'),
(711, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '::1', '2026-10-16 21:46:07'),
(712, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-16 21:46:12'),
(713, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-16 21:46:12'),
(714, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-16 21:46:12'),
(715, 77, '', 1, 'admin@gmail.com', 'Complaint Dispatched', 'System user from IT assigned complaint #77 (FIRE, HIGH) to dispatch team #8 (BFP).', NULL, '8', '::1', '2026-10-16 21:46:20'),
(716, NULL, '', 8, 'BFPteam2@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-16 22:04:54'),
(717, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'In Progress\' to \'Verified\'. Department: IT. Role: admin.', 'In Progress', 'Verified', '::1', '2026-10-16 22:05:52'),
(718, NULL, '', 7, 'BFPteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-16 22:06:24'),
(719, NULL, '', 8, 'BFPteam2@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-16 22:07:51'),
(720, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-16 23:35:30'),
(721, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-16 23:37:03'),
(722, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-16 23:37:48'),
(723, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 00:04:22'),
(724, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 00:21:26'),
(725, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:14:46'),
(726, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Verified\' to \'Rejected\'. Department: IT. Role: admin.', 'Verified', 'Rejected', '::1', '2026-10-17 06:14:52'),
(727, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '::1', '2026-10-17 06:14:59'),
(728, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '::1', '2026-10-17 06:15:03'),
(729, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '::1', '2026-10-17 06:15:03'),
(730, 77, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #77 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '::1', '2026-10-17 06:15:04'),
(731, 75, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #75 status from \'Pending\' to \'Rejected\'. Department: IT. Role: admin.', 'Pending', 'Rejected', '::1', '2026-10-17 06:15:27'),
(732, 69, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #69 status from \'Pending\' to \'Verified\'. Department: IT. Role: admin.', 'Pending', 'Verified', '::1', '2026-10-17 06:16:08'),
(733, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-10-17 06:16:46'),
(734, 57, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #57 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-17 06:25:00'),
(735, 57, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #57 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-17 06:25:01'),
(736, 57, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #57 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-17 06:25:06'),
(737, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:25:38'),
(738, 69, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #69 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-17 06:26:07'),
(739, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:27:11'),
(740, 69, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #69 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-17 06:27:16'),
(741, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:28:47'),
(742, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:30:40'),
(743, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:32:15'),
(744, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:36:52'),
(745, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:37:26'),
(746, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 06:37:53'),
(747, NULL, '', 8, 'BFPteam2@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-17 08:03:27'),
(748, NULL, '', 8, 'BFPteam2@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-17 08:04:11'),
(749, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 08:33:18'),
(750, 57, '', 7, 'Marc@gmail.com', 'Update Complaint Status', 'System user changed complaint #57 status from \'Verified\' to \'Rejected\'. Department: BFP. Role: admin.', 'Verified', 'Rejected', '::1', '2026-10-17 08:33:30'),
(751, 60, '', 7, 'Marc@gmail.com', 'Update Complaint Status', 'System user changed complaint #60 status from \'Verified\' to \'Rejected\'. Department: BFP. Role: admin.', 'Verified', 'Rejected', '::1', '2026-10-17 08:33:39'),
(752, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 08:34:10'),
(753, 69, '', 7, 'Marc@gmail.com', 'Update Complaint Status', 'System user changed complaint #69 status from \'Verified\' to \'Rejected\'. Department: BFP. Role: admin.', 'Verified', 'Rejected', '::1', '2026-10-17 08:34:16'),
(754, NULL, '', 7, 'Marc@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 08:40:29'),
(755, 78, '', 7, 'Marc@gmail.com', 'Verify Emergency Complaint', 'System user verified complaint #78 as part of an emergency incident.', 'Pending', 'Verified', '::1', '2026-10-17 08:40:53'),
(756, 79, '', 7, 'Marc@gmail.com', 'Verify Emergency Complaint', 'System user verified complaint #79 as part of an emergency incident.', 'Pending', 'Verified', '::1', '2026-10-17 08:40:53'),
(757, 80, '', 7, 'Marc@gmail.com', 'Verify Emergency Complaint', 'System user verified complaint #80 as part of an emergency incident.', 'Pending', 'Verified', '::1', '2026-10-17 08:40:53'),
(758, 81, '', 7, 'Marc@gmail.com', 'Verify Emergency Complaint', 'System user verified complaint #81 as part of an emergency incident.', 'Pending', 'Verified', '::1', '2026-10-17 08:40:53'),
(759, 82, '', 7, 'Marc@gmail.com', 'Verify Emergency Complaint', 'System user verified complaint #82 as part of an emergency incident.', 'Pending', 'Verified', '::1', '2026-10-17 08:40:53'),
(760, 83, '', 7, 'Marc@gmail.com', 'Verify Emergency Complaint', 'System user verified complaint #83 as part of an emergency incident.', 'Pending', 'Verified', '::1', '2026-10-17 08:40:53'),
(761, 78, 'System', NULL, 'Dispatch Team #7', 'Emergency Incident Dispatched', 'Complaint #78 was linked to emergency incident EC-20261017-084148-78 and assigned to dispatch team #7.', 'Verified', 'In Progress', '::1', '2026-10-17 08:41:48'),
(762, 79, 'System', NULL, 'Dispatch Team #7', 'Emergency Incident Dispatched', 'Complaint #79 was linked to emergency incident EC-20261017-084148-78 and assigned to dispatch team #7.', 'Verified', 'In Progress', '::1', '2026-10-17 08:41:48'),
(763, 80, 'System', NULL, 'Dispatch Team #7', 'Emergency Incident Dispatched', 'Complaint #80 was linked to emergency incident EC-20261017-084148-78 and assigned to dispatch team #7.', 'Verified', 'In Progress', '::1', '2026-10-17 08:41:48'),
(764, 81, 'System', NULL, 'Dispatch Team #7', 'Emergency Incident Dispatched', 'Complaint #81 was linked to emergency incident EC-20261017-084148-78 and assigned to dispatch team #7.', 'Verified', 'In Progress', '::1', '2026-10-17 08:41:48'),
(765, 82, 'System', NULL, 'Dispatch Team #7', 'Emergency Incident Dispatched', 'Complaint #82 was linked to emergency incident EC-20261017-084148-78 and assigned to dispatch team #7.', 'Verified', 'In Progress', '::1', '2026-10-17 08:41:48'),
(766, 83, 'System', NULL, 'Dispatch Team #7', 'Emergency Incident Dispatched', 'Complaint #83 was linked to emergency incident EC-20261017-084148-78 and assigned to dispatch team #7.', 'Verified', 'In Progress', '::1', '2026-10-17 08:41:48'),
(767, NULL, '', 7, 'BFPteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-17 08:43:22'),
(768, NULL, '', 7, 'BFPteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-17 08:44:19'),
(769, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-17 11:38:11'),
(770, NULL, '', 8, 'BFPteam2@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-17 11:39:10'),
(771, 60, 'Dispatch Team', 8, 'BFPteam', 'Dispatch Started', 'Dispatch team started travelling to the complaint location.', 'Assigned', 'On the Way', '::1', '2026-10-17 11:39:22'),
(772, NULL, '', 7, 'BFPteam@gmail.com', 'Login', 'Dispatch team logged into the system.', NULL, NULL, '::1', '2026-10-17 12:22:28'),
(773, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-10-17 12:25:08'),
(774, NULL, 'Citizen', 39, 'donny@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-10-17 12:48:53'),
(775, 211, 'Citizen', 39, 'donny@gmail.com', 'Complaint Submitted - Manual Review', 'Complaint saved because AI analysis was unavailable.', NULL, 'Status: Pending | AI Analysis: Unavailable', '::1', '2026-10-17 12:50:29'),
(776, NULL, 'Citizen', 1, 'roms@gmail.com', 'Login', 'Citizen logged into the system.', NULL, NULL, '::1', '2026-10-17 13:57:02'),
(777, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-19 12:37:23'),
(778, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-19 12:43:44'),
(779, 37, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Verified\' to \'Verified\'. Department: IT. Role: admin.', 'Verified', 'Verified', '::1', '2026-10-19 12:43:50'),
(780, 37, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Verified\' to \'Rejected\'. Department: IT. Role: admin.', 'Verified', 'Rejected', '::1', '2026-10-19 12:43:52'),
(781, 37, '', 1, 'admin@gmail.com', 'Update Complaint Status', 'System user changed complaint #37 status from \'Rejected\' to \'Rejected\'. Department: IT. Role: admin.', 'Rejected', 'Rejected', '::1', '2026-10-19 12:43:57'),
(782, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-19 12:59:53'),
(783, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-19 23:53:07'),
(784, NULL, '', 1, 'admin@gmail.com', 'Login', 'System user logged into the system.', NULL, NULL, '::1', '2026-10-20 00:07:24');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_password_resets`
--

CREATE TABLE `tbl_password_resets` (
  `resetID` int(11) NOT NULL,
  `userType` enum('citizen','system','dispatchteam') NOT NULL,
  `userID` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_password_resets`
--

INSERT INTO `tbl_password_resets` (`resetID`, `userType`, `userID`, `email`, `tokenHash`, `expiresAt`, `usedAt`, `createdAt`) VALUES
(7, 'system', 1, 'admin@gmail.com', '116b54690923990b21fcdfc1ad2916570cfa28914fe67d4df7354c184b05c523', '2026-08-25 10:01:46', NULL, '2026-08-25 07:46:46'),
(10, 'citizen', 4, 'romeojuntila012@gmail.com', 'b6cde023b5e7b2033e6b82d1eb50c7104611719f930df361440f28b4e7dc804b', '2026-08-25 17:28:00', NULL, '2026-08-25 15:13:00'),
(14, 'citizen', 13, 'danaldwaynematados@gmail.com', '1ba4238ee44658b868dd673f4e29c484b80797ce06162abd413ea9c46f14df2f', '2026-08-31 13:04:51', NULL, '2026-08-31 16:49:51'),
(19, 'citizen', 9, 'archiemasallo159@gmail.com', '7b6ca06c8ce8b48dbef91738525b2ee3e70507f163658f88b350658f9e9a5158', '2026-10-08 05:37:34', NULL, '2026-10-08 09:22:34'),
(21, 'citizen', 6, 'geneauriabatiancila@gmail.com', 'fb7a6b08731c7b253cc62a672d84e125be851f8d7cece1bda61893d96cec58de', '2026-10-08 09:02:26', NULL, '2026-10-08 12:47:26'),
(22, 'citizen', 33, 'jopayestive@gmail.com', '01c9f6add16d734d3ae83fc61050c4037e26527175109c3df93877280a075e41', '2026-10-14 10:10:34', NULL, '2026-10-14 13:55:34');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_systemusers`
--

CREATE TABLE `tbl_systemusers` (
  `systemUsersID` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('admin','staff','dispatcher','supervisor') NOT NULL,
  `department` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `profilePicture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbl_systemusers`
--

INSERT INTO `tbl_systemusers` (`systemUsersID`, `name`, `email`, `passwordHash`, `role`, `department`, `createdAt`, `profilePicture`) VALUES
(1, 'Joshua Garcia', 'admin@gmail.com', '$2y$10$Pfz7z6q/71gQvzRp.uJYlOeGSEamA84VNuhsHV4hldv857oD8vmPa', 'admin', 'IT', '2026-07-27 16:15:47', '/Complaint/Users/uploads/profile/profile_1_1787855977.webp'),
(2, 'Daniel Reyes', 'ros@gamasd', '$2y$10$uS.fweiKAnOC.vRR1h6OLeeVsUsWy/zz8opLQuOUmSiMvV4cMtuKW', 'admin', 'IT', '2026-07-27 16:16:59', NULL),
(3, 'Marcus Santos', 'awit@gmail.com', '$2y$10$UP.ihZiBwBb.Euq5EgtlCuztR2UBFBnPGsU3BrSqtOtmyYV/xRpoO', 'admin', 'BFP', '2026-08-15 00:56:38', NULL),
(4, 'Mark Greyson', 'mark@gmail.com', '$2y$10$1NHIAG0GnVrLMe8B/eS.euvSUCDaknSFkEo8ZlUtux2TJ6yalITXS', 'staff', 'PSTMO', '2026-08-25 00:34:11', NULL),
(5, 'Roms', 'tyronestark01234@gmail.com', '$2y$10$/yQNUixz1J10IfBYd6cc7eFM0e2L/FdlXxgVSF3JolOR73ZLvbuUm', 'admin', 'IT', '2026-08-25 15:19:16', NULL),
(6, 'Marc Gonzales', 'itik@gmail.com', '$2y$12$Bm3MPYEkqas4bNePUzFNgewpZSmS6jKGZfkQFQoNiuwcHy74DBn66', 'admin', 'BFP', '2026-09-29 01:00:23', NULL),
(7, 'Marc Gonzales', 'Marc@gmail.com', '$2y$12$sPaxc9ra8/omxWf9wSnKW.1QSURSV.zU8JBMFHuexEGnaA8VuUpHi', 'admin', 'BFP', '2026-09-29 01:01:23', NULL),
(8, 'Edward Gonzaga', 'edward@gmail.com', '$2y$12$kiM4HhxwStnCzOU.4poqseJtEaZRg6c/zVCJ.EyL3UNvRMwmEynqm', 'staff', 'MCAT', '2026-09-29 18:06:32', NULL),
(9, 'sugarcream', 'sugar@gmail.com', '$2y$12$5RjtWiBG377F3cwAbAD1o.BlR3nW0Aiie5r1xAcd40Zg6P46GybmK', 'staff', 'MCAT', '2026-09-30 15:33:16', NULL),
(10, 'creamsugar', 'cream@gmail.com', '$2y$12$Hv/VwxNL0i8KuVbl38Yfmu5ORmECDB2MjJeOLAGNfxP6xWCTnY4N.', 'admin', 'IT', '2026-09-30 15:49:07', NULL),
(11, 'Rico Belmonte', 'rico@gmail.com', '$2y$12$l8BMcJLygKQfQ/P1zR5HreRpsS5OdUpvdHYMnmHfBvNIaJxAOjp2u', 'admin', 'MCAT', '2026-10-01 19:21:51', NULL),
(12, 'Edwardo Calimlim', 'edwardo@gmail.com', '$2y$12$m8vrkX2XHkyJpjtPegCEWeevBvb2zR9yw2sSKYxv3gwQa8WG1iIKu', 'admin', 'PSTMO', '2026-10-14 02:29:24', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_ai_analysis`
--
ALTER TABLE `tbl_ai_analysis`
  ADD PRIMARY KEY (`analysisID`),
  ADD UNIQUE KEY `unique_complaint_analysis` (`complaintID`);

--
-- Indexes for table `tbl_attachments`
--
ALTER TABLE `tbl_attachments`
  ADD PRIMARY KEY (`attachmentID`),
  ADD KEY `complaintID` (`complaintID`);

--
-- Indexes for table `tbl_citizens`
--
ALTER TABLE `tbl_citizens`
  ADD PRIMARY KEY (`citizenID`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `googleID` (`googleID`);

--
-- Indexes for table `tbl_complaints`
--
ALTER TABLE `tbl_complaints`
  ADD PRIMARY KEY (`complaintID`);

--
-- Indexes for table `tbl_complaint_history`
--
ALTER TABLE `tbl_complaint_history`
  ADD PRIMARY KEY (`historyID`),
  ADD KEY `complaintID` (`complaintID`);

--
-- Indexes for table `tbl_complaint_locations`
--
ALTER TABLE `tbl_complaint_locations`
  ADD PRIMARY KEY (`complaintLocationID`),
  ADD KEY `complaintID` (`complaintID`);

--
-- Indexes for table `tbl_dispatch_locations`
--
ALTER TABLE `tbl_dispatch_locations`
  ADD PRIMARY KEY (`locationID`),
  ADD KEY `fk_dispatch_location_team` (`teamID`),
  ADD KEY `fk_dispatch_location_complaint` (`complaintID`);

--
-- Indexes for table `tbl_dispatch_logs`
--
ALTER TABLE `tbl_dispatch_logs`
  ADD PRIMARY KEY (`logID`);

--
-- Indexes for table `tbl_dispatch_teams`
--
ALTER TABLE `tbl_dispatch_teams`
  ADD PRIMARY KEY (`teamID`),
  ADD KEY `currentComplaintID` (`currentComplaintID`);

--
-- Indexes for table `tbl_emergency_clusters`
--
ALTER TABLE `tbl_emergency_clusters`
  ADD PRIMARY KEY (`clusterID`),
  ADD UNIQUE KEY `clusterReference` (`clusterReference`),
  ADD KEY `representativeComplaintID` (`representativeComplaintID`),
  ADD KEY `dispatchTeamID` (`dispatchTeamID`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `tbl_emergency_cluster_complaints`
--
ALTER TABLE `tbl_emergency_cluster_complaints`
  ADD PRIMARY KEY (`clusterComplaintID`),
  ADD UNIQUE KEY `unique_cluster_complaint` (`clusterID`,`complaintID`),
  ADD KEY `clusterID` (`clusterID`),
  ADD KEY `complaintID` (`complaintID`);

--
-- Indexes for table `tbl_feedback`
--
ALTER TABLE `tbl_feedback`
  ADD PRIMARY KEY (`feedbackID`),
  ADD UNIQUE KEY `unique_complaint_feedback` (`complaintID`);

--
-- Indexes for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD PRIMARY KEY (`notificationID`),
  ADD KEY `idx_citizen_notifications` (`citizenID`),
  ADD KEY `idx_complaint_notifications` (`complaintID`);

--
-- Indexes for table `tbl_operational_logs`
--
ALTER TABLE `tbl_operational_logs`
  ADD PRIMARY KEY (`logID`),
  ADD KEY `idx_complaintID` (`complaintID`),
  ADD KEY `idx_actorType` (`actorType`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_createdAt` (`createdAt`);

--
-- Indexes for table `tbl_password_resets`
--
ALTER TABLE `tbl_password_resets`
  ADD PRIMARY KEY (`resetID`),
  ADD KEY `idx_tokenHash` (`tokenHash`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `tbl_systemusers`
--
ALTER TABLE `tbl_systemusers`
  ADD PRIMARY KEY (`systemUsersID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_ai_analysis`
--
ALTER TABLE `tbl_ai_analysis`
  MODIFY `analysisID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `tbl_attachments`
--
ALTER TABLE `tbl_attachments`
  MODIFY `attachmentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `tbl_citizens`
--
ALTER TABLE `tbl_citizens`
  MODIFY `citizenID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `tbl_complaints`
--
ALTER TABLE `tbl_complaints`
  MODIFY `complaintID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=212;

--
-- AUTO_INCREMENT for table `tbl_complaint_history`
--
ALTER TABLE `tbl_complaint_history`
  MODIFY `historyID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_complaint_locations`
--
ALTER TABLE `tbl_complaint_locations`
  MODIFY `complaintLocationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;

--
-- AUTO_INCREMENT for table `tbl_dispatch_locations`
--
ALTER TABLE `tbl_dispatch_locations`
  MODIFY `locationID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_dispatch_logs`
--
ALTER TABLE `tbl_dispatch_logs`
  MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `tbl_dispatch_teams`
--
ALTER TABLE `tbl_dispatch_teams`
  MODIFY `teamID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tbl_emergency_clusters`
--
ALTER TABLE `tbl_emergency_clusters`
  MODIFY `clusterID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_emergency_cluster_complaints`
--
ALTER TABLE `tbl_emergency_cluster_complaints`
  MODIFY `clusterComplaintID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_feedback`
--
ALTER TABLE `tbl_feedback`
  MODIFY `feedbackID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  MODIFY `notificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=211;

--
-- AUTO_INCREMENT for table `tbl_operational_logs`
--
ALTER TABLE `tbl_operational_logs`
  MODIFY `logID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=785;

--
-- AUTO_INCREMENT for table `tbl_password_resets`
--
ALTER TABLE `tbl_password_resets`
  MODIFY `resetID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `tbl_systemusers`
--
ALTER TABLE `tbl_systemusers`
  MODIFY `systemUsersID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_ai_analysis`
--
ALTER TABLE `tbl_ai_analysis`
  ADD CONSTRAINT `fk_ai_analysis_complaint` FOREIGN KEY (`complaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tbl_attachments`
--
ALTER TABLE `tbl_attachments`
  ADD CONSTRAINT `tbl_attachments_ibfk_1` FOREIGN KEY (`complaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_complaint_history`
--
ALTER TABLE `tbl_complaint_history`
  ADD CONSTRAINT `tbl_complaint_history_ibfk_1` FOREIGN KEY (`complaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_complaint_locations`
--
ALTER TABLE `tbl_complaint_locations`
  ADD CONSTRAINT `tbl_complaint_locations_ibfk_1` FOREIGN KEY (`complaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_dispatch_locations`
--
ALTER TABLE `tbl_dispatch_locations`
  ADD CONSTRAINT `fk_dispatch_location_complaint` FOREIGN KEY (`complaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dispatch_location_team` FOREIGN KEY (`teamID`) REFERENCES `tbl_dispatch_teams` (`teamID`) ON DELETE CASCADE;

--
-- Constraints for table `tbl_dispatch_teams`
--
ALTER TABLE `tbl_dispatch_teams`
  ADD CONSTRAINT `tbl_dispatch_teams_ibfk_1` FOREIGN KEY (`currentComplaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE SET NULL;

--
-- Constraints for table `tbl_notifications`
--
ALTER TABLE `tbl_notifications`
  ADD CONSTRAINT `tbl_notifications_ibfk_1` FOREIGN KEY (`citizenID`) REFERENCES `tbl_citizens` (`citizenID`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_notifications_ibfk_2` FOREIGN KEY (`complaintID`) REFERENCES `tbl_complaints` (`complaintID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
