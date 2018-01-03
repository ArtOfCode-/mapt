# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users

  scope 'modes' do
    root               to: 'modes#index',   as: :modes
    get    'new',      to: 'modes#new',     as: :new_mode
    post   'new',      to: 'modes#create',  as: :create_mode
    get    ':id/edit', to: 'modes#edit',    as: :edit_mode
    patch  ':id/edit', to: 'modes#update',  as: :update_mode
    delete ':id',      to: 'modes#destroy', as: :destroy_mode
  end
end
