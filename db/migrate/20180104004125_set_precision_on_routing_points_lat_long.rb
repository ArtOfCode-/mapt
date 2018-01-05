class SetPrecisionOnRoutingPointsLatLong < ActiveRecord::Migration[5.1]
  def change
    change_column :routing_points, :lat, :decimal, precision: 15, scale: 12
    change_column :routing_points, :long, :decimal, precision: 15, scale: 12
  end
end
