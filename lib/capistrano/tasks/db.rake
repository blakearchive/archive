namespace :db do

    desc 'Seed the database'
    task :seed do
        run_locally do
            info 'pulling latest blake data'
            execute "git submodule foreach git pull origin master"
        end

        on roles(:local) do |h|
            info 'Seeding Postgres DB'
            run_locally do
                execute "cd #{fetch(:code_path)}/blakearchive/; python import.py '../data/works/*.xml' '../data/info/*.xml'; python solrimport.py; python homepageimport.py;"
            end
        end

        on roles(:app) do |h|
            info 'Seeding Postgres DB'
            execute "cd #{current_path}/blakearchive/; python import.py '../data/works/*.xml' '../data/info/*.xml'; python solrimport.py; python homepageimport.py;"
        end
    end
end