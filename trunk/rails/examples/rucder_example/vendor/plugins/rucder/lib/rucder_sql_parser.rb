class Array
  def to_hash(*args)
    self.map do |item|
      item.respond_to?(:to_hash) ? item.to_hash(*args) : 
        item.class.name == 'WildcardExpr' ? '*' : item
    end
  end
end

require 'rparsec/misc'
module Hashable
  def self.append_features(base) #:nodoc:
    super
    base.class_eval do
      cattr_accessor :hash_keys
    end
  end
  def to_hash(*args)
    self.class.hash_keys.inject({}) do|dest, key|
      value = self.send(key)
      if value
        dest[key] = value.respond_to?(:to_hash) ? value.to_hash(*args) : 
          value.class.name == 'WildcardExpr' ? '*' : value
      end
      dest
    end
  end
end
module DefHelper
  def def_readable_with_to_hash(*vars)
    result = def_readable_without_to_hash(*vars)
    include Hashable
    self.hash_keys = vars
    return result
  end

  alias :def_readable_without_to_hash :def_readable
  alias :def_readable :def_readable_with_to_hash
end

require 'sql'

class LiteralExpr < Expr
  def to_hash_with_ignore_values(*vargs)
    result = to_hash_without_ignore_values(*vargs)
    result[:lit] = '?' if vargs.last.is_a?(Hash) && vargs.last[:ignore_values]
    return result
  end
  alias :to_hash_without_ignore_values :to_hash
  alias :to_hash :to_hash_with_ignore_values
end

class ComparePredicate < Predicate
  def to_hash_with_ignore_values(*vargs)
    result = to_hash_without_ignore_values(*vargs)
    if vargs.last.is_a?(Hash) && vargs.last[:ignore_values] and result[:right] and result[:right][:name] == 'NULL'
      result[:right] = {:lit => '?'}
    end
    return result
  end
  alias :to_hash_without_ignore_values :to_hash
  alias :to_hash :to_hash_with_ignore_values
end


