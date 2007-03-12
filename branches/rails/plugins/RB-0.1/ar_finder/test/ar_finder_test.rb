require File.join(File.dirname(__FILE__), '../init')
require File.join(File.dirname(__FILE__), 'test_helper')

class ArFinderTest < Test::Unit::TestCase

  class SimpleFinder1 < ArFinder
    parameters :str1, :int1, :date1
    
    def build(options = nil)
      st = []
      st << 'type_cd = 1'
      st << 'str1 like :str1' if str1 && !str1.empty?
      st << 'int1 = :int1' if int1 && !int1.empty?
      self.conditions = st
    end
  end

  def test_SimpleFinder1_options_to_find
    f1 = SimpleFinder1.new
    f1.str1 = nil
    f1.int1 = nil
    f1.date1 = nil
    assert_equal({:conditions => 'type_cd = 1'}, f1.options_to_find)

    f1.str1 = 'a'
    f1.int1 = '123'
    assert_equal(
      {:conditions => ['type_cd = 1 and str1 like :str1 and int1 = :int1', {:str1 => 'a', :int1 => '123'}]}, 
      f1.options_to_find)
  end
  


  class OrderableFinder2 < ArFinder
    parameters :name => {:filter => '%#{value}%', :delimiter => ' '}
    parameters :tel => {:filter => '%#{value}%', :delimiter => ' '}
    parameters :email => {:filter => '%#{value}%', :delimiter => ' '}
    parameters :birthday
    
    order_options(
      '1: 名前' => 'name', 
      '2: 電話番号' => 'tel', 
      '3: メール' => 'email', 
      '4: 誕生日[昇順]' => 'birthday asc', 
      '5: 誕生日[降順]' => 'birthday desc'
    )
    
    def build(options = nil)
      st = []
      st << 'name like :name' if name && !name.empty?
      self.conditions = st
    end
  end

  def test_OrderableFinder2_order
    assert_equal 1, OrderableFinder2.default_order_option_index
    f = OrderableFinder2.new
    assert_equal 1, f.order_index
    assert_equal([
      ['1: 名前', 1],
      ['2: 電話番号', 2],
      ['3: メール', 3],
      ['4: 誕生日[昇順]', 4],
      ['5: 誕生日[降順]', 5]
    ], f.order_option_names)
    assert_equal([
      ['名前', 1],
      ['電話番号', 2],
      ['メール', 3],
      ['誕生日[昇順]', 4],
      ['誕生日[降順]', 5]
    ], f.order_option_names(:text, :index))
    assert_equal 1, f.order_index
    assert_equal 'name', f.order
    assert_equal({:order_index => 1}, f.to_params)
    
    f = OrderableFinder2.new({:order_index => 4})
    assert_equal 4, f.order_index 
    assert_equal 'birthday asc', f.order
    assert_equal({:order_index => 4}, f.to_params)
  end
  
  def test_OrderableFinder2_options_to_find
    f = OrderableFinder2.new
    assert_equal({
      # :conditions => nil,
      :order => 'name' 
    }, f.options_to_find)
    assert_equal({:order_index => 1}, f.to_params)
    
    f = OrderableFinder2.new :name => '山田'
    assert_equal({
      :conditions => ['name like :name', {:name => '%山田%'}],
      :order => 'name' 
    }, f.options_to_find)
    assert_equal({:order_index => 1, :name => '山田'}, f.to_params)
    
    f = OrderableFinder2.new :name => '田中 健'
    assert_equal({
      :conditions => ['(name like :name1 and name like :name2)', 
        {:name1 => '%田中%', :name2 => '%健%'}],
      :order => 'name' 
    }, f.options_to_find)
    assert_equal({:order_index => 1, :name => '田中 健'}, f.to_params)
  end
  
  
  
  class ComplexFinder3 < ArFinder
    parameter :ids, :filter => Proc.new{|v| v.to_i }, :delimiter => ','
    parameter :name, :filter => '%#{value}%', :delimiter => ' '
    parameter :tel, :filter => '%#{value}%', :delimiter => ' '
    parameter :email, :filter => '%#{value}%', :delimiter => ' '
    parameter :deleted, :excluded => true, :options => 
      {'1: 削除された人を含めない' => 1, '2: 削除された人を含める' => 2, '3: 削除された人のみ' => 3}
    
    order_options(
      '1: 名前' => 'name, id desc', 
      '2: 電話番号' => 'tel', 
      '3: メール' => 'email'
    )
    
    TEL_JOIN = 'inner join telephones as tel on tel.person_id = people.id'
    def build(options = nil)
      st = []
      st << 'id in (:ids)' if ids && !ids.empty?
      st << 'name like :name' if name && !name.empty?
      ((self.joins ||= []) << TEL_JOIN; st << 'tel.tel_number like :tel') if tel && !tel.empty?
      st << 'deleted <> 1' if deleted == 1
      st << 'deleted = 1' if deleted == 3
      self.conditions = st
    end
  end

  def test_ComplexFinder3_options_to_find
    assert_equal [['1: 名前', 1], ['2: 電話番号', 2], ['3: メール', 3]], 
      ComplexFinder3.order_option_names
    assert_equal [['1: 削除された人を含めない', 1], ['2: 削除された人を含める', 2], ['3: 削除された人のみ', 3]], 
      ComplexFinder3.deleted_option_names

    f = ComplexFinder3.new :name => '佐藤', :tel => '03-'
    assert_equal ComplexFinder3.order_option_names, f.order_option_names
    assert_equal ComplexFinder3.deleted_option_names, f.deleted_option_names
    assert_equal 1, f.order_index
    assert_equal 'name, id desc', f.order
    assert_equal 1, f.deleted_index
    assert_equal 1, f.deleted

    assert_equal({
      :conditions => ['name like :name and tel.tel_number like :tel and deleted <> 1', {:name => '%佐藤%', :tel => '%03-%'}],
      :joins => 'inner join telephones as tel on tel.person_id = people.id',
      :order => 'name, id desc' 
    }, f.options_to_find)
    assert_equal({:order_index => 1, :deleted => 1, :name => '佐藤', :tel => '03-'}, f.to_params)

    f = ComplexFinder3.new :ids => '1,5,9', :name => '佐藤', :tel => '03-', :deleted => 2
    assert_equal({
      :conditions => ['id in (:ids) and name like :name and tel.tel_number like :tel', 
        {:ids => [1,5,9], :name => '%佐藤%', :tel => '%03-%'}],
      :joins => 'inner join telephones as tel on tel.person_id = people.id',
      :order => 'name, id desc' 
    }, f.options_to_find)
    assert_equal({:order_index => 1, :ids => '1,5,9', :name => '佐藤', :tel => '03-', :deleted => 2}, f.to_params)
  end
  
  class ComplexFinder4 < ArFinder
    parameter :ids, include_in(','){|v|v.to_i}
    parameter :name, like(' ')
    parameter :tel, like_include(' ')
    parameter :email, like_include(' ')
    parameter :deleted, :excluded => true, :options => 
      {'1: 削除された人を含めない' => 1, '2: 削除された人を含める' => 2, '3: 削除された人のみ' => 3}
    
    order_options(
      '1: 名前' => 'name, id desc', 
      '2: 電話番号' => 'tel', 
      '3: メール' => 'email'
    )
    
    TEL_JOIN = 'inner join telephones as tel on tel.person_id = people.id'
    def build(options = nil)
      st = []
      st << 'id in (:ids)' if ids && !ids.empty?
      st << 'name like :name' if name && !name.empty?
      ((self.joins ||= []) << TEL_JOIN; st << 'tel.tel_number like :tel') if tel && !tel.empty?
      st << 'deleted <> 1' if deleted == 1
      st << 'deleted = 1' if deleted == 3
      self.conditions = st
    end
  end

  def test_ComplexFinder4_options_to_find
    f = ComplexFinder4.new :name => '佐藤 健', :ids => '1,2,3,4', :tel => '03-'
    assert_equal({
      :conditions => ['id in (:ids) and (name like :name1 and name like :name2) and tel.tel_number like :tel', 
        {:ids => [1,2,3,4], :name1 => '%佐藤%', :name2 => '%健%', :tel => '%03-%'}],
      :joins => 'inner join telephones as tel on tel.person_id = people.id',
      :order => 'name, id desc'
    }, f.options_to_find)
    assert_equal({:order_index => 1, :name => '佐藤 健', :ids => '1,2,3,4', :tel => '03-', :deleted => 1}, f.to_params)

    f = ComplexFinder4.new :ids => '1,5,9', :name => '佐藤', :tel => '03-', :deleted => 3 
    assert_equal({
      :conditions => ['id in (:ids) and name like :name and tel.tel_number like :tel and deleted = 1', 
        {:ids => [1,5,9], :name => '%佐藤%', :tel => '%03-%'}],
      :joins => 'inner join telephones as tel on tel.person_id = people.id',
      :order => 'name, id desc' 
    }, f.options_to_find)
    assert_equal({:order_index => 1, :ids => '1,5,9', :name => '佐藤', :tel => '03-', :deleted => 3}, f.to_params)
  end


  class ComplexFinder5 < ArFinder
    select 'people.*'
    
    parameter :ids, include_in(',', :column => 'id'){|v|v.to_i}
    parameter :name, like(' ')
    parameter :tel, like_include(' ', :column => 'tel.tel_number', :join => 'inner join telephones as tel on tel.person_id = people.id')
    parameter :email, like_include(' ')
    parameter(:deleted, :excluded => true, :options => 
      {'1: 削除された人を含めない' => 1, '2: 削除された人を含める' => 2, '3: 削除された人のみ' => 3}) do
        def condition(finder)
          finder.deleted == 1 ? 'deleted <> 1' : 
            finder.deleted == 3 ? 'deleted = 1' : nil 
        end
      end
    
    order_options(
      '1: 名前' => 'name, id desc', 
      '2: 電話番号' => 'tel', 
      '3: メール' => 'email'
    )
  end

  def test_ComplexFinder5_options_to_find
    assert_equal nil, ComplexFinder5.deleted_default_index
    assert_equal 1, ComplexFinder5.deleted_for(1)
    assert_equal 2, ComplexFinder5.deleted_for(2)
    assert_equal 3, ComplexFinder5.deleted_for(3)
    assert_equal [['1: 削除された人を含めない', 1], ['2: 削除された人を含める', 2], ['3: 削除された人のみ', 3]], ComplexFinder5.deleted_option_names
    assert_equal [['削除された人を含めない', 1], ['削除された人を含める', 2], ['削除された人のみ', 3]], ComplexFinder5.deleted_option_names(:text, :index)

    f = ComplexFinder5.new :name => '佐藤 健', :ids => '1,2,3,4', :tel => '03-', :deleted_index => 1
    assert_equal({
      :select => 'people.*',
      :conditions => ['id in (:ids) and (name like :name1 and name like :name2) and tel.tel_number like :tel and deleted <> 1', 
        {:ids => [1,2,3,4], :name1 => '%佐藤%', :name2 => '%健%', :tel => '%03-%'}],
      :joins => 'inner join telephones as tel on tel.person_id = people.id',
      :order => 'name, id desc'
    }, f.options_to_find)
    assert_equal({:order_index => 1, :name => '佐藤 健', :ids => '1,2,3,4', :tel => '03-', :deleted => 1}, f.to_params)
  end

  class ComplexFinder6 < ArFinder
    select 'people.*'
    
    parameter :ids, include_in(',', :column => 'id'){|v|v.to_i}
    parameter :name, like(' ')
    parameter :tel, like_include(' ', :column => 'tel.tel_number', :join => 'inner join telephones as tel on tel.person_id = people.id')
    parameter :email, like_include(' ')
    parameter(:party_types, include_in(',', 
      :checkables => {'1: 個人' => 'person', '2: 会社' => 'company', '3: 役所' => 'government'}) )
    
    order_options('1: 名前' => 'name, id desc', '2: 電話番号' => 'tel', '3: メール' => 'email')
  end

  def test_ComplexFinder6_options_to_find
    assert_equal nil, ComplexFinder6.party_type_default_indexes
    assert_equal 'person', ComplexFinder6.party_type_for(1)
    assert_equal 'company', ComplexFinder6.party_type_for(2)
    assert_equal 'government', ComplexFinder6.party_type_for(3)
    assert_equal ['company', 'government'], ComplexFinder6.party_types_for(2,3)
    assert_equal ['company', 'government'], ComplexFinder6.party_types_for([2,3])
    assert_equal [['個人', 1], ['会社', 2], ['役所', 3]], ComplexFinder6.party_type_option_names
    assert_equal [['個人', 1], ['会社', 2], ['役所', 3]], ComplexFinder6.party_type_option_names(:text, :index)
    assert_equal [['個人'], ['会社'], ['役所']], ComplexFinder6.party_type_option_names(:text)
    assert_equal [['1: 個人', 1], ['2: 会社', 2], ['3: 役所', 3]], ComplexFinder6.party_type_option_names(:index_text, :index)
    assert_equal [['個人', 'person'], ['会社', 'company'], ['役所', 'government']], ComplexFinder6.party_type_option_names(:text, :value)
    assert_equal [[1, '個人', 'person'], [2, '会社', 'company'], [3, '役所', 'government']], ComplexFinder6.party_type_option_names(:index, :text, :value)
    
    f = ComplexFinder6.new :name => '佐藤 健', :ids => '1,2,3,4', :tel => '03-', :party_type_indexes => '1,3'
    assert_equal [1,3], f.party_type_indexes
    
    assert_equal({
      :select => 'people.*',
      :conditions => ['id in (:ids) and (name like :name1 and name like :name2) and tel.tel_number like :tel and party_types in (:party_types)', 
        {:ids => [1,2,3,4], :name1 => '%佐藤%', :name2 => '%健%', :tel => '%03-%', :party_types => ['person','government']}],
      :joins => 'inner join telephones as tel on tel.person_id = people.id',
      :order => 'name, id desc'
    }, f.options_to_find)
    assert_equal({:order_index => 1, :name => '佐藤 健', :ids => '1,2,3,4', :tel => '03-', :party_types => ['person','government']}, f.to_params)
  end
end
