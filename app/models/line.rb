class Line < ApplicationRecord
  belongs_to :mode
  has_many :stops
  has_many :routing_points
end
