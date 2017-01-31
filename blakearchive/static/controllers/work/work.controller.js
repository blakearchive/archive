angular.module('blake').controller("WorkController", function($rootScope,$routeParams,BlakeDataService){
    var vm = this;

    vm.bds = BlakeDataService;

    $rootScope.showOverlay = false;
    $rootScope.help = 'work';

    vm.bds.setSelectedWork($routeParams.workId);

    $rootScope.worksNavState = false;
    $rootScope.showWorkTitle = 'work';

    vm.getInfo = function(info){
        return info.split('<br />')
    }


});
