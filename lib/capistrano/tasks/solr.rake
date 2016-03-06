namespace :solr do

    desc 'Symlink the solr schema configs'
    task :symlink do
        info 'Symlinking solr conf files'
        on roles(:local) do |h|
            info 'Symlinking solr conf files'
            run_locally do
                solr_conf_path = "#{fetch(:solr_path)}/server/solr"
                execute :ln, '-nfs', "#{fetch(:code_path)}/blake-object/conf","#{fetch(:solr_conf_path)}/blake_object/conf"
                execute :ln, '-nfs', "#{fetch(:code_path)}/blake-work/conf","#{fetch(:solr_conf_path)}/blake_work/conf"
            end
        end

        on roles(:app) do |h|
            info 'Symlinking solr conf files'
            solr_conf_path = "#{fetch(:solr_path)}/solr/data"
            execute :ln, '-nfs', "#{current_path}/blake-object/conf","#{fetch(:solr_path)}/blake_object/conf"
            execute :ln, '-nfs', "#{current_path}/blake-work/conf","#{fetch(:solr_path)}/blake_work/conf"
        end
    end

    desc 'Restart Solr'
    task :restart do
        info 'restarting solr service'
        on roles(:local) do |h|
            info 'restarting solr service'
            run_locally do
                execute "cd #{fetch(:solr_path)}; bin/solr restart;"
            end
        end

        on roles(:app) do |h|
            info 'restarting solr service'
            # need command for restarting solr
        end
    end

    desc 'Update Solr'
    task :update do
        info 'Updating Solr'
        invoke (solr:symlink)
        invole (solr:restart)
    end
end



