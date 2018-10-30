angular.module("blake").factory("BlakeFragmentPair", function (GenericService) {
  /**
   * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
   * BlakeObjects.
   *
   * @param config
   */
  var constructor = function (config) {
      var fragment_pair = angular.copy(config);

      return fragment_pair;
  };

  return GenericService(constructor);
});
