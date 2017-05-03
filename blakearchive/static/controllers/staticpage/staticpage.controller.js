angular.module('blake').controller('StaticpageController', function($scope,$rootScope,$routeParams,$http,$location){
    var vm = this;

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = 'static';
    $rootScope.help = 'static';

    vm.page = $routeParams.initialPage;
    vm.subSelection = 'empty';

    $http.get('/static/controllers/staticpage/meta.json').then(function(response){
        let data = response.data;
        vm.meta = data;
        vm.title = data[vm.page].title;
        $rootScope.staticPageTitle = vm.title;
        if($location.search().p){
            vm.subSelection = $location.search().p;
            //console.log($location.search().p);
        } else {
            vm.subSelection = data[vm.page].initial;
        }
        vm.navigation = data[vm.page].subSections;
    });

    vm.changeContent = function(page){
        vm.subSelection = page;
        $location.search('p',page);
    }

});
