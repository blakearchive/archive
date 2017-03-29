angular.module("blake").controller("ViewSubMenuController", function ($rootScope,$routeParams,$modal,CompareObjectsFactory) {
    var vm = this;
    vm.cof = CompareObjectsFactory;

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
            //size: 'sm'
        });
    }

    vm.changeView = function(mode,scope){
        $rootScope.view.mode = mode;
        $rootScope.view.scope = scope;
        //$rootScope.worksNavState = false;
        if(mode == 'object') {
            $rootScope.persistentmode = 'gallery';

            vm.compareText = "Select All Objects";
            vm.selectedAll = false;
            vm.cof.resetComparisonObjects();
            $rootScope.view.scope = 'image';

        }
        if(mode == 'read') {
            //console.log($rootScope.descIDFromCompare);
            //console.log($routeParams.descId);
            if($rootScope.descIDFromCompare != null) {
                var target = $rootScope.descIDFromCompare ? '#'+$rootScope.descIDFromCompare.replace(/\./g,'-') : '';
                $rootScope.$broadcast('viewSubMenu::readingMode',{'target': target});
                $rootScope.persistentmode = 'reading';
                $routeParams.descId = $rootScope.descIDFromCompare;
                $rootScope.descIDFromCompare = null;
                return;
            }
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

});

angular.module('blake').directive("viewSubMenu", function () {
    return {
        restrict: 'E',
        scope: true,
        template: require('html-loader!./viewSubMenu.html'),
        controller: "ViewSubMenuController",
        controllerAs: 'viewSubMenu',
        bindToController: true
    };
});