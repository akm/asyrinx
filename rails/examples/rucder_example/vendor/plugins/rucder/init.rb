# this will be invoked in Rails::Initializer.run after eval the block
if ENV["RAILS_ENV"] == "development"
  require 'rucder_service'
  require 'rucder_database_statements'
  
  conn = ActiveRecord::Base.connection
  conn.class.class_eval do
    include ActiveRecord::Rucder::DatabaseStatements
  end

  if caller.any?{|line| /(\(irb\)|\/irb)/ =~ line}
    conn.rucder_enabled = false
    puts <<EOS
rucder is disabled but loaded.
If you'd like to be enabled, type following:
ActiveRecord::Base.connection.rucder_enabled = true
EOS
  else
    conn.rucder_enabled = true
    puts <<EOS
rucder is loaded and enabled.
If you'd like to be disabled, write following line after Rails::Initializer.run block in config/environment.rb:
ActiveRecord::Base.connection.rucder_enabled = false
EOS
  end
  
  $LOAD_PATH << File.join(directory, 'app', 'controllers')
  $LOAD_PATH << File.join(directory, 'app', 'helpers')
  
  config.controller_paths << File.join(directory, 'app', 'controllers')
  require 'rucder_controller'
  RucderController.template_root = File.join(directory, 'app', 'views')
end
