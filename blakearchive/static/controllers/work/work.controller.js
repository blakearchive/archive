/**
 * Created by lukeluke on 1/26/16.
 */

(function(){

    /** @ngInject */
    var controller = function($rootScope,$routeParams,BlakeDataService){

        var vm = this;

        vm.bds = BlakeDataService;

        $rootScope.showOverlay = false;

        vm.bds.setSelectedWork($routeParams.workId);

        $rootScope.worksNavState = false;
        $rootScope.showWorkTitle = 'work';


    }

    angular.module('blake').controller("WorkController", controller);

}());
