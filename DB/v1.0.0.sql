-- Ringba featutre on structure 
ALTER TABLE ccrepo.CRMLite_structure ADD COLUMN `ringbatag` VARCHAR(50) NULL DEFAULT '' AFTER `position`;
-- Fix trigger to no-space in ID from Customers table

DELIMITER //
CREATE TRIGGER `CRMLite_structure_before_insert` BEFORE INSERT ON `CRMLite_structure` FOR EACH ROW BEGIN
SET NEW.fieldId = REPLACE(TRIM(NEW.fieldId), " ", "");
END//
DELIMITER ;

ALTER TABLE `CRMLite_structure` ADD COLUMN `optional` TINYINT DEFAULT '1' AFTER `ringbatag`;

ALTER TABLE `CRMLite_structure` ADD COLUMN `optCamps` JSON NULL COMMENT 'Optional campaigns selected, this will works if the optional field is true' AFTER `optional`;
