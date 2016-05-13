(function(){

    var handprintBlock = function(){

        var controller = function(){

        }

        return {
            restrict: 'E',
            templateUrl: '/blake/static/directives/handprint-block/handprintBlock.html',
            controller: controller,
            scope: {
                header: '@header',
                footer: '@footer',
                image: '@image',
                link: '@link',
                title: '@title',
                action: '&action'
            },
            controllerAs: 'handprint',
            bindToController: true
        };
    }

    angular.module('blake').directive('handprintBlock', handprintBlock);

}());