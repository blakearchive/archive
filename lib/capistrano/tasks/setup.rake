namespace :setup do

    task :start do
        invoke 'solr:update'
        invoke 'db:seed'
    end

end