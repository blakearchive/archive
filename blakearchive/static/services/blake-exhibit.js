angular.module("blake").factory("BlakeExhibit", function (GenericService) {
  /**
   * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
   * BlakeObjects.
   *
   * @param config
   */
  var constructor = function (config) {
      var blake_exhibit = angular.copy(config);

      return blake_exhibit;
  };

  return GenericService(constructor);
});
