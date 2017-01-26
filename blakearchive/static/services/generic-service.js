export const GenericService = angular.module("blake").factory("GenericService", function () {
    return constructor => {
        return {
            create: function (config) {
                let i, result;
                if (config.length) {
                    result = [];
                    for (i = 0; i < config.length; i++) {
                        result.push(constructor(config[i]));
                    }
                } else {
                    result = constructor(config);
                }
                return result;
            }
        };
    }
});