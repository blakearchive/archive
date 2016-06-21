(function() {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams,BlakeDataService) {

        var vm = this;
        vm.bds = BlakeDataService;
        var title = "";
        var copyPhrase = "";
        $rootScope.showOverlay = false;

        if(!angular.isDefined($rootScope.view)){
            $rootScope.view = {
                mode: 'object',
                scope: 'image'
            }
        }

        vm.setWork = function(){
            //console.log(id);
            vm.bds.setSelectedWork(vm.bds.work.bad_id);
            var workVars = getWorkTypeVars(vm.bds.work.medium);
            vm.bds.work.medium_pretty = workVars.medium;
            console.log(vm.bds.work.medium_pretty);
            vm.bds.work.probable = workVars.probable;
            vm.sortCopies(vm.bds.workCopies);
            vm.copyCount = vm.bds.workCopies.length;
            vm.setRows();
            //vm.showOverlay();
        }

        vm.getMedium = function() {
            return vm.bds.work.medium_pretty;
        }

        var getWorkTypeVars = function(medium) {
            switch(medium) {
                case "illbk":
                    return {'medium':"Illuminated Books",'probable':'printing'};
                    break;
                case "comb":
                case "comdes":
                case "comeng":
                    return {'medium':"Commercial Book Illustrations",'probable':'printing'};
                    break;
                case "spb":
                case "spdes":
                case "speng":
                case "cprint":
                    return {'medium':"Prints",'probable':'printing'};
                    break;
                case "mono":
                case "paint":
                case "pen":
                case "penink":
                case "penc":
                case "wc":
                    return {'medium':"Drawings and Paintings",'probable':'composition'};
                    break;
                case "ms":
                case "ltr":
                case "te":
                    return {'medium':"Manuscripts and Typographic Works",'probable':'composition'};
                    break;
                default:
                    return false;
            }
        };

        /*this really needs to be redone to be made less convoluted*/
        vm.getTitle = function(){
            if(vm.bds.work.virtual == true){
                if(vm.bds.copy.bad_id == 'letters'){
                    if($rootScope.onWorkPage == true) {
                        return "Letters";
                    }
                    title = vm.bds.object.object_group;
                    title = title.match(/(to.*)/);
                    return title[1].charAt(0).toUpperCase() + title[1].slice(1);;
                } else {
                    title = vm.bds.work.title;
                    return title;
                }
            } else {
                if($rootScope.onWorkPage == true) {
                    title = vm.bds.work.title;
                    return title;
                }
                copyPhrase = vm.bds.copy.archive_copy_id == null ? '' : ' Copy '+vm.bds.copy.archive_copy_id;

                if(vm.bds.copy.header){
                    title = vm.bds.copy.header.filedesc.titlestmt.title['@reg'];
                }
                if($rootScope.view.mode == 'compare') {
                    if(title.match(/.*, The/)) {
                        title = "The " + title.match(/(.*), The/)[1];
                    }
                    return title;
                }
                if(title.match(/.*, The/)) {
                    title = "The " + title.match(/(.*), The/)[1];
                }
                return title;
            }
        }

        vm.getCopyPhrase = function() {
            return copyPhrase;
        }

        vm.getWorkId = function() {
            return vm.bds.work.bad_id;
        }

        vm.showOverlay = function() {
            $rootScope.showOverlay = true;
        }

        vm.closeOverlay = function() {
            $rootScope.showOverlay = false;
        }

        /*
        vm.bds.setSelectedWork($routeParams.workId).then(function(){
            var workVars = getWorkTypeVars(vm.bds.work.medium);
            vm.bds.work.medium_pretty =  workVars.medium;
            vm.bds.work.probable = workVars.probable;
            vm.sortCopies(vm.bds.workCopies);
            vm.copyCount = vm.bds.workCopies.length;
            vm.setRows();
        })
        */

        vm.isValidTitle = function (title) {
            return title.match(/\w+/) ? true : false;
        };

        vm.objectCopyId = function (descId) {
            var descIdElements = descId.split(".");
            return descIdElements[0] + "." + descIdElements[1];
        };


        vm.setRows = function(){
            vm.rowCount = Math.ceil(vm.copyCount / 4);
            vm.rows = [];
            for(var i = 1; i <= vm.rowCount; i++){
                vm.rows.push(i);
            }

            vm.knownCopiesDiv3 = Math.ceil(vm.copyCount / 3);
            if(!angular.isUndefined(vm.bds.work.related_works) && vm.bds.work.related_works !== null){
                vm.allKnownRelatedItemsDiv3 = Math.ceil(vm.bds.work.related_works.length / 3);
            }

        }
        vm.sortCopies = function(copies){
            //sort by copy
            if(angular.isDefined(copies)){
                copies.sort(function(a,b){
                    if(a.archive_copy_id > b.archive_copy_id){return 1;}
                    if(a.archive_copy_id < b.archive_copy_id){return -1;}
                    return 0;
                })
            }
        }

        vm.sortObjects = function(objects){
            //sort by object
            if(angular.isDefined(objects)){
                objects.sort(function(a,b){
                    if(a.title > b.title){return 1;}
                    if(a.title < b.title){return -1;}
                    return 0;
                })
            }
        }

        vm.getCopyFirstObject = function (copy) {
            function workMedium(badMedium) {
                switch(badMedium) {
                    case "comb":
                        return "com";
                        break;
                    case "comdes":
                        return "com";
                        break;
                    case "comeng":
                        return "com";
                        break;
                    case "spb":
                        return "sp";
                        break;
                    case "spdes":
                        return "sp";
                        break;
                    case "speng":
                        return "sp";
                        break;
                    case "cprint":
                        return "cpd";
                        break;
                    case "mono":
                        return "wd";
                        break;
                    case "paint":
                        return "pt";
                        break;
                    case "pen":
                        return "pid";
                    case "penink":
                        return "pid";
                        break;
                    case "penc":
                        return "pid";
                        break;
                    case "wc":
                        return "wc";
                        break;
                    case "ms":
                        return "ms";
                        break;
                    case "ltr":
                        return "lt";
                        break;
                    case "te":
                        return "typ";
                        break;
                    default:
                        return false;
                }
            }

            if (wm.bds.work) {
                if (wm.bds.work.medium == 'illbk') {
                    return "http://www.blakearchive.org/blake/images/" + copy.bad_id + ".p1.100.jpg";
                }
                else {
                    return "http://www.blakearchive.org/blake/images/" + copy.bad_id + ".1." + workMedium(wm.bds.work.medium) + ".100.jpg";
                }
            }
        };       

    }

    var workTitle = function () {

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/work-title/workTitle.html',
            controller: controller,
            controllerAs: 'workTitle',
            bindToController: true
        };
    }

    angular.module('blake').directive("workTitle", workTitle);


}());