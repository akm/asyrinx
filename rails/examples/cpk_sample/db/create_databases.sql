create database cpk_sample_development default character set utf8;
create database cpk_sample_test default character set utf8;
create database cpk_sample_production default character set utf8;
grant all on cpk_sample_development.* to 'cpk_sample_user'@'localhost';
grant all on cpk_sample_test.* to 'cpk_sample_user'@'localhost';
grant all on cpk_sample_production.* to 'cpk_sample_user'@'localhost';
