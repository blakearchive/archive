angular.module("blake").controller("PreviewBoxController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").component("previewBox", {
    template: require("html-loader!./template.html"),
    controller: "PreviewBoxController",
    controllerAs: "pb"
});