class StopsController < ApplicationController
  before_action :require_admin
  before_action :set_stop_by_location, only: [:delete]
  before_action :set_stop, only: [:move]

  def create
    @stop = Stop.new stop_params
    if @stop.save
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
  end

  def move
    max = @stop.line.stops.where(direction: @stop.direction).maximum(:index)
    new_max = @stop.index == max ? max : max + 1
    new_index = if params[:change].present?
                  [[0, @stop.index + params[:change].to_i].max, new_max].min
                elsif params[:absolute].present?
                  as_int = params[:absolute].to_i
                  if as_int == -1
                    as_int = max + 1
                  end
                  [[0, as_int].max, new_max].min
                end
    if @stop.update index: new_index
      render json: { success: true, position: new_index }
    else
      render json: { success: false }, status: 500
    end
  end

  def clone
    @line = Line.find params[:line_id]
    existing_direction = @line.stops.select('DISTINCT direction')[0].direction
    clone_direction = existing_direction == 'Outbound' ? 'Return' : 'Outbound'
    @stops = @line.stops.where(direction: existing_direction)
    idx = 0
    new_records = []
    @stops.order(index: :desc).each do |s|
      new_attribs = s.attributes.with_indifferent_access.slice :name, :lat, :long, :line_id
      new_attribs.merge! stop_id: s.id, direction: clone_direction, index: idx
      new_records << new_attribs
      idx += 1
    end

    if Stop.create new_records
      flash[:success] = 'Cloned stops list.'
    else
      flash[:danger] = 'Failed to clone stops list.'
    end
    redirect_to line_path(@line)
  end

  def destroy
    if @stop.destroy
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
  end

  private

  def set_stop_by_location
    @stop = Stop.find_by lat: params[:lat], long: params[:long]
  end

  def set_stop
    @stop = Stop.find params[:id]
  end

  def stop_params
    params.require(:stop).permit(:lat, :long, :name, :description, :line_id, :direction)
  end
end
