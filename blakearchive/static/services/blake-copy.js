angular.module("blake").factory("BlakeCopy", function (GenericService) {
    /**
     * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
     * BlakeObjects.
     *
     * @param config
     */
    var constructor = function (config) {
        var copy = angular.copy(config);
        copy.header = angular.fromJson(config.header);
        copy.source = angular.fromJson(config.source);

        /*if (config.objects) {
         for (i = 0; i < config.objects.length; i++) {
         copy.objects.push(BlakeObject.create(config.objects[i]));
         }
         }*/
        //FIXME:: Figure out why the Laocoon work's title isn't getting encoded in utf8
        if(copy.title == "LaocoÃ¶n"){
            copy.title = "Laocoön";
        }
        switch (copy.archive_copy_id) {
            case 'biblicalwc':
            case 'biblicaltemperas':
            //case 'but543':
            case 'letters':
            case 'gravepd':
            case 'pid':
            case 'gravewc':
            case 'gravewd':
            case 'cpd':
            case 'pencil1':

            case 'allegropenseroso':
            case 'miltons':
                copy.virtual = true;
                break;
            default:
                copy.virtual = false;
                break;
        }

        return copy;
    };

    return GenericService(constructor);
});