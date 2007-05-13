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

require 'sql_parser'
module ActiveRecord
  module Rucder
    class SqlParser
      include ::SqlParser
      def call(sql)
        sql = sql.strip
        @select_parser ||= make(relation)
        case(sql)
        when /^select /i
          parse_select(sql)
        when /^insert /i
          parse_insert(sql)
        when /^update /i
          parse_update(sql)
        when /^delete /i
          parse_delete(sql)
        end
      end
      
      def parse_select(sql)
        @select_parser.parse(sql).to_hash
      end
      
      def parse_insert(sql)
        table_name = sql.scan(/insert into (.*) \(/i).flatten.join('')
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
          result[:insert][:values] = values.gsub(Regexp.union(/^\(/,/\)$/), '').split(',').map{|val|val.strip}
        when /^select/i
          result[:insert][:select] = parse_select(insert_blocks[1])
        else
          raise "unsupported insert: #{sql}"
        end
        return result
      end
      
      def parse_update(sql)
        sqls = sql.split(/ where /i, 2)
        select = sqls[0].gsub(/^update/i, 'select * from').gsub(/ set /i, ' where ').gsub(/`/, '').gsub(/,/, ' and ')
        result = @select_parser.parse(select).to_hash
        result.delete(:select)
        result[:update] = result[:from]; result.delete(:from)

        flatten_where(result[:where], set_block = [])
        result[:set] = set_block; result.delete(:where)

        if sqls[1]
          where = "select * from xxxxx where " + sqls[1]
          where_hash = @select_parser.parse(where).to_hash
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
      
      def parse_delete(sql)
        sql = sql.gsub(/delete/i, 'select *')
        result = @select_parser.parse(sql).to_hash
        result.delete(:select)
        result[:delete] = result[:from]; result.delete(:from)
        result
      end
    end
  end
end
