# frozen_string_literal: true

source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

gem 'coffee-rails', '~> 4.2'
gem 'config', '~> 1.4'
gem 'jbuilder', '~> 2.5'
gem 'mysql2', '~> 0.4.10'
gem 'puma', '~> 3.7'
gem 'rails', '~> 5.1.4'
gem 'redis', '~> 3.0'
gem 'sass-rails', '~> 5.0'
gem 'turbolinks', '~> 5'
gem 'uglifier', '>= 1.3.0'
gem 'webpacker', '~> 3.0'

gem 'devise', '~> 4.2'
gem 'rolify', '~> 5.1'

gem 'will_paginate', '~> 3.0'
gem 'will_paginate-bootstrap', '~> 1.0'

gem 'foreman', '~> 0.84'

group :development, :test do
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'capybara', '~> 2.13'
  gem 'rubocop', '~> 0.49.1'
  gem 'selenium-webdriver'
end

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'web-console', '>= 3.3.0'
end

gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
