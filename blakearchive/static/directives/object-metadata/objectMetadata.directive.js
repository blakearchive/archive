(function(){

    var controller = function(){
        var vm = this;
    }

    var objectMetadata = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/object-metadata/objectMetadata.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'metaCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('objectMetadata', objectMetadata);

}());