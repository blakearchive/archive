(function() {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams) {

        var vm = this;

        if(!angular.isDefined($rootScope.persistentmode)){
            $rootScope.persistentmode = 'gallery';
        }

        if(!angular.isDefined($rootScope.view)){
            $rootScope.view = {
                mode: 'object',
                scope: 'image'
            }
        }

        vm.changeView = function(mode,scope){
            $rootScope.view.mode = mode;
            $rootScope.view.scope = scope;
            //$rootScope.worksNavState = false;
            if(mode == 'object') {
                $rootScope.persistentmode = 'gallery';
            }
            if(mode == 'read') {
                var target = '#'+$routeParams.descId.replace(/\./g,'-');
                $rootScope.$broadcast('viewSubMenu::readingMode',{'target': target});
                $rootScope.persistentmode = 'reading';
            }
            
        }

        $rootScope.states = {};
        $rootScope.states.activeItem = 'gallery';
        $rootScope.items = [{
            id: 'reading',
            mode: 'read',
            scope: 'both',
            abbreviation: 'R',
            title: 'Reading Mode'
            }, {
            id: 'gallery',
            mode: 'object',
            scope: 'image',
            abbreviation: 'G',
            title: 'Gallery Mode'
        }];

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