angular.module("blake").controller("HandprintBlockController", function () {
    var vm = this;
    //This can be removed once all images have the same path
    switch (vm.workId) {
        case 'biblicalwc':
        case 'biblicaltemperas':
        case 'but543':
        case 'letters':
        case 'pid':
        case 'gravepd':
        case 'gravewc':
        case 'gravewd':
        case 'cpd':
        case 'allegropenseroso':
        case 'miltons':
            vm.imagePath = '/static/img/virtualworks/';
            break;
        default:
            vm.imagePath = '/images/';
            break;
    }

});

angular.module('blake').directive('handprintBlock', function () {
    return {
        restrict: 'E',
        template: require('html-loader!./handprintBlock.html'),
        controller: "HandprintBlockController",
        scope: {
            header: '@header',
            footer: '@footer',
            image: '@image',
            link: '@link',
            title: '@title',
            action: '&action',
            workId: '@workId'
        },
        controllerAs: 'handprint',
        bindToController: true
    };
});