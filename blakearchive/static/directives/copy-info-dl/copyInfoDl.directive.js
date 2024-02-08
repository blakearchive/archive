angular.module('blake').directive('copyInfoDl', function(){
    return {
        restrict: 'EA',
        template: require('html-loader!./copyInfoDl.html'),
        controller: function () { var vm = this; },
        scope: {
            infoObject: '=',
            dt: '@',
            highlight: '@'
        },
        controllerAs: 'dl',
        bindToController: true
    };
    console.log(infoObject)
});