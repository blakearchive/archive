export const BlakeFeaturedWork = angular.module("blake").factory("BlakeFeaturedWork", function () {
    /**
     * Constructor takes a config object and creates a BlakeFeaturedWork.
     *
     * @param config
     */
    var constructor = function (config) {
        return angular.copy(config);
    };

    return GenericService(constructor);
});