/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    var controller = function($scope,$routeParams,$rootScope,$sanitize,BlakeDataService){

        var vm = this;
        $rootScope.worksNavState = false;

        vm.searchTerm = angular.isDefined($routeParams.searchTerm) ? $routeParams.searchTerm : '';

        BlakeDataService.setSelectedWork($routeParams.workId).then(function(){
            vm.work = BlakeDataService.selectedWork;
            var workVars = getWorkTypeVars(vm.work.medium);
            vm.work.medium_pretty =  workVars.medium;
            vm.work.probable = workVars.probable;

            vm.copies = vm.work.copiesInWork;
            vm.sortCopies(vm.copies);

            vm.copyCount = vm.copies.length;
            vm.rowCount = Math.ceil(vm.copyCount / 4);
            vm.knownCopiesDiv3 = Math.ceil(vm.copyCount / 3);
            if(!angular.isUndefined(vm.work.related_works) && vm.work.related_works !== null){
                vm.allKnownRelatedItemsDiv3 = Math.ceil(vm.work.related_works.length / 3);
            }
            vm.rows = [];
            for(var i = 1; i <= vm.rowCount; i++){
                vm.rows.push(i);
            }
        });

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

            if (vm.work) {
                if (vm.work.medium == 'illbk') {
                    return "http://www.blakearchive.org/blake/images/" + copy.bad_id + ".p1.100.jpg";
                }
                else {
                    return "http://www.blakearchive.org/blake/images/" + copy.bad_id + ".1." + workMedium(vm.work.medium) + ".100.jpg";
                }
            }
        };

        /**
         * Print out full text for medium instead of abbreviation
         * @param medium
         * @returns {*}
         */
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

    }

    controller.$inject = ['$scope','$routeParams','$rootScope','$sanitize','BlakeDataService'];

    angular.module('blake').controller("WorkController", controller);

}());
