class CreateModes < ActiveRecord::Migration[5.1]
  def change
    create_table :modes do |t|
      t.string :type
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
