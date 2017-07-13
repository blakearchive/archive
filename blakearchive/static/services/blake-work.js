angular.module("blake").factory("BlakeWork", function (GenericService, BlakeCopy) {
        /**
         * Constructor takes a config object and creates a BlakeWork, with child objects transformed into the
         * BlakeCopies.
         *
         * @param config
         */
        var constructor = function (config) {

            var work = angular.copy(config);

            // Get the medium and probable phrase
            switch(work.medium) {
                case "illbk":
                    work.medium_pretty = 'Illuminated Books';
                    work.probable = 'printing';
                    break;
                case "comb":
                case "comdes":
                case "comeng":
                    work.medium_pretty = 'Commercial Book Illustrations';
                    work.probable = 'printing';
                    break;
                case "spb":
                case "spdes":
                case "speng":
                case "cprint":
                    work.medium_pretty = 'Prints';
                    work.probable = 'composition';
                    break;
                case "mono":
                case "paint":
                case "pen":
                case "penink":
                case "penc":
                case "wc":
                    work.medium_pretty = 'Drawings and Paintings';
                    work.probable = 'composition';
                    break;
                case "ms":
                case "ltr":
                case "te":
                    work.medium_pretty = 'Manuscripts and Typographic Works';
                    work.probable = 'composition';
                    break;
                case "exhibit":
                    work.medium_pretty = "Archive Exhibits";
                    work.probable = 'composition';
                    break;
                default:
                    return false;
            }

            //Create an alternative work title for virtual works
            work.menuTitle = work.title;
            //FIXME:: Figure out why the Laocoon work's title isn't getting encoded in utf8
            if(work.title == "LaocoÃ¶n"){
                work.title = "Laocoön";
                work.menuTitle = "Laocoön";
            }
            switch (work.bad_id) {
                case 'biblicalwc':
                    work.title = 'Water Color Drawings Illustrating the Bible';
                    work.virtual = true;
                    break;
                case 'biblicaltemperas':
                    work.title = 'Paintings Illustrating the Bible';
                    work.virtual = true;
                    break;
                case 'but543':
                    work.title = 'Illustrations to Milton\'s "On the Morning of Christ\'s Nativity"';
                    work.virtual = false;
                    break;
                case 'pid':
                    work.title = 'Pen and Ink Drawings';
                    work.virtual = true;
                    break;
                case 'letters':
                case 'gravepd':
                case 'gravewc':
                case 'gravewd':
                case 'cpd':
                case 'allegropenseroso':
                case 'miltons':
                    work.virtual = true;
                    break;
                default:
                    work.virtual = false;
                    break;
            }

            angular.forEach(work.related_works, function(v){
                v.displayTitle = v.title.text != '' ? v.title.text : false;
                if (v.title.link){
                    switch(v.title.type){
                        case 'work':
                            v.type = 'work';
                            v.link = "/work/" + v.title.link;
                            break;
                        case 'copy':
                            v.type = 'copy';
                            v.link = "/copy/" + v.title.link;
                            break;
                        case 'object':
                            v.type = 'object';
                            v.link = v.title.link;
                            break;
                        default:
                            v.type = "none";
                            v.link = false;
                    }
                } else {
                    if(v.title.text.substring(0,4).toLowerCase() == 'copy' || v.info.substring(0,4).toLowerCase() == 'copy'){
                        v.type = "copy";
                    } else {
                        v.type = "none";
                    }
                    v.link = false;
                }
            });

            return work;
        };

        return GenericService(constructor);
    });