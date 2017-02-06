angular.module("blake").controller("DateSearchFieldController", function (SearchController) {
    let vm = this;
    vm.s = SearchController;
});

angular.module("blake").component("dateSearchField", {
    template: require("html-loader!./template.html"),
    controller: "DateSearchFieldController",
    controllerAs: "dsf"
});