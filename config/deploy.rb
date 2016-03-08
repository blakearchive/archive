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
set :solr_path, '/data'

namespace :deploy do

    desc 'Symlink the config and current'
    task :symlink do
        on roles(:app) do |h|
            info 'symlinking config'
            execute :ln, '-nfs', "#{shared_path}/config_#{fetch(:stage)}.py", "#{current_path}/blakearchive/config.py"

            info 'symlinking code to current release'
            execute :ln, '-nfs', "#{current_path}", "/htdocs/webdata/blake"
        end
    end

    desc 'Restart python'
    task :restart do
        on roles(:app) do |h|
            info 'restarting application'
            execute "/usr/local/bin/bounce-webserver.sh graceful"
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

    ####
    # Need script to run /usr/local/bin/bounce-webserver.sh graceful to restart server
    ###

end

# before 'deploy:starting', 'deploy:gulp'
after 'deploy:finishing', 'deploy:symlink'
after 'deploy:finishing', 'deploy:restart'
after 'deploy:finishing', 'deploy:cleanup'