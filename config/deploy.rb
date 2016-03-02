# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'blake-archive'
set :user, 'swallow'
set :repo_url, 'git@github.com:blakearchive/archive.git'

# Default branch is :master

# set :linked_dirs, %w{data}
# set :linked_files, %w{blakearchive/config.py}
set :format, :pretty
set :log_level, :debug
set :pty, true

set :keep_releases, 5

set :deploy_to, "/net/deploy/#{fetch(:stage)}/#{fetch(:application)}"


after 'deploy:finishing', 'deploy:cleanup'