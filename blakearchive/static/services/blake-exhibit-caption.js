angular.module("blake").factory("BlakeExhibitCaption", function (GenericService) {
  /**
   * Constructor takes a config object and creates a BlakeCopy, with child objects transformed into the
   * BlakeObjects.
   *
   * @param config
   */
  var constructor = function (config) {
      var blake_exhibit_caption = angular.copy(config);
      return blake_exhibit_caption;
  };

  return GenericService(constructor);
});
