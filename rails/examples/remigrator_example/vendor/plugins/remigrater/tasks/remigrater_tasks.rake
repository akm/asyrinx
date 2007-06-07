require 'active_record'
desc 'Migrate database to a version, then back up to current'
task :remigrate  => :environment do
  ENV['VERSION'] ||= '0'
  print "Migrating to version #{ENV['VERSION']}..."
  ActiveRecord::Migrator.migrate("db/migrate/", ENV["VERSION"] ? ENV["VERSION"].to_i : nil)
  puts ' done'
  print "Migrating to current_version ..."
  ActiveRecord::Migrator.migrate("db/migrate/", nil)
  puts ' done'
end
