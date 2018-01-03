class CreateRoutes < ActiveRecord::Migration[5.1]
  def change
    create_table :routes do |t|
      t.references :mode, foreign_key: true
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
