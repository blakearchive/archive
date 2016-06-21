(function(){

    var handprintBlock = function(){

        var controller = function(){

            var vm = this;
            //This can be removed once all images have the same path
            switch (vm.workId) {
                case 'biblicalwc':
                case 'biblicaltemperas':
                case 'but543':
                case 'letters':
                case 'gravepd':
                case 'gravewc':
                case 'gravewd':
                case 'cpd':
                case 'allegropenseroso':
                case 'miltons':
                    vm.imagePath = '/blake/static/img/virtualworks/';
                    break;
                default:
                    vm.imagePath = 'http://www.blakearchive.org/blake/images/';;
                    break;
            }

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
                action: '&action',
                workId: '@workId'
            },
            controllerAs: 'handprint',
            bindToController: true
        };
    }

    angular.module('blake').directive('handprintBlock', handprintBlock);

}());