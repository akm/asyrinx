create database rucder_development default character set utf8;
create database rucder_test default character set utf8;
create database rucder_production default character set utf8;
grant all on rucder_development.* to 'rucder_user'@'localhost';
grant all on rucder_test.* to 'rucder_user'@'localhost';
grant all on rucder_production.* to 'rucder_user'@'localhost';
