class RemoveTypeFromModes < ActiveRecord::Migration[5.1]
  def change
    remove_column :modes, :type
  end
end
