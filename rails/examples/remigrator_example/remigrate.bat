@echo off
rem setting RAILS_ROOT and change directory
set RAILS_ROOT="C:\work_RoR\remigrator_example"
cd %RAILS_ROOT%

goto :migrate_down
goto :migrate_up

exit

:migrate_down
@echo "migrate down... "
set VERSION=0
call rake db:migrate
@echo "-----END-------"
:end

:migrate_up
@echo "migrate up... "
set VERSION=
call rake db:migrate
@echo "-----END-------"
:end
