angular.module("blake").component("searchBox", {
    template: require("html-loader!./template.html"),
    controller: "SearchController",
    controllerAs: "sb"
});