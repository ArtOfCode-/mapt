class Route < ApplicationRecord
  belongs_to :mode
  has_many :stops
end
