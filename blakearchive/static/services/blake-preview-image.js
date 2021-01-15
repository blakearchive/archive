angular.module("blake").factory("BlakePreviewImage", function (GenericService) {
  /**
   * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
   * BlakeObjects.
   *
   * @param config
   */
  var constructor = function (config) {
      var blake_preview_image = angular.copy(config);

      return blake_preview_image;
  };

  return GenericService(constructor);
});
