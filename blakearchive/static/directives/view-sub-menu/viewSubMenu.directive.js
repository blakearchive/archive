(function() {

    /** @ngInject */
    var controller = function ($rootScope,$routeParams,$modal) {

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

        vm.helpOpen = function(){

            var myTemplateURL;

            switch ($rootScope.help) {
                case 'home':
                    myTemplateURL = '/static/html/help-home.html';
                    break;
                case 'work':
                    myTemplateURL = '/static/html/help-work.html';
                    break;
                case 'copy':
                    if($rootScope.persistentmode == 'gallery' && $rootScope.view.mode != 'compare') {
                        myTemplateURL = '/static/html/help-object.html';
                    }
                    if($rootScope.view.mode == 'compare') {
                        myTemplateURL = '/static/html/help-compare.html';
                    }
                    if($rootScope.persistentmode == 'reading') {
                        myTemplateURL = '/static/html/help-reading.html';
                    }
                    break;   
                case 'static':
                    myTemplateURL = '/static/html/help-static.html';
                    break;
                
                case 'search':
                    myTemplateURL = '/static/html/help-search.html';
                    break;
            }

            var helpModalInstance = $modal.open({
                templateUrl: myTemplateURL,
                controller: 'ModalController',
                size: 'lg'
            });
        }

        vm.changeView = function(mode,scope){
            $rootScope.view.mode = mode;
            $rootScope.view.scope = scope;
            //$rootScope.worksNavState = false;
            if(mode == 'object') {
                $rootScope.persistentmode = 'gallery';
            }
            if(mode == 'read') {
                var target = $routeParams.descId ? '#'+$routeParams.descId.replace(/\./g,'-') : '';
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
            templateUrl: '/static/directives/view-sub-menu/viewSubMenu.html',
            controller: controller,
            controllerAs: 'viewSubMenu',
            bindToController: true
        };
    }

    angular.module('blake').directive("viewSubMenu", viewSubMenu);


}());