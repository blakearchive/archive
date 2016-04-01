(function() {

    var controller = function ($scope, $sessionStorage,$rootScope) {

        var vm = this;

        if(!angular.isDefined($sessionStorage.view)){
            $sessionStorage.view = {
                mode: 'object',
                scope: 'image'
            }
        }

        vm.$storage = $sessionStorage;

        vm.changeView = function(mode,scope){
            vm.$storage.view.mode = mode;
            vm.$storage.view.scope = scope;
        }

    }

    controller.$inject = ['$scope', '$sessionStorage','$rootScope'];

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