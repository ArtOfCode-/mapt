class AddIconToModes < ActiveRecord::Migration[5.1]
  def change
    add_column :modes, :icon, :string
  end
end
