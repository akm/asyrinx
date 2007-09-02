class DescModelsController < ActionController::Base
  
  layout 'desc_models'
  
  protected
  
  if /1\.1\./ =~ Rails::VERSION::STRING
    before_filter :prepare_template_root
    
    def prepare_template_root
      @template.base_path = File.join(File.dirname(__FILE__), '../views')
      return true
    end
  end
  
  public
  def index
    redirect_to :action => 'list'
  end
  
  IGNORE_CLASS_NAMES = ['CGI::Session::ActiveRecordStore::Session']
  
  DEFAULT_COLUMN_VARIABLES = [
      'comment', 'name', 'sql_type', 'scale', 'null',
      'original_default', 'primary',
    ].map{|name| "@#{name}"}
  
  IGNORE_COLUMN_VARIABLES = [
      'table_class', 'type', 'limit', 'precision', 
      'base_name', 'default', 'precision', 'scale'
    ].map{|name| "@#{name}"}
  
  DEFAULT_COLUMN_CAPTIONS ={
    'comment' => '日本語名', 
    'name' => 'カラム名', 
    'sql_type' => '型', 
    'scale' => 'スケール', 
    'null' => 'NULL可',
    'original_default' => 'デフォルト値', 
    'limit' => 'サイズ', 
    'precision' => '精度', 
    'default' => 'デフォルト値(内部)', 
    'primary' => 'プライマリキー',
    'table_class' => 'クラス名（内部）', 
    'type' => '型(内部)', 
    'base_name' => '基本名(内部)'
  }
  
  def list
    @models = []
    ObjectSpace.each_object(Class) do |klass|
      next if IGNORE_CLASS_NAMES.include?(klass.name)
      @models << klass if klass < ActiveRecord::Base
    end
    @models.uniq!
    @models = @models.sort_by{|m|m.table_name}
    
    @column_variables = DEFAULT_COLUMN_VARIABLES.dup
    @db_error_models = []
    @models.each do |model|
      begin
        columns = model.columns
        columns.each do |column|
          @column_variables.concat(column.instance_variables).uniq!
        end
      rescue
        @db_error_models << model
      end
    end
    @models = @models - @db_error_models

    unless params[:table_name_patterns].blank?
      patterns = params[:table_name_patterns].split(',').map{|str|Regexp.new(str.strip)}
      @models = @models.select do |model|
        patterns.any?{|pattern|pattern =~ model.table_name}
      end
    end
    
    # 重複したテーブルを表示してしまう場合(usersとか)があるのでフィルタリング
    models = @models
    @models = []
    models.each do |model|
      if exist_model = @models.detect{|m| m.name == model.name }
        exist_model.invocations ||= []
        exist_model.invocations.concat(model.invocations || []).uniq!
      else
        @models << model
      end
    end

    @column_variables = @column_variables - IGNORE_COLUMN_VARIABLES
    @column_captions = DEFAULT_COLUMN_CAPTIONS
    render :action => 'list'
  end
  
  require 'find'
  def reload
    Find.find(File.join(File.dirname(__FILE__), '..', '..', '..', '..', '..', 'app', 'models')) do |file|
      if /\.svn\z/ =~ file
        Find.prune
        next
      end
      next if File.directory?(file)
      # ソースを読み込んで例外が起きても無視します
      begin
        require file 
      rescue
        ActiveRecord::Base.logger.warn "\nSCRIPT ERROR\n  while loading #{file}\n" << $!.to_s << "\n" 
      end
    end
    redirect_to :action => 'list'
  end
end
