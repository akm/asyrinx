# this will be invoked in Rails::Initializer.run after eval the block
if ENV["RAILS_ENV"] == "development"
  if caller.any?{|line| /(\(irb___\)|\/irb___)/ =~ line} or ENV['DESC_MODELS'] == 'disabled'
    puts <<EOS
desc_models plugin is disabled.
EOS
  else
    begin
      puts <<EOS
desc_models plugin is loaded cause of development mode.
If you'd like to be disabled, start server with "DESC_MODELS=disabled"
 $ ruby script/server DESC_MODELS=disabled
EOS

      require 'desc_models'

      $LOAD_PATH << File.join(directory, 'app', 'controllers')
      $LOAD_PATH << File.join(directory, 'app', 'helpers')
    
      config.controller_paths << File.join(directory, 'app', 'controllers')
      require 'desc_models_controller'
      DescModelsController.template_root = File.join(directory, 'app', 'views')
    
      puts "DescModelsController.template_root: #{DescModelsController.template_root}"
    rescue
      puts "DescModelsController initialization failed. #{$!}"
      raise
    end
  end
end
