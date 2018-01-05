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

  scope 'lines' do
    root               to: 'lines#index',   as: :lines
    get    'new',      to: 'lines#new',     as: :new_line
    post   'new',      to: 'lines#create',  as: :create_line
    get    ':id',      to: 'lines#show',    as: :line
    get    ':id/edit', to: 'lines#edit',    as: :edit_line
    patch  ':id/edit', to: 'lines#update',  as: :update_line
    delete ':id',      to: 'lines#destroy', as: :destroy_line
  end

  scope 'stops' do
    post   'new',      to: 'stops#create',  as: :new_stop
    post   ':id/move', to: 'stops#move',    as: :move_stop
    post   'clone',    to: 'stops#clone',   as: :clone_stops
    delete 'location', to: 'stops#destroy', as: :destroy_stop
  end

  scope 'points' do
    post   'new',      to: 'routing_points#create',  as: :new_point
    delete 'location', to: 'routing_points#destroy', as: :destroy_point
  end
end
