class CreateStops < ActiveRecord::Migration[5.1]
  def change
    create_table :stops do |t|
      t.references :route, foreign_key: true
      t.string :direction
      t.string :name
      t.decimal :lat
      t.decimal :long

      t.timestamps
    end
  end
end
