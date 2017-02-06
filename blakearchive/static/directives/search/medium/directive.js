angular.module("blake").controller("MediumSearchFieldController", function (SearchController) {
    let vm = this;
    vm.s = SearchController;
});

angular.module("blake").component("mediumSearchField", {
    template: require("html-loader!./template.html"),
    controller: "MediumSearchFieldController",
    controllerAs: "msf"
});