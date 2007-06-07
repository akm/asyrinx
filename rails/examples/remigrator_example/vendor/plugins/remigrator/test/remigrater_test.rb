require(File.join(File.dirname(__FILE__), '../../../../','config', 'boot'))

require 'test/unit'

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'tasks/rails'

class RemigraterTest < Test::Unit::TestCase
  def test_remigrate_task
    # from versiont=3 to version=5
    ENV['VERSION']="3"
    Rake::Task["db:migrate"].invoke
    before_ver = ActiveRecord::Migrator.current_version.to_i
    Rake::Task[:remigrate].invoke
    after_ver = ActiveRecord::Migrator.current_version.to_i
    assert_equal 3, before_ver
    assert_equal 5, after_ver
  end
end
