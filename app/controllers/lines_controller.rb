class LinesController < ApplicationController
  before_action :require_admin, except: [:show]
  before_action :set_line, except: [:index, :new, :create]

  def index
    @lines = Line.all.includes(:mode).includes(:stops).includes(:routing_points).paginate(page: params[:page], per_page: 21)
  end

  def new
    @line = Line.new
  end

  def create
    @line = Line.new line_params
    if @line.save
      flash[:success] = 'Line saved.'
      redirect_to line_path(@line)
    else
      flash[:danger] = 'Failed to save line.'
      render :new
    end
  end

  def show
    @directions = @line.stops.select('DISTINCT direction')
    @stops = @directions.map { |d| [d.direction, @line.stops.where(direction: d.direction).order(:index)] }.to_h
  end

  def edit; end

  def update
    if @line.update line_params
      flash[:success] = 'Line saved.'
      redirect_to line_path(@line)
    else
      flash[:danger] = 'Failed to save line.'
      render :edit
    end
  end

  def destroy
    if @line.destroy
      flash[:success] = 'Removed line.'
    else
      flash[:danger] = 'Failed to remove line.'
    end
    redirect_to lines_path
  end

  private

  def set_line
    @line = Line.find params[:id]
  end

  def line_params
    params.require(:line).permit(:mode_id, :name, :description)
  end
end
