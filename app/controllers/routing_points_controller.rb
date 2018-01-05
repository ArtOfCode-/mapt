class RoutingPointsController < ApplicationController
  before_action :require_admin
  before_action :set_point_by_location, only: [:destroy]

  def create
    @point = RoutingPoint.new point_params
    if @point.save
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
  end

  def destroy
    if @point.destroy
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
  end

  private

  def set_point_by_location
    @point = RoutingPoint.find_by lat: params[:lat], long: params[:long]
  end

  def point_params
    params.require(:routing_point).permit(:lat, :long, :line_id)
  end
end
