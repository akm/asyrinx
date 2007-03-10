class TextOptions
  
  class Entry
    attr_accessor :index, :text, :value
    def initialize(index, text, value)
      @index = index
      @text = text
      @value = value
    end
    
    def to_array(*args)
      args ||= [:text, :index]
      args = [:text, :index] if args.empty?
      args.collect{|arg| self.send(arg)}
    end
    
    def index_text
      "#{index}: #{text}"
    end
    
    def self.create(str, default_index, value = nil)
      idx, text = *(str.include?(':') ? str.split(':', 2) : [default_index, str])
      idx = idx.to_i
      self.new(idx, text.strip, value || idx)
    end
  end
  
  def initialize
    @entries = []
    @index = {}
  end
  
  def self.create(*args)
    self.new.concat(*args)
  end
  
  def concat(*args)
    if args.length == 1 && args.first.is_a?(Hash)
      hash = args.first
      hash.keys.sort.each{|k| self.<<(k, hash[k]) }
    else
      args.flatten.each{|k| self << k }
    end
    self
  end
  
  def <<(str, value = nil)
    entry = Entry.create(str, @entries.length, value)
    @entries << entry
    @index[entry.index] = entry
    self
  end
  
  def to_array(*args)
    @entries.collect{|entry| entry.to_array(*args)}
  end
  
  def [](index); @index[index]; end
  def length; @entries.length; end
  alias_method :size, :length

  def first; @entries.first; end
  def last; @entries.last; end
end
