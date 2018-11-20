angular.module("blake").factory("BlakeExhibitImage", function (GenericService) {
  /**
   * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
   * BlakeObjects.
   *
   * @param config
   */
  var constructor = function (config) {
      var blake_exhibit_image = angular.copy(config);

      return blake_exhibit_image;
  };

  return GenericService(constructor);
});
