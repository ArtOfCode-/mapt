class Connection < ApplicationRecord
  belongs_to :from, class_name: 'Line'
  belongs_to :to, class_name: 'Line'
  belongs_to :stop

  def other_line(line)
    line == from ? to : from
  end

  def self.exist?(**opts)
    from = opts[:from]
    to = opts[:to]
    stop = opts[:stop]

    stops = stop.stop.present? ? ([stop.stop.id] + stop.stop.stops.map(&:id)).compact.uniq : ([stop.id] + stop.stops.map(&:id)).compact.uniq
    where(from: from, to: to, stop: stops).or(where(from: to, to: from, stop: stops)).exists?
  end

  def self.valid?(**opts)
    opts[:from] != opts[:to] && !exist?(**opts)
  end
end
