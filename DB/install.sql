-- CREATE TABLES SCRIPT

DELIMITER //
CREATE PROCEDURE `CRMLiteManager_changePosition`(
	IN `beforePosition` INT
)
BEGIN
 
 
 UPDATE ccrepo.CRMLite_structure crm SET crm.position = (crm.position - 1) WHERE crm.position > @beforePosition;
 
   
END//
DELIMITER ;

-- Dumping structure for procedure ccrepo.CRMLiteManager_deleteAllCustomers
DELIMITER //
CREATE PROCEDURE `CRMLiteManager_deleteAllCustomers`()
BEGIN

DELETE FROM ccrepo.CRMLite_customersV2;

END//
DELIMITER ;

-- Dumping structure for table ccrepo.CRMLite_bots
CREATE TABLE IF NOT EXISTS `CRMLite_bots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `questions` json NOT NULL,
  `requiredInfo` tinyint(1) DEFAULT '0',
  `language` set('es','en') COLLATE utf8_unicode_ci DEFAULT 'en',
  `campaign` varchar(100) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `channel` set('email','sms','messenger','facebook','webchat') COLLATE utf8_unicode_ci DEFAULT 'webchat',
  `afterTimeout` varchar(100) COLLATE utf8_unicode_ci DEFAULT 'goto:finish',
  `msgBeforeTimeOutAction` varchar(250) COLLATE utf8_unicode_ci DEFAULT 'We will transfer you to an agent',
  `welcome` varchar(250) COLLATE utf8_unicode_ci DEFAULT 'Welcome',
  `msgBeforeFinishInteraction` varchar(250) COLLATE utf8_unicode_ci DEFAULT 'Have a great day!',
  `sendInteractionHistory` tinyint(1) DEFAULT '0',
  `reportConfig` mediumtext COLLATE utf8_unicode_ci,
  `emailConfig` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `lastupdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Internal base for bots designer';

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_customersV2
CREATE TABLE IF NOT EXISTS `CRMLite_customersV2` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'unique identify',
  `name` varchar(100) DEFAULT '',
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT '',
  `information` json NOT NULL COMMENT 'principal information',
  `files` mediumtext COMMENT 'url files or reference',
  `active` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 is active, 0 inactive',
  `agent` varchar(100) NOT NULL DEFAULT '' COMMENT 'name of the agent who creates this registy',
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create datetime',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'last update',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `phone` (`phone`),
  KEY `indx_id` (`id`) USING BTREE,
  KEY `indx_created` (`created`) USING BTREE,
  KEY `indx_name` (`name`) USING BTREE,
  KEY `indx_email` (`email`) USING BTREE,
  KEY `indx_email_name_phone` (`id`,`name`,`phone`,`email`),
  KEY `indx_agent` (`agent`)
) ENGINE=InnoDB AUTO_INCREMENT=193699 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_features
CREATE TABLE IF NOT EXISTS `CRMLite_features` (
  `name` varchar(100) NOT NULL COMMENT 'Unique name for the feature',
  `description` text CHARACTER SET latin1 COMMENT 'Description for feature',
  `placeholder` varchar(50) DEFAULT NULL,
  `featureVal` text CHARACTER SET latin1 COMMENT 'Optional initial value',
  `requiredVal` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'if the feature is active the value will be 1, or, in other case is 0',
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='General settings for CRMLite''s features';

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_management
CREATE TABLE IF NOT EXISTS `CRMLite_management` (
  `id` int(100) unsigned NOT NULL AUTO_INCREMENT,
  `id_customer` int(100) unsigned DEFAULT '0',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `agent` varchar(100) DEFAULT '',
  `lvl1` varchar(100) DEFAULT '',
  `lvl2` varchar(100) DEFAULT '',
  `lvl3` varchar(100) DEFAULT '',
  `note` varchar(800) DEFAULT '',
  `queuename` varchar(100) DEFAULT NULL,
  `channel` varchar(40) DEFAULT NULL,
  `guid` varchar(100) DEFAULT NULL,
  `callid` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Index_channel` (`channel`),
  KEY `Index_lvl1` (`lvl1`),
  KEY `Index_lvl2` (`lvl2`),
  KEY `Index_lvl3` (`lvl2`),
  KEY `Index_results` (`lvl1`,`lvl2`,`lvl3`),
  KEY `Index_queue` (`queuename`),
  KEY `Index_guid` (`guid`),
  KEY `Index_agent` (`agent`),
  KEY `index_date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_scripts
CREATE TABLE IF NOT EXISTS `CRMLite_scripts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `channel` varchar(20) NOT NULL,
  `script` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_structure
CREATE TABLE IF NOT EXISTS `CRMLite_structure` (
  `fieldId` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `fieldType` set('text','number','select','boolean','checkbox','email','phone','timestamp','name') NOT NULL DEFAULT 'text',
  `fieldValue` text CHARACTER SET latin1 COMMENT 'Default value ',
  `maxLength` int(11) NOT NULL DEFAULT '0' COMMENT 'Max length only works on textfields',
  `required` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Can set the required field or not',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `position` int(2) DEFAULT '0' COMMENT 'Field position 0 to ...',
  PRIMARY KEY (`fieldId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 MAX_ROWS=20 COMMENT='Structure for CRMLite v2';

-- Data exporting was unselected.

-- Dumping structure for table ccrepo.CRMLite_surveys
CREATE TABLE IF NOT EXISTS `CRMLite_surveys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `answers` json DEFAULT NULL,
  `lastAction` varchar(50) DEFAULT '',
  `initdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `finishdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `guid` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.

-- Dumping structure for trigger ccrepo.CRMLiteManager_BeforeDelete_Primary_Fields
DELIMITER //
CREATE TRIGGER `CRMLiteManager_BeforeDelete_Primary_Fields` BEFORE DELETE ON `CRMLite_structure` FOR EACH ROW BEGIN
    IF(OLD.fieldId IN ("email", "phone", "name")) THEN
      CALL func(1);
      
    ELSE
    
    UPDATE ccrepo.CRMLite_customersV2 SET information = JSON_REMOVE(information, CONCAT('$.', OLD.fieldId));
    
END IF;
END//
DELIMITER ;

INSERT INTO `CRMLite_features` (`name`, `description`, `placeholder`, `featureVal`, `requiredVal`, `active`) VALUES
	('blindTransfer', 'Internal blind transfer data and call', NULL, '', 0, 1),
	('CloseAfterCall', 'Close form after call has been end', 'Delay time before close (seconds)', '37', 1, 0),
	('closeForm', 'Close form after time', 'Delay time before close (seconds)', '1000', 1, 0),
	('defaultPreview', 'Dialer assignated to schedule manual calls', 'Dialer name', 'CRMLite_Scheduler->', 1, 1),
	('historyLimit', 'Limit of rows from CRMLite history table', 'Rows', '10', 1, 1),
	('outQueue', 'Default outbound campaign for calls from CRMLite', 'Outbound campaign', 'OUT->', 1, 1),
	('RingbaTransfer', 'Transfer information to Ringba', 'Ringba ID', '1732894626169227170', 1, 1),
	('saveWithoutDispo', 'Save without disposition if you are not in a interaction', NULL, NULL, 0, 1);

INSERT INTO `CRMLite_structure` (`fieldId`, `name`, `fieldType`, `fieldValue`, `maxLength`, `required`, `active`, `position`) VALUES 
('email', 'Email', 'email', '', 200, 1, 1, 2),
('name', 'First name', 'name', '', 100, 1, 1, 1),
('phone', 'Phone number', 'phone', '0', 15, 1, 1, 0);

