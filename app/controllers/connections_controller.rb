class ConnectionsController < ApplicationController
  before_action :require_admin
  before_action :set_connection

  def destroy
    if @connection.destroy
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
  end

  def toggle_change
    if @connection.update change_required: !@connection.change_required
      render json: { success: true }
    else
      render json: { success: false }, status: 500
    end
  end

  private

  def set_connection
    @connection = Connection.find params[:id]
  end
end
