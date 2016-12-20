(function(){

    var controller = function(){
        var vm = this;
    }

    var copyInfoDl = function(){
        return {
            restrict: 'EA',
            templateUrl: '/static/directives/copy-info-dl/copyInfoDl.html',
            controller: controller,
            scope: {
                infoObject: '=',
                dt: '@',
                highlight: '@'
            },
            controllerAs: 'dl',
            bindToController: true
        };
    }

    angular.module('blake').directive('copyInfoDl', copyInfoDl);

}());