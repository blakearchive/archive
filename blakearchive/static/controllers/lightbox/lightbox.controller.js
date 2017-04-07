angular.module("blake")
  .controller("LightboxController",
    function ($scope,
      $rootScope,CartStorageService,
      Fabric,
      FabricCanvas,
      FabricConstants) {
        var vm = this;
        $scope.fabric = {};
      	$scope.FabricConstants = FabricConstants;

        $scope.images = CartStorageService.cartItems;

        $scope.init = function() {
    		    $scope.fabric = new Fabric({
        			JSONExportProperties: FabricConstants.JSONExportProperties,
        			textDefaults: FabricConstants.textDefaults,
        			shapeDefaults: FabricConstants.shapeDefaults,
        			json: {}
    		    });
            console.log('canvas init complete.');
            $scope.fabric.setCanvasSize(window.innerWidth,window.innerHeight);
            $scope.loadFromCart();
    	  };

        $scope.loadFromCart = function(){
          $scope.images.forEach(function(entry){
            var imgUrl = 'http://l7.oasis.unc.edu/images/' +entry;
            console.log("attempting load of: "+entry);
            $scope.fabric.addImageScaledToWidth(imgUrl,400);

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
