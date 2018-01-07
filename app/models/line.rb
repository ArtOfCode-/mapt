class Line < ApplicationRecord
  belongs_to :mode
  has_many :stops
  has_many :routing_points
  has_many :connections_out, class_name: 'Connection', foreign_key: :from_id
  has_many :connections_in, class_name: 'Connection', foreign_key: :to_id

  def connections
    Connection.where(id: connections_out.map(&:id) + connections_in.map(&:id))
  end

  def generate_connections
    stops.each do |s|
      s.lines.each do |l|
        next if l == self
        next if Connection.where(stop: s, from: self, to: l).or(Connection.where(stop: s, from: l, to: s)).exist?

        Connection.create(stop: s, from: self, to: l, change_required: true)
      end
    end
  end
end
