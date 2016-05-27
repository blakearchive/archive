(function() {

    /** @ngInject */
    var controller = function ($rootScope) {

        var vm = this;

        if(!angular.isDefined($rootScope.view)){
            $rootScope.view = {
                mode: 'object',
                scope: 'image'
            }
        }

        vm.changeView = function(mode,scope){
            $rootScope.view.mode = mode;
            $rootScope.view.scope = scope;
            $rootScope.worksNavState = false;
        }

    }


    var viewSubMenu = function () {

        return {
            restrict: 'E',
            scope: true,
            templateUrl: '/blake/static/directives/view-sub-menu/viewSubMenu.html',
            controller: controller,
            controllerAs: 'viewSubMenu',
            bindToController: true
        };
    }

    angular.module('blake').directive("viewSubMenu", viewSubMenu);


}());