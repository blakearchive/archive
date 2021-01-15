angular.module("blake").factory("BlakePreview", function (GenericService) {
  /**
   * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
   * BlakeObjects.
   *
   * @param config
   */
  var constructor = function (config) {
      var blake_preview = angular.copy(config);

      return blake_preview;
  };

  return GenericService(constructor);
});
