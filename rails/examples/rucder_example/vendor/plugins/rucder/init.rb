# this will be invoked in Rails::Initializer.run after eval the block

require 'rucder'
ActiveRecord::Base.class_eval do
  include ActiveRecord::Rucder
end
