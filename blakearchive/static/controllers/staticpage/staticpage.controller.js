(function(){

    var controller = function($scope,$rootScope,BlakeDataService,$window,$localStorage,$routeParams){

        var vm = this;

        $rootScope.showSubMenu = 0;
        $rootScope.worksNavState = false;
        //$localStorage.$reset()

        vm.initialSelection = $routeParams.initialPage;
        vm.subSelection = vm.initialSelection;

        vm.changeContent = function(page){
            vm.subSelection = page;
        }

    }

    controller.$inject = ['$scope','$rootScope','BlakeDataService','$window','$localStorage','$routeParams'];

    angular.module('blake').controller('StaticpageController',controller);

}());