require 'sql_parser'
module ActiveRecord
  module Rucder
    class SqlParser
      include ::SqlParser
      
      def call(sql, options = nil)
        @select_parser ||= make(relation)
        case(sql)
        when /^select /i
          parse_select(sql, options)
        when /^insert /i
          parse_insert(sql, options)
        when /^update /i
          parse_update(sql, options)
        when /^delete /i
          parse_delete(sql, options)
        else
          nil
        end
      end
      
      SPACE_IN_BRACKET = /\(([^)]*?)\s([^(]*?)\)/
      
      def parse_select(sql, options = nil)
        sql = sql.dup.gsub('`', '')
        sql.gsub!(SPACE_IN_BRACKET){ "(#{$1}#{$2})" } while SPACE_IN_BRACKET =~ sql
        options ||= {}
        escape_field_name(sql, field_mapping = {})
        sql, limit = escape_limit(sql)
        result = retry_parse(sql, options)
        result = unescape_limit(result, limit)
        unescape_field_name(result, field_mapping)
        gsub_retry_marks(result) if options[:gsub_retry_marks]
        return result
      end
      
      def retry_parse(sql, options)
        result = @select_parser.parse(sql).to_hash(options)
        return result
      rescue
        retry_sql = sql.sub( /\(([^()]*?)\)/ ){'_BB_' << $1.gsub(/\s/, '').gsub('.', '_DT_') << '_BE_'}
        raise if retry_sql == sql
        options[:gsub_retry_marks] = true
        return retry_parse(retry_sql, options)
      end
      
      def gsub_retry_marks(result)
        if result.is_a?(Hash)
          result.each do |k, v|
            if v.is_a?(Hash) or v.is_a?(Array)
              gsub_retry_marks(v)
            elsif v.is_a?(String)
              result[k] = gsub_marks(v)
            end
          end
        elsif result.is_a?(Array)
          result.each do |v|
            if v.is_a?(Hash) or v.is_a?(Array)
              gsub_retry_marks(v)
            end
          end
        end
      end
      
      def gsub_marks(str)
        str.gsub('_BB_', '(').gsub('_BE_', ')').gsub('_CM_', ',').gsub('_DT_', '.').gsub('_AL_', '*')
      end
      
      ALL_IN_BRACKET = /\((.*?)\)/
      
      def escape_field_name(sql, field_mapping)
        select_phases = sql.scan(/select\s(.*)\sfrom/i)
        select_phases.flatten.each do |phase|
          dest = phase.dup
          dest.gsub!(ALL_IN_BRACKET){ 
            '_BB_' << $1.gsub(',', '_CM_').gsub('.', '_DT_').gsub('*', '_AL_') << '_BE_'
          } while ALL_IN_BRACKET =~ dest

          parsing_fields = []
          fields = dest.split(',')
          fields.each do |f|
            words = f.split(' ')
            parsing_fields << words[0]
            next if words.length < 2
            field_mapping[ words[0] ] = 
              { :name => gsub_marks(words[0]), 
                :as => (words.length == 2) ? words[1] : words[2] }
          end
          sql.gsub!(phase, parsing_fields.join(','))
        end
      end
      
      def unescape_field_name(result, field_mapping)
        if result.is_a?(Hash) 
          name = result[:name]
          if name && field_mapping[name]
            result.update( field_mapping[name] )
          else
            result.each{|k, v| unescape_field_name(v, field_mapping) }
          end
        elsif result.is_a?(Array)
          result.each{|v| unescape_field_name(v, field_mapping) }
        end
      end
      
      def escape_limit(sql)
        if /limit\s*\d*\s*,\s*\d*$/i =~ sql
          idx = sql.rindex(/limit\s*\d*\s*,\s*\d*$/i)
          sql, limit = sql[0..idx-1], sql[idx+5..-1]
        end
        return sql, limit
      end
      
      def unescape_limit(result, limit)
        if limit
          limits = limit.split(',', 2)
          return {
            :rel => result,
            :offset => limits[0].to_i,
            :limit => limits[1].to_i
          }
        else
          return result
        end
      end
      
      
      
      def parse_insert(sql, options = nil)
        table_name = sql.scan(/insert into (.*?) \(/i).flatten.join('')
        insert_blocks = sql.sub(/insert into .* \(/i, '').split(')', 2).map{|block|block.strip}
        result = {
          :insert => {
            :into => {:table=>table_name},
            :columns => insert_blocks[0].split(',').map{|col| col.strip.gsub(Regexp.union(/^`/,/`$/), '')}
          }
        }
        case insert_blocks[1]
        when /^values/i 
          values = insert_blocks[1].sub(/^values/i, '').strip
          result[:insert][:values] = values.gsub(Regexp.union(/^\(/, /\)$/), '').split(',').map{|val| options && options[:ignore_values] ? '?' : val.strip}
        when /^select/i
          result[:insert][:select] = parse_select(insert_blocks[1], options)
        else
          raise "unsupported insert: #{sql}"
        end
        return result
      end
      
      def parse_update(sql, options = nil)
        sqls = sql.split(/ where /i, 2)
        select = sqls[0].gsub(/^update/i, 'select * from').gsub(/ set /i, ' where ').gsub(/`/, '').gsub(/,/, ' and ')
        result = @select_parser.parse(select).to_hash(options)
        result.delete(:select)
        result[:update] = result[:from]; result.delete(:from)

        flatten_where(result[:where], set_block = [])
        result[:set] = set_block; result.delete(:where)

        if sqls[1]
          where = "select * from xxxxx where " + sqls[1]
          where_hash = @select_parser.parse(where).to_hash(options)
          raise "Unsupported update #{sql}" unless where_hash[:select]
          where_hash.delete(:select)
          where_hash.delete(:from)
          result.update(where_hash)
        end
        result
      end
      
      def flatten_where(where, dest)
        if where[:left]
          if where[:left][:left].nil?
            dest << where
          else
            flatten_where(where[:left], dest)
            dest << where[:right]
          end
        end
      end
      
      def parse_delete(sql, options = nil)
        sql = sql.gsub(/delete/i, 'select *')
        result = @select_parser.parse(sql).to_hash(options)
        result.delete(:select)
        result[:delete] = result[:from]; result.delete(:from)
        result
      end
    end
  end
end
