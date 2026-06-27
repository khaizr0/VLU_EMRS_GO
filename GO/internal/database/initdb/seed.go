package initdb

// seedMasterDataSQL contains idempotent seed data from the old backend seeder.
const seedMasterDataSQL = `
INSERT INTO "Roles" ("Id", "Name") VALUES
	(1, 'Admin'),
	(2, 'Teacher'),
	(3, 'Student')
ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name";

INSERT INTO "Ethnicities" ("Id", "Name") VALUES
	(1, 'Kinh'),
	(2, 'Tày'),
	(3, 'Thái'),
	(4, 'Hoa'),
	(5, 'Khơ-me'),
	(6, 'Mường'),
	(7, 'Nùng'),
	(8, 'HMông'),
	(9, 'Dao'),
	(10, 'Gia-rai'),
	(11, 'Ngái'),
	(12, 'Ê-đê'),
	(13, 'Ba na'),
	(14, 'Xơ-Đăng'),
	(15, 'Sán Chay'),
	(16, 'Cơ-ho'),
	(17, 'Chăm'),
	(18, 'Sán Dìu'),
	(19, 'Hrê'),
	(20, 'Mnông'),
	(21, 'Ra-glai'),
	(22, 'Xtiêng'),
	(23, 'Bru-Vân Kiều'),
	(24, 'Thổ'),
	(25, 'Giáy'),
	(26, 'Cơ-tu'),
	(27, 'Gié Triêng'),
	(28, 'Mạ'),
	(29, 'Khơ-mú'),
	(30, 'Co'),
	(31, 'Tà-ôi'),
	(32, 'Chơ-ro'),
	(33, 'Kháng'),
	(34, 'Xinh-mun'),
	(35, 'Hà Nhì'),
	(36, 'Chu ru'),
	(37, 'Lào'),
	(38, 'La Chí'),
	(39, 'La Ha'),
	(40, 'Phù Lá'),
	(41, 'La Hủ'),
	(42, 'Lự'),
	(43, 'Lô Lô'),
	(44, 'Chứt'),
	(45, 'Mảng'),
	(46, 'Pà Thẻn'),
	(47, 'Co Lao'),
	(48, 'Cống'),
	(49, 'Bố Y'),
	(50, 'Si La'),
	(51, 'Pu Péo'),
	(52, 'Brâu'),
	(53, 'Ơ Đu'),
	(54, 'Rơ măm'),
	(55, 'Người nước ngoài'),
	(56, 'Không rõ')
ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name";

INSERT INTO "Departments" ("Name", "CreatedAt")
SELECT 'Khoa xét nghiệm', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Departments" WHERE "Name" = 'Khoa xét nghiệm');

INSERT INTO "Departments" ("Name", "CreatedAt")
SELECT 'Khoa chẩn đoán hình ảnh', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Departments" WHERE "Name" = 'Khoa chẩn đoán hình ảnh');
`
