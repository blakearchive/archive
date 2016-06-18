(function(){

    /** @ngInject */
    var controller = function($scope,$rootScope,$routeParams,$http){

        var vm = this;

        $rootScope.showSubMenu = 0;
        $rootScope.worksNavState = false;
        //$localStorage.$reset()

        vm.page = $routeParams.initialPage;

        $http.get('/blake/static/controllers/staticpage/meta.json').success(function(data){
            vm.meta = data;
            vm.title = data[vm.page].title;
            vm.subSelection = data[vm.page].initial;
            vm.navigation = data[vm.page].subSections;
        });

        vm.changeContent = function(page){
            vm.subSelection = page;
        }

    }

    angular.module('blake').controller('StaticpageController',controller);

}());
