$KCODE="u"

# add to the first line of each testcase: require File.dirname(__FILE__) + "/test_helper"

def __DIR__(*args); File.join(File.dirname(__FILE__), *args); end

RAILS_ROOT = __DIR__('../../../..')

$:.unshift(__DIR__('/../lib'))
# begin
#   require 'rubygems'
# rescue LoadError
  $:.unshift(__DIR__('/../../../rails/activerecord/lib'))
  $:.unshift(__DIR__('/../../../rails/activesupport/lib'))
  $:.unshift(__DIR__('/../../../rails/actionpack/lib'))
#end
require 'test/unit'
require 'active_support'
require 'active_record'
require 'active_record/fixtures'

logger = Logger.new __DIR__('debug.log')

# create tables
config = YAML::load_file(__DIR__('database.yml'))
ActiveRecord::Base.logger = logger
ActiveRecord::Base.establish_connection(config[ENV['DB'] || 'sqlite3'])

load(__DIR__("schema.rb"))

# insert sample data to the tables from 'fixtures/*.yml'
Test::Unit::TestCase.fixture_path = __DIR__('fixtures')
$:.unshift(Test::Unit::TestCase.fixture_path)
Test::Unit::TestCase.use_instantiated_fixtures  = false

# for controller test
=begin
require 'action_pack'
require 'action_controller'
require 'action_controller/test_process'

ActionController::Base.ignore_missing_templates = true
ActionController::Routing::Routes.reload rescue nil
ActionController::Base.logger = logger
class ActionController::Base; def rescue_action(e) raise e end; end
=end

$:.unshift __DIR__('../lib') if File.directory? __DIR__('../lib')
load __DIR__('../init.rb') if File.exists? __DIR__('../init.rb')
