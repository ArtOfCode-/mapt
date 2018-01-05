class Stop < ApplicationRecord
  belongs_to :line
  belongs_to :stop, required: false
  has_many :stops

  after_create do
    idx = (line.stops.where(direction: direction).maximum(:index) || -1) + 1
    update index: idx
  end
end
