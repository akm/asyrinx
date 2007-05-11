# this will be invoked in Rails::Initializer.run after eval the block
if ENV["RAILS_ENV"] == "development"
  require 'rucder_service'
  require 'rucder_database_statements'
  
  conn = ActiveRecord::Base.connection
  conn.class.class_eval do
    include ActiveRecord::Rucder::DatabaseStatements
  end
  conn.rucder_enabled = true
end
