CREATE TABLE `ls_redeem` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `plate` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `ls_redeem`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `ls_redeem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

