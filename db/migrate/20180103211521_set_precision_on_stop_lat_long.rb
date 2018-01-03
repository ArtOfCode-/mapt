class SetPrecisionOnStopLatLong < ActiveRecord::Migration[5.1]
  def change
    change_column :stops, :lat, :decimal, precision: 15, scale: 12
    change_column :stops, :long, :decimal, precision: 15, scale: 12
  end
end
