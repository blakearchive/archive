# config valid only for current version of Capistrano
lock '3.4.0'
require 'yaml'

set :cap_config, YAML.load_file('config/cap_config.yml')

set :application, 'blake-archive'
set :server, fetch(:cap_config)["#{fetch(:stage)}"]['server']
set :deploy_to, "#{fetch(:cap_config)["#{fetch(:stage)}"]['deploy_dir']}/#{fetch(:stage)}/#{fetch(:application)}"

set :user, fetch(:cap_config)["#{fetch(:stage)}"]['user']
set :group, fetch(:cap_config)["#{fetch(:stage)}"]['group']

set :repo_url, 'git@github.com:blakearchive/archive.git'

set :webdata_dir, fetch(:cap_config)["#{fetch(:stage)}"]['webdata_dir']
set :solr_dir, fetch(:cap_config)["#{fetch(:stage)}"]['solr_dir']
set :restart, fetch(:cap_config)["#{fetch(:stage)}"]['restart']

set :format, :pretty
set :log_level, :debug
set :pty, true

set :keep_releases, 5

namespace :deploy do

    desc 'Symlink the config and current'
    task :symlink do
        on roles(:app) do |h|
            info 'symlinking config'
            execute :ln, '-nfs', "#{shared_path}/config_#{fetch(:stage)}.py", "#{current_path}/blakearchive/config.py"

            info 'symlinking code to current release'
            execute :ln, '-nfs', "#{current_path}", "#{fetch(:webdata_dir)}"
        end
    end

    desc 'Restart python'
    task :restart do
        on roles(:app) do |h|
            info 'restarting application'
            execute "#{fetch(:restart)}"
        end
    end


    #######
    # this won't work because cap would need to push the minified files to the remote repo
    # desc 'Run Gulp tasks'
    # task :gulp do
        # run_locally do
            # info 'Minifying scripts'
            # execute :gulp
        # end
    # end
    ########

end

# before 'deploy:starting', 'deploy:gulp'
after 'deploy:finishing', 'deploy:symlink'
after 'deploy:finishing', 'deploy:restart'
after 'deploy:finishing', 'deploy:cleanup'