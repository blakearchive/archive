/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    var controller = function($scope,$routeParams,BlakeDataService){

        var vm = this;

        BlakeDataService.setSelectedWork($routeParams.workId);

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
        var getWorkTypeReadable = function(medium) {
            switch(medium) {
                case "illbk":
                    return "Illuminated Books";
                    break;
                case "comb":
                case "comdes":
                case "comeng":
                    return "Commercial Book Illustrations";
                    break;
                case "spb":
                case "spdes":
                case "speng":
                case "cprint":
                    return "Prints";
                    break;
                case "mono":
                case "paint":
                case "pen":
                case "penink":
                case "penc":
                case "wc":
                    return "Drawings and Paintings";
                    break;
                case "ms":
                case "ltr":
                case "te":
                    return "Manuscripts and Typographic Works";
                    break;
                default:
                    return false;
            }
        };

        $scope.$on("update:work", function () {
            vm.work = BlakeDataService.selectedWork;
            vm.work.medium_pretty = getWorkTypeReadable(vm.work.medium);
            var data = BlakeDataService.selectedWorkCopies;
            data.sort(function (a, b) {
                return a.source.objdescid.compdate["@value"] - b.source.objdescid.compdate["@value"];
            });

            vm.copies = data;

            vm.copyCount = vm.copies.length;
            vm.rowCount = Math.ceil(vm.copyCount / 4);
            vm.knownCopiesDiv3 = Math.ceil(vm.copyCount / 3);
            vm.allKnownRelatedItemsDiv3 = Math.ceil(vm.work.related_works.length / 3);
            vm.rows = [];
            for(var i = 1; i <= vm.rowCount; i++){
                vm.rows.push(i);
            }

        });

    }

    controller.$inject = ['$scope','$routeParams','BlakeDataService'];

    angular.module('blake').controller("WorkController", controller);

}());
