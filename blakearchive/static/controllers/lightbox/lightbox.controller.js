angular.module("blake")
  .controller("LightboxController",
    function ($scope,
      $rootScope,CartStorageService,
      Fabric,
      FabricCanvas,
      FabricConstants) {
        var vm = this;
        $scope.fabric = {};
        /* currently does not work...
        $scope.ImagesConstants = {"lockUniScaling":true};
        */
      	$scope.FabricConstants = FabricConstants;

        // note: the cart items are from browsers local storage
        $scope.images = CartStorageService.cartItems;
        $scope.isLightbox = true;
        // bootstraps fabric to the canvas element
        // called on canvas::created event... see below
        $scope.init = function() {
    		    $scope.fabric = new Fabric({
        			JSONExportProperties: FabricConstants.JSONExportProperties,
        			textDefaults: FabricConstants.textDefaults,
        			shapeDefaults: FabricConstants.shapeDefaults,
        			json: {}
    		    });
            console.log('canvas init complete.');
            $scope.fabric.setCanvasSize(window.innerWidth,window.innerHeight);

            // for dev... may need to test if a load is required...
            // not required on re-entry (when lbox window is already opened)
            $scope.loadFromCart();
    	  };

        $scope.loadFromCart = function(){
          $scope.images.forEach(function(entry){
            var imgUrl = '/images/' +entry;
            console.log("attempting load of: "+entry);
            var tmp = $scope.fabric.addImageScaledToWidth(imgUrl,400);
            console.log("returned by fabric add method: "+tmp);
            //$scope.fabric.getActiveObject().scaleToWidth(300);

          });
        };
        //
      	// Editing Canvas Size
      	// ================================================================
      	$scope.selectCanvas = function() {
      		$scope.canvasCopy = {
      			width: $scope.fabric.canvasOriginalWidth,
      			height: $scope.fabric.canvasOriginalHeight
      		};
      	};

      	$scope.setCanvasSize = function() {
      		$scope.fabric.setCanvasSize($scope.canvasCopy.width, $scope.canvasCopy.height);
      		$scope.fabric.setDirty(true);
      		Modal.close();
      		delete $scope.canvasCopy;
      	};

      	$scope.updateCanvas = function() {
      		var json = $scope.fabric.getJSON();

      		$www.put('/api/canvas/' + $scope.canvasId, {
      			json: json
      		}).success(function() {
      			$scope.fabric.setDirty(false);
      		});
      	};

        $scope.$on('canvas:created', $scope.init);
    });
