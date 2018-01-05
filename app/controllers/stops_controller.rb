class StopsController < ApplicationController
  before_action :require_admin
  before_action :set_stop_by_location, only: [:destroy]

  def create
    @stop = Stop.new stop_params
    if @stop.save
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
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

  def stop_params
    params.require(:stop).permit(:lat, :long, :name, :description, :line_id)
  end
end
