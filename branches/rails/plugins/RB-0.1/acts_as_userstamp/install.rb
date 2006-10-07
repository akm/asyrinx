# Install hook code here
unless File.exist?(File.dirname(__FILE__) + "/../userstamp")
  Commands::Plugin.parse!(['install', 'http://delynnberry.com/svn/code/rails/plugins/userstamp/']) 
end
