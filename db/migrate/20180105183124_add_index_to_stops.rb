class AddIndexToStops < ActiveRecord::Migration[5.1]
  def change
    add_column :stops, :index, :integer
  end
end
