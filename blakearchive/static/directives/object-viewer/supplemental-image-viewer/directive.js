angular.module("blake").controller("SupplementalImageViewerController", function ($rootScope, BlakeDataService, ObjectViewerService) {
    let vm = this;
    vm.rs = $rootScope;
    vm.bds = BlakeDataService;
    vm.ovs = ObjectViewerService;
});

angular.module("blake").component("supplementalImageViewer", {
    template: require("html-loader!./template.html"),
    replace: true,
    bindToController: true,
    controller: "SupplementalImageViewerController",
    controllerAs: "siv"
});