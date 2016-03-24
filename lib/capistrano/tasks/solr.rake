namespace :solr do

    desc 'Symlink the solr schema configs'
    task :symlink do
        on roles(:local) do |h|
            info 'Symlinking solr conf files'
            run_locally do
                execute :ln, '-nfs', "#{fetch(:code_path)}/solr/blake-object/conf","#{fetch(:solr_dir)}/blake_object/conf"
                execute :ln, '-nfs', "#{fetch(:code_path)}/solr/blake-work/conf","#{fetch(:solr_dir)}/blake_work/conf"
            end
        end

        on roles(:app) do |h|
            info 'Symlinking solr conf files'
            execute :ln, '-nfs', "#{current_path}/solr/blake-object/conf","#{fetch(solr_conf_path)}/blake_object/conf"
            execute :ln, '-nfs', "#{current_path}/solr/blake-work/conf","#{fetch(solr_conf_path)}/blake_work/conf"
        end
    end

    desc 'Restart Solr'
    task :restart do
        on roles(:local) do |h|
            info 'restarting solr service'
            run_locally do
                # need command
            end
        end

        on roles(:app) do |h|
            info 'restarting solr service'
            # need command for restarting solr
        end
    end

    desc 'Update Solr'
    task :update do
        invoke 'solr:symlink'
        invoke 'solr:restart'
    end
end



