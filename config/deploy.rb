# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'blake-archive'
set :user, 'swallow'
set :repo_url, 'git@github.com:blakearchive/archive.git'

# Default branch is :master

# set :linked_dirs, %w{data}
# set :linked_files, %w{"blakearchive/config_qa.py"}
set :format, :pretty
set :log_level, :debug
set :pty, true
set :branch, 'capistrano'

set :keep_releases, 5

set :deploy_to, "/net/deploy/#{fetch(:stage)}/#{fetch(:application)}"

namespace :deploy do

    desc 'Symlink the solr schema files'
    task :symlinkSolr do
        on roles(:app) do |h|
            info 'Symlinking solr schema files'

            # execute :ln, '-nfs', "#{current_path}/blake-object/schema.xml","/data/solr/data/blake_object/schema.xml"
            # execute :ln, '-nfs', "#{current_path}/blake-work/schema.xml","/data/solr/data/blake_work/schema.xml"

        end
    end
end


after 'deploy:finishing', 'deploy:symlinkSolr'
after 'deploy:finishing', 'deploy:cleanup'