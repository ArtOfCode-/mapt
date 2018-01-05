class CreateRoutingPoints < ActiveRecord::Migration[5.1]
  def change
    create_table :routing_points do |t|
      t.references :line, foreign_key: true
      t.decimal :lat
      t.decimal :long

      t.timestamps
    end
  end
end
