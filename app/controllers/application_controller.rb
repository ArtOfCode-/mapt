# frozen_string_literal: true

class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?

  def missing_role; end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:username])
  end

  Role.defaults.each do |r|
    define_method "require_#{r}" do
      unless current_user&.has_role?(r)
        @roles = [r]
        render :missing_role
      end
    end
  end
end
