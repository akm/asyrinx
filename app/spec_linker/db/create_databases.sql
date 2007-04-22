create database spec_linker_development default character set utf8;
create database spec_linker_test2 default character set utf8;
create database spec_linker_production default character set utf8;
grant all on spec_linker_development.* to 'spec_linker_user'@'localhost';
grant all on spec_linker_test2.* to 'spec_linker_user'@'localhost';
grant all on spec_linker_production.* to 'spec_linker_user'@'localhost';
