class AddStopToStops < ActiveRecord::Migration[5.1]
  def change
    add_reference :stops, :stop, foreign_key: true
  end
end
