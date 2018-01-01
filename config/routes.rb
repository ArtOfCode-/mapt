# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users

  scope 'modes' do
    root to: 'modes#index', as: :modes
  end
end
