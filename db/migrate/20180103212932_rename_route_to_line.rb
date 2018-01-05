class RenameRouteToLine < ActiveRecord::Migration[5.1]
  def change
    rename_table :routes, :lines
    rename_column :stops, :route_id, :line_id
  end
end
