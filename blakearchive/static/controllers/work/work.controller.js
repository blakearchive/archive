/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    /** @ngInject */
    var controller = function($rootScope,$routeParams,BlakeDataService){

        var vm = this;

        vm.bds = BlakeDataService;

        vm.bds.setSelectedWork($routeParams.workId).then(function(){

            vm.knownCopiesDiv3 = Math.ceil(vm.copyCount / 3);
            if(!angular.isUndefined(vm.bds.work.related_works) && vm.bds.work.related_works !== null){
                vm.allKnownRelatedItemsDiv3 = Math.ceil(vm.bds.work.related_works.length / 3);
            }
        });

        $rootScope.worksNavState = false;
        $rootScope.showWorkTitle = 'work';


        vm.isValidTitle = function (title) {
            return title.match(/\w+/) ? true : false;
        };

        vm.objectCopyId = function (descId) {
            var descIdElements = descId.split(".");
            return descIdElements[0] + "." + descIdElements[1];
        };





        /*vm.sortObjects = function(objects){
            //sort by object
            if(angular.isDefined(objects)){
                objects.sort(function(a,b){
                    if(a.title > b.title){return 1;}
                    if(a.title < b.title){return -1;}
                    return 0;
                })
            }
        }*/

    }

    angular.module('blake').controller("WorkController", controller);

}());
