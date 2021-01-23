angular.module("blake").controller("RegularObjectViewerController", function ($scope,$rootScope, BlakeDataService, ObjectViewerService) {
    let vm = this;
    vm.rs = $rootScope;
    vm.bds = BlakeDataService;
    vm.ovs = ObjectViewerService;
    vm.optionsSet = false;

    vm.options = {
            id:            "example",
                prefixUrl:     "http://openseadragon.github.io/openseadragon/images/",
                tileSources:   {
                    type: 'image',
                    //url:  'images/previews/but649/BUT649.1.1r.PT.300.cc.jpg'
                    url: ''
                }

    };

    $scope.$on('$viewContentLoaded', function(){
        vm.options.url = 'images/' + vm.bds.object.dbi + '300.jpg';
        vm.optionsSet = true;
    });
    //console.log(vm.ovs);
    //console.log(vm.rs);
});

angular.module("blake").component("regularObjectViewer", {
    template: require("html-loader!./template.html"),
    replace: true,
    bindToController: true,
    controller: "RegularObjectViewerController",
    controllerAs: "rov"
});