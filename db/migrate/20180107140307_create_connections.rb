class CreateConnections < ActiveRecord::Migration[5.1]
  def change
    create_table :connections do |t|
      t.bigint :from_id
      t.bigint :to_id
      t.boolean :change_required

      t.timestamps
    end
  end
end
