
-- Dumping structure for procedure ccrepo.CRMLiteManager_deleteAllCustomers
DELIMITER //
CREATE PROCEDURE `CRMLiteManager_deleteAllCustomers`()
BEGIN

DELETE FROM ccrepo.CRMLite_customersV2;

END//
DELIMITER ;

-- Dumping structure for table ccrepo.CRMLite_customersV2
CREATE TABLE IF NOT EXISTS `CRMLite_customersV2` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'unique identify',
  `information` json NOT NULL COMMENT 'principal information',
  `files` mediumtext COMMENT 'url files or reference',
  `active` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 is active, 0 inactive',
  `agent` varchar(100) NOT NULL DEFAULT '' COMMENT 'name of the agent who creates this registy',
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create datetime',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'last update',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `indx_id` (`id`) USING BTREE,
  KEY `indx_created` (`created`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8;

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

-- Dumping structure for table ccrepo.CRMLite_scripts
CREATE TABLE IF NOT EXISTS `CRMLite_scripts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `channel` varchar(20) NOT NULL,
  `script` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

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

-- Dumping structure for trigger ccrepo.CRMLiteManager_BeforeDelete_Primary_Fields
DELIMITER //
CREATE TRIGGER `ccrepo`.`CRMLiteManager_BeforeDelete_Primary_Fields` BEFORE DELETE ON ccrepo.CRMLite_structure FOR EACH ROW
BEGIN
    IF(OLD.fieldId IN ("email", "phone", "name")) THEN
      CALL func(1);
      
    ELSE
    
    UPDATE ccrepo.CRMLite_customersV2 SET information = JSON_REMOVE(information, CONCAT('$.', OLD.fieldId));
      
END IF;
END//
DELIMITER ;

-- Dumping structure for trigger ccrepo.CRMLiteManager_Data_Controler
DELIMITER //
CREATE TRIGGER `ccrepo`.`CRMLiteManager_Data_Controler` BEFORE INSERT ON ccrepo.CRMLite_customersV2 FOR EACH ROW
BEGIN
    SET @phone = (SELECT NEW.information ->> "$.phone");
    SET @name = (SELECT NEW.information ->> "$.name");
    SET @email = (SELECT NEW.information ->> "$.email");
    
    IF(@phone = "" OR @name = "") THEN
      signal sqlstate '45000';
      SET @MESSAGE_TEXT = "Phone or Name is undefined";

     END IF;
     
     SET @foundPhone = (SELECT count(*) found FROM CRMLite_customersV2 WHERE information->>"$.phone" = @phone);
     SET @foundEmail = (SELECT count(*) found FROM CRMLite_customersV2 WHERE information->>"$.email" = @email);
     IF (@foundPhone > 0 OR @foundEmail > 0) THEN
      signal sqlstate '45000';
       -- Encontramos repetidos y cancelamos insert
     END IF;
END//
DELIMITER ;

-- Dumping structure for trigger ccrepo.CRMLiteManager_Data_Controler_update
DELIMITER //
CREATE TRIGGER `ccrepo`.`CRMLiteManager_Data_Controler_update` BEFORE UPDATE ON ccrepo.CRMLite_customersV2 FOR EACH ROW
BEGIN
    SET @phone = (SELECT NEW.information ->> "$.phone");
    SET @name = (SELECT NEW.information ->> "$.name");
    SET @email = (SELECT NEW.information ->> "$.email");
    
    SET @oldPhone = (SELECT OLD.information ->> "$.phone");
    SET @oldEmail = (SELECT OLD.information ->> "$.email");
    
    
    IF(@phone = "" OR @name = "") THEN
      signal sqlstate '45000';

     END IF;
     
     SET @foundPhone = (SELECT count(*) found FROM CRMLite_customersV2 WHERE information->>"$.phone" = @phone);
     SET @foundEmail = (SELECT count(*) found FROM CRMLite_customersV2 WHERE information->>"$.email" = @email);
     
     IF (@foundPhone > 0 AND @phone != @oldPhone) THEN
      signal sqlstate '45000';
       -- Encontramos telefonos repetidos y cancelamos update
     END IF;
     
     IF (@foundEmail > 0 AND @email != @oldEmail AND @email != "") THEN
      signal sqlstate '45000';
       -- Encontramos emails repetidos y cancelamos update
     END IF;
END//
DELIMITER ;

-- instalacion de features 

INSERT INTO `CRMLite_features` (`name`, `description`, `placeholder`, `featureVal`, `requiredVal`, `active`) VALUES
	('blindTransfer', 'Internal blind transfer data and call', NULL, '', 0, 1),
	('CloseAfterCall', 'Close form after call has been end', 'Delay time before close (seconds)', '37', 1, 0),
	('closeForm', 'Close form after time', 'Delay time before close (seconds)', '1000', 1, 0),
	('defaultPreview', 'Dialer assignated to schedule manual calls', 'Dialer name', 'CRMLite_Scheduler->', 1, 1),
	('historyLimit', 'Limit of rows from CRMLite history table', 'Rows', '10', 1, 1),
	('outQueue', 'Default outbound campaign for calls from CRMLite', 'Outbound campaign', 'OUT->', 1, 1),
	('saveWithoutDispo', 'Save without disposition if you are not in a interaction', NULL, NULL, 0, 1);


INSERT INTO `CRMLite_structure` (`fieldId`, `name`, `fieldType`, `fieldValue`, `maxLength`, `required`, `active`, `position`) VALUES
	('email', 'Email', 'email', '', 200, 1, 1, 2),
	('name', 'Complete name', 'name', '', 100, 1, 1, 0),
	('phone', 'Phone number', 'phone', '0', 15, 1, 1, 1);

