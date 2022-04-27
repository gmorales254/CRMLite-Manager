
-- Dumping structure for table ccrepo.CRMLite_customersV2_history

-- Dumping structure for table ccrepo.CRMLite_customersV2_history
CREATE TABLE IF NOT EXISTS `CRMLite_customersV2_history` (
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
CREATE TABLE IF NOT EXISTS `CRMLite_reports` (
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
CREATE TRIGGER `CRMLite_customersV2_after_insert` AFTER INSERT ON `CRMLite_customersV2` FOR EACH ROW BEGIN
-- TRIGGER PARA HISTORICO DE CLIENTES NUEVOS.
INSERT INTO CRMLite_customersV2_history (`id`, `name`, `phone`, `email`, `information`, `files`, `active`, `agent`, `action_history`, `promise`, `schedule_promise`)
VALUES (NEW.id, NEW.name, NEW.phone, NEW.email, NEW.information, NEW.files, NEW.active, NEW.agent, 'CREATED', NEW.promise, NEW.schedule_promise);
 
END//
DELIMITER ;


-- Dumping structure for trigger ccrepo.CRMLite_customersV2_history_after_delete

DELIMITER //
CREATE TRIGGER `CRMLite_customersV2_history_after_delete` AFTER DELETE ON `CRMLite_customersV2` FOR EACH ROW BEGIN
-- TRIGGER PARA HISTORICO DE CLIENTES NUEVOS.

INSERT INTO CRMLite_customersV2_history (`id`, `name`, `phone`, `email`, `information`, `files`, `active`, `agent`, `action_history`, `promise`, `schedule_promise`)
VALUES (OLD.id, OLD.name, OLD.phone, OLD.email, OLD.information, OLD.files, OLD.active, OLD.agent, 'DELETED', OLD.promise, OLD.schedule_promise);
 
END//
DELIMITER ;


-- Dumping structure for trigger ccrepo.CRMLite_customersV2_history_update_customer
DELIMITER //
CREATE TRIGGER `CRMLite_customersV2_history_update_customer` AFTER UPDATE ON `CRMLite_customersV2` FOR EACH ROW 
INSERT INTO CRMLite_customersV2_history (`id`, `name`, `phone`, `email`, `information`, `files`, `active`, `agent`, `action_history`, `promise`, `schedule_promise`)
VALUES (NEW.id, NEW.name, NEW.phone, NEW.email, NEW.information, NEW.files, NEW.active, NEW.agent, 'UPDATED', NEW.promise, NEW.schedule_promise)//
DELIMITER ;

ALTER TABLE ccrepo.CRMLite_customersV2 ADD COLUMN `promise` MEDIUMTEXT NULL AFTER `updated`;
ALTER TABLE ccrepo.CRMLite_customersV2 ADD COLUMN `schedule_promise` TIMESTAMP NULL DEFAULT NULL AFTER `promise`;
