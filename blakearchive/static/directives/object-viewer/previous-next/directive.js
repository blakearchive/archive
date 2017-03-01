angular.module("blake").controller("ObjectViewerPreviousNextController", function (BlakeDataService, ObjectViewerService) {
    let vm = this;
    vm.bds = BlakeDataService;
    vm.ovs = ObjectViewerService;
});

angular.module("blake").component("objectViewerPreviousNext", {
    template: require("html-loader!./template.html"),
    replace: true,
    bindToController: true,
    controller: "ObjectViewerPreviousNextController",
    controllerAs: "ovpn"
});