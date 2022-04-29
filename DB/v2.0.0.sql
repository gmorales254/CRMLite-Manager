
-- Dumping structure for table ccrepo.CRMLite_customersV2_history

-- Dumping structure for table ccrepo.CRMLite_customersV2_history
CREATE TABLE IF NOT EXISTS ccrepo.`CRMLite_customersV2_history` (
  `id_history` bigint(20) NOT NULL AUTO_INCREMENT,
  `id` bigint(20) NOT NULL,
  `name` varchar(100) DEFAULT '',
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT '',
  `information` json NOT NULL,
  `files` mediumtext,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `agent` varchar(100) NOT NULL DEFAULT '',
  `promise` varchar(50) DEFAULT NULL,
  `schedule_promise` timestamp NULL DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `action_history` varchar(50) NOT NULL DEFAULT 'UPDATED',
  `action_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_history`) USING BTREE,
  KEY `indx_id` (`id`) USING BTREE,
  KEY `indx_created` (`created`) USING BTREE,
  KEY `indx_name` (`name`) USING BTREE,
  KEY `indx_email` (`email`) USING BTREE,
  KEY `indx_email_name_phone` (`id`,`name`,`phone`,`email`),
  KEY `indx_agent` (`agent`)
) ENGINE=InnoDB AUTO_INCREMENT=6994 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_reports
CREATE TABLE IF NOT EXISTS ccrepo.`CRMLite_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8 NOT NULL,
  `columns` json NOT NULL,
  `campaigns` json NOT NULL,
  `channel` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'telephony',
  `destination` json DEFAULT NULL,
  `days` int(11) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for trigger ccrepo.CRMLite_customersV2_after_insert

DELIMITER //
CREATE TRIGGER ccrepo.`CRMLite_customersV2_after_insert` AFTER INSERT ON `CRMLite_customersV2` FOR EACH ROW BEGIN
-- TRIGGER PARA HISTORICO DE CLIENTES NUEVOS.
INSERT INTO CRMLite_customersV2_history (`id`, `name`, `phone`, `email`, `information`, `files`, `active`, `agent`, `action_history`, `promise`, `schedule_promise`)
VALUES (NEW.id, NEW.name, NEW.phone, NEW.email, NEW.information, NEW.files, NEW.active, NEW.agent, 'CREATED', NEW.promise, NEW.schedule_promise);
 
END//
DELIMITER ;


-- Dumping structure for trigger ccrepo.CRMLite_customersV2_history_after_delete

DELIMITER //
CREATE TRIGGER ccrepo.`CRMLite_customersV2_history_after_delete` AFTER DELETE ON ccrepo.`CRMLite_customersV2` FOR EACH ROW BEGIN
-- TRIGGER PARA HISTORICO DE CLIENTES NUEVOS.

INSERT INTO ccrepo.CRMLite_customersV2_history (`id`, `name`, `phone`, `email`, `information`, `files`, `active`, `agent`, `action_history`, `promise`, `schedule_promise`)
VALUES (OLD.id, OLD.name, OLD.phone, OLD.email, OLD.information, OLD.files, OLD.active, OLD.agent, 'DELETED', OLD.promise, OLD.schedule_promise);
 
END//
DELIMITER ;


-- Dumping structure for trigger ccrepo.CRMLite_customersV2_history_update_customer
DELIMITER //
CREATE TRIGGER ccrepo.`CRMLite_customersV2_history_update_customer` AFTER UPDATE ON ccrepo.`CRMLite_customersV2` FOR EACH ROW 
INSERT INTO ccrepo.CRMLite_customersV2_history (`id`, `name`, `phone`, `email`, `information`, `files`, `active`, `agent`, `action_history`, `promise`, `schedule_promise`)
VALUES (NEW.id, NEW.name, NEW.phone, NEW.email, NEW.information, NEW.files, NEW.active, NEW.agent, 'UPDATED', NEW.promise, NEW.schedule_promise)//
DELIMITER ;

ALTER TABLE ccrepo.CRMLite_customersV2 ADD COLUMN `promise` MEDIUMTEXT NULL AFTER `updated`;
ALTER TABLE ccrepo.CRMLite_customersV2 ADD COLUMN `schedule_promise` TIMESTAMP NULL DEFAULT NULL AFTER `promise`;

-- Dumping structure for procedure ccdata.blacklist_schedule_procedure
DELIMITER //
CREATE PROCEDURE `blacklist_schedule_procedure`(
	IN `phone` VARCHAR(50),
	IN `campaign` VARCHAR(50),
	IN `username` VARCHAR(50),
	IN `schedule` TIMESTAMP
)
BEGIN

INSERT IGNORE INTO ccdata.black_list (phone, campaign, username) VALUES (phone, campaign, username);
DELETE FROM ccdata.calls_spool WHERE destination LIKE CONCAT('%',phone,'%') OR (alternatives <> '' AND (alternatives like CONCAT('%',phone,'%') OR alternatives like CONCAT('%',phone,'%')));
DELETE FROM ccdata.calls_scheduler WHERE destination LIKE CONCAT('%',phone,'%') OR (alternatives <> '' AND (alternatives like CONCAT('%',phone,'%') OR alternatives like CONCAT('%',phone,'%')));

IF schedule != "" AND schedule IS NOT NULL THEN
INSERT IGNORE INTO ccdata.black_list_schedule (phone, removedate) VALUES (phone, schedule) ON DUPLICATE KEY UPDATE removedate = VALUES(removedate);
END IF;

END//
DELIMITER ;

-- Dumping structure for procedure ccdata.blacklist_schedule_procedure_deletefrom
DELIMITER //
CREATE PROCEDURE `blacklist_schedule_procedure_deletefrom`(
	IN `callerid` VARCHAR(50)
)
    COMMENT 'Delete statements for tables black_list and black_list_schedule'
BEGIN
DELETE FROM ccdata.black_list WHERE phone = callerid;
DELETE FROM ccdata.black_list_schedule WHERE phone = callerid;
UPDATE ccrepo.CRMLite_customersV2 SET promise = "", schedule_promise = null WHERE phone = callerid;
END//
DELIMITER ;

-- Dumping structure for table ccdata.black_list_schedule
CREATE TABLE IF NOT EXISTS `black_list_schedule` (
  `phone` varchar(20) DEFAULT NULL,
  `removedate` timestamp NULL DEFAULT NULL,
  UNIQUE KEY `Index 1` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
