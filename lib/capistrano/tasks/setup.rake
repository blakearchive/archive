namespace :setup do

    task :start do
        invoke 'db:seed'
        invoke 'solr:update'
    end

end