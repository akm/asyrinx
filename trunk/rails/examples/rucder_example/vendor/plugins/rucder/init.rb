# this will be invoked in Rails::Initializer.run after eval the block
if ENV["RAILS_ENV"] == "development"
  require 'rucder_service'
  require 'rucder_database_statements'
  
  conn = ActiveRecord::Base.connection
  conn.class.class_eval do
    include ActiveRecord::Rucder::DatabaseStatements
  end
  conn.rucder_enabled = true
  
  $LOAD_PATH << File.join(directory, 'app', 'controllers')
  $LOAD_PATH << File.join(directory, 'app', 'helpers')
  
  config.controller_paths << File.join(directory, 'app', 'controllers')
  require 'rucder_controller'
  RucderController.template_root = File.join(directory, 'app', 'views')
end
