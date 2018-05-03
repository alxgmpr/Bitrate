# Bitrate
Rapidly compare cryptocurrency price action with social media and search trends

#Team Members
Grant Maloney
Nathan Ortbals
Alex Gompper
Jonathan Yee
Akrum Mahmud

## SQL Schema

```
CREATE DATABASE  IF NOT EXISTS `bitrate` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `bitrate`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `currency`
--

DROP TABLE IF EXISTS `currency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `currency` (
  `id` varchar(5) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `day_index`
--

DROP TABLE IF EXISTS `day_index`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `day_index` (
  `currency_id` varchar(5) NOT NULL,
  `date` date NOT NULL,
  `price_us_dollars` varchar(45) DEFAULT NULL,
  `google_activity` int(11) DEFAULT NULL,
  `twitter_mentions` int(11) DEFAULT NULL,
  PRIMARY KEY (`currency_id`,`date`),
  KEY `currency_day_index_idx` (`currency_id`),
  CONSTRAINT `currency_day_index` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
```


## Data Architecture

Because twitter does not allow access to tweets older than a week, we built a scrapper to collect tweet counts and store them in a database.
We decided to also collect the cryptocurrency prices and google search trends for that day at the same time, to minimize our API calls and allow faster
data retrieval. This scraper runs every day, retrieves the data, and stores a record for that day in the database.

We made use of the tweet-count package hosted on NPM for speed of developement. This package opens an api-stream to twitter and intercepts all tweets that make use of the specified hashtages (in this case, cryptocurrency symbols). After collecting tweets for a day, it fires an event in order to store the count.
