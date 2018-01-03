class ModesController < ApplicationController
  before_action :require_admin
  before_action :set_mode, only: [:edit, :update, :destroy]

  def index
    @modes = Mode.all
  end

  def new
    @mode = Mode.new
  end

  def create
    @mode = Mode.new mode_params
    if @mode.save
      flash[:success] = 'Created travel mode.'
      redirect_to modes_path
    else
      flash[:danger] = 'Failed to save travel mode.'
      render :new
    end
  end

  def edit; end

  def update
    if @mode.update mode_params
      flash[:success] = 'Updated travel mode successfully.'
      redirect_to modes_path
    else
      flash[:danger] = 'Failed to save travel mode.'
      render :edit
    end
  end

  def destroy
    if @mode.destroy
      flash[:success] = 'Removed travel mode.'
      success = true
    else
      flash[:danger] = 'Failed to remove travel mode.'
      success = false
    end
    render json: { success: success }, status: success ? 200 : 500
  end

  private

  def mode_params
    params.require(:mode).permit(:name, :description, :icon)
  end

  def set_mode
    @mode = Mode.find params[:id]
  end
end
