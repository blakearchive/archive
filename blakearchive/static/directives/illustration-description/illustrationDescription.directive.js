angular.module('blake').controller("IllustrationDescriptionController", function($routeParams){
    var vm = this;
});

angular.module('blake').directive('illustrationDescription', function () {
    return {
        restrict: 'EA',
        template: require('html-loader!./illustrationDescription.html'),
        controller: "IllustrationDescriptionController",
        scope: {
            object: '=object',
            highlight: '@highlight',
            keywords: '@keywords'
        },
        controllerAs: 'descCtrl',
        bindToController: true
    };
});