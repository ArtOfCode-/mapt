class Stop < ApplicationRecord
  belongs_to :line
  belongs_to :stop, required: false
  has_many :stops, dependent: :nullify
  has_many :connections, dependent: :destroy

  after_create do
    idx = (line.stops.where(direction: direction).maximum(:index) || -1) + 1

    link_to = link_stop(false)

    update index: idx, stop_id: link_to
  end

  after_create do
    lines.each do |l|
      next unless Connection.valid?(from: line, to: l, stop: self)
      Connection.create(from: line, to: l, stop: self, change_required: true)
    end
  end

  def lines
    ids = stop.present? ? ([stop.line_id] + stop.stops.map(&:line_id)).uniq : [line.id]
    Line.where id: ids
  end

  def all_connections
    ids = stop_id.present? ? stop.connections.map(&:id) + stop.stops.map { |s| s.connections.map(&:id) }.flatten :
                             connections.map(&:id) + stops.map { |s| s.connections.map(&:id) }.flatten
    Connection.where(id: ids)
  end

  def link_stop(do_update = true)
    linkable = Stop.where(name: name).where("SQRT(POW(#{lat} - lat, 2) + POW(#{long} - `long`, 2)) <= 0.001")
    ids = linkable.map(&:stop_id).compact.reject { |x| x == id }
    link_to = ids.size > 0 ? ids[0] : nil

    if do_update
      update stop_id: link_to
    end
    link_to
  end
end
