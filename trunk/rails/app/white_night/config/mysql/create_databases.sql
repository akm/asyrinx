create database white_night_development default character set utf8;
create database white_night_test2 default character set utf8;
create database white_night_production default character set utf8;
grant all on white_night_development.* to 'white_night_user'@'localhost';
grant all on white_night_test2.* to 'white_night_user'@'localhost';
grant all on white_night_production.* to 'white_night_user'@'localhost';
create database white_night_development_actual default character set utf8;
grant all on white_night_development_actual.* to 'white_night_user'@'localhost';
