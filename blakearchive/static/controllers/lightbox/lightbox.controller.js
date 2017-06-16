/*
This is getting huge and so will demand refactoring at some point. Perhaps:
= factor out cropping into a service
= factor out custom image controls (remove/crop buttons) into a service
= potentially, custom image controls can be shared (in a banner/top bar)
  instead of being added on the fly. which should allow us to factor it
  into a directive? this may have the added benefit of having a place to
  denote state such as if we are in crop mode or not. A state machine may
  be needed judging from the number of statish booleans in use... a state
  machine can be factored into a utility class.
*/
angular.module("blake")
  .controller("LightboxController",
    function ($scope,
      $rootScope,CartStorageService,
      Fabric,
      FabricCanvas,
      FabricConstants) {
        var vm = this;
        $scope.currentObject = null;  // ref to current object on the canvas
        $scope.cropObject = null;     // ref to object we want to crop
        $scope.isCropMode = false;    // are we in crop mode?
        $scope.cropBoxDrawn = false;  // has the crop box been drawn?
        $scope.mouseDown = null;      // are we amidst a drag operation?
        $scope.loaded = 0;            // number of images loaded
        var container = document.getElementById('lightbox').getBoundingClientRect();

        $scope.cropBox = new fabric.Rect({
          fill: 'transparent',
          stroke: '#29f',
          height: 1,
          width: 1,
          selectable: true,
          strokeDashArray: [2, 2],
          visible: false
        });

        $scope.fabric = {};
        /* currently does not work...
        lockUniScaling removes x/y scaling controls from the bounding box...
        so only allows scaling with diagonals and thus maintains aspect ratio

        $scope.ImagesConstants = {"lockUniScaling":true};

        since passing options does not work... I have customized our local
        fabric.js source. On hindsight, we could have redefined the functions
        using js/jquery prototyping on fabric js.
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

          FabricCanvas.getCanvas().add($scope.cropBox);

          // Initial canvas size is the window size.
          $scope.fabric.setCanvasSize(window.innerWidth,window.innerHeight);

          FabricCanvas.getCanvas().on('mouse:down',$scope.handleMouseDownOnCanvas);
          FabricCanvas.getCanvas().on('mouse:move',$scope.handleMouseMoveOnCanvas);
          FabricCanvas.getCanvas().on('mouse:up',$scope.handleMouseUpOnCanvas);
          FabricCanvas.getCanvas().on('object:selected',$scope.handleObjectSelected);
          FabricCanvas.getCanvas().on('object:modified',$scope.handleObjectModified);
          FabricCanvas.getCanvas().on('object:moving', $scope.handleObjectMoving);
          FabricCanvas.getCanvas().on('object:scaling',$scope.handleObjectScaling);
          FabricCanvas.getCanvas().on('object:rotating',$scope.handleObjectRotating);
          FabricCanvas.getCanvas().on('object:added',$scope.handleObjectAdded);

          // for dev... may need to test if a load is required...
          // not required on re-entry (when lbox window is already opened)
          $scope.loadFromCart();
    	  }; /// ===> End of $scope.init()

        // ================================================================
        // Methods to deal with the cropping controls/buttons/icons
        // -currently added to the dom then the canvas. could make them
        //  fabric images, but it gets complicated in a hurry that way.
        // ================================================================
        $scope.removeControls = function(){
          if ($(".lboxControls") && !$scope.isCropMode){
            $(".lboxControls").remove();
          };
        }

        // shows image controls (remove/crop) (when image is focused/selected)
        $scope.addControls = function(x,y){
          $(".lboxControls").remove();
          var btnLeft = x-22;
          var btnTop = y-27;
          // TODO: use fabric object instead of img element?
          var cropper = $scope.generateControl('crop-button','crop-symbol',btnTop,btnLeft,22);
          $(".canvas-container").append(cropper);
          $("#crop-button").on('click',$scope.handleCropButtonClick);

          var dustbin = $scope.generateControl('delete-button','dustbin',btnTop,btnLeft,0);
          $(".canvas-container").append(dustbin);
          $("#delete-button").on('click',$scope.handleTrashButtonClick);

          var cancel = $scope.generateControl('cancel-button','272-cross',btnTop,btnLeft,44);
          $(".canvas-container").append(cancel);
          $('#cancel-button').hide();
          $("#cancel-button").on('click',$scope.handleCancelButtonClick);

          var accept = $scope.generateControl('accept-button','273-checkmark',btnTop,btnLeft,66);
          $(".canvas-container").append(accept);
          $("#accept-button").hide();
          $("#accept-button").on('click',$scope.handleAcceptButtonClick);

          $scope.fabric.render();
          //console.log("=== controls added!");
        };



        $scope.generateControl = function(id,png,top,left,offset){
            var control = '<img id="'+id+'" src="/icon/'+png+'.png" '
              +'class="lboxControls" style="position:absolute;top:'
              +top+'px;left:'+(left - offset)
              +'px;cursor:pointer;width:20px;height:20px;"/>';
            return control;
        }
        $scope.handleCancelButtonClick = function(evt){
          // exit crop mode
          $scope.exitCropMode();
        };
        $scope.handleAcceptButtonClick = function(evt){
          // TODO: perform the crop operation!!!
          console.log("Call the method to perform the cropping, then exit crop mode!");
          $scope.performCrop();
          $scope.exitCropMode();
        };

        $scope.performCrop = function(){
          // TODO: make this work!!!
          var data = FabricCanvas.getCanvas().toDataURL({
            left: $scope.cropBox.left+2,
            top: $scope.cropBox.top+2,
            width: $scope.cropBox.width-4,
            height: $scope.cropBox.height-4
          });
          fabric.Image.fromURL(data,function(img){
            // img.lockUniScaling = true;
            // $scope.addImageScaledToWidth(img,-1);
            $scope.fabric.addObjectToCanvas(img);
            
          });
        };

        $scope.handleTrashButtonClick = function(evt){
          $scope.currentObject.remove();
          $scope.currentObject = null;
          $(".lboxControls").remove();
        };

        $scope.handleCropButtonClick = function(evt){
          //console.log(JSON.stringify(FabricCanvas.getCanvas()));
          $scope.isCropMode = !$scope.isCropMode;
          console.log("=== you clicked the crop button, isCropMode: "+$scope.isCropMode);
          if ($scope.isCropMode){
            // toggled to crop mode so let's enter crop mode
            $scope.cropObject = $scope.currentObject;
            FabricCanvas.getCanvas().forEachObject(function(o){
              o.selectable = false;
            });
            FabricCanvas.getCanvas().deactivateAllWithDispatch();
            $("#accept-button").show();
            $('#cancel-button').show();
          }else{
            // toggled to non crop mode, so exit crop mode
            $scope.exitCropMode();
          }
        };
        $scope.exitCropMode = function(){
          FabricCanvas.getCanvas().forEachObject(function(o){
            o.selectable = true;
          });
          $scope.cropBox.visible = false;
          FabricCanvas.getCanvas().setActiveObject($scope.cropObject);
          $scope.cropObject = null;
          $scope.cropBoxDrawn = false;
          $scope.isCropMode = false;
          $("#accept-button").hide();
          $('#cancel-button').hide();
        }
        // ===================================================================
        // Methods dealing with loading images into fabric from the cart
        // ===================================================================
        $scope.loadFromCart = function(){
          var sensibleWidth = $scope.determineLoadingWidth(window.innerWidth);

          // TODO: when loading from cart, load into a "grid" that
          // has max 5 objects width.
          var icount = 0;
          $scope.images.forEach(function(entry){
            var imgUrl = '/images/' +entry;
            console.log("attempting load of: "+entry+" with width: "+sensibleWidth);
            $scope.addImage(imgUrl,sensibleWidth);
            icount++;
          });
        };
        // ===============
        $scope.determineLoadingWidth = function(containerWidth){
          var divisor = 4;
          if ($scope.images.length <= 4) divisor = $scope.images.length;
          if (divisor < 1) divisor = 1;
          return containerWidth/(divisor+1);
        };
        // ===============
        $scope.addImage = function(imgUrl, width){
          $scope.fabric.addImageScaledToWidth(imgUrl,width);
        };

        // ===================================================================
        // Event Handlers.
        // ===================================================================
        $scope.handleMouseDownOnCanvas = function(evt){
          //console.log("==== clicked: "+evt.target);
          // if clicked on nothing, unset the currentObject
          if (!evt.target && $scope.currentObject){
            //console.log("===== deselected: "+$scope.currentObject);
            $scope.currentObject = null;
          }
          if (!FabricCanvas.getCanvas().getActiveObject()){
              $scope.removeControls();
          }
          if ($scope.isCropMode && !$scope.cropBoxDrawn){
            //$scope.cropBox.width = 2;
            //$scope.cropBox.height = 2;
            $scope.cropBox.left = evt.e.pageX - container.left;
            $scope.cropBox.top = evt.e.pageY - container.top;
            $scope.cropBox.visible = true;
            $scope.mouseDown = evt.e;
            $scope.cropBox.selectable = true;
            $scope.cropBox.lockRotation = true;
            FabricCanvas.getCanvas().bringToFront($scope.cropBox);
            FabricCanvas.getCanvas().setActiveObject($scope.cropBox);
            $scope.cropBoxDrawn = true;
          }
        };
        // ===============
        $scope.handleMouseMoveOnCanvas = function(evt){
          if ($scope.isCropMode && $scope.mouseDown){
            $scope.cropBox.width = evt.e.pageX - $scope.mouseDown.pageX;
            $scope.cropBox.height = evt.e.pageY - $scope.mouseDown.pageY;
            FabricCanvas.getCanvas().bringToFront($scope.cropBox);
            //FabricCanvas.getCanvas().renderAll();
          }
        };
        // ===============
        $scope.handleMouseUpOnCanvas = function(evt){
          $scope.mouseDown = null;
          // Great<sarcasm> the crop box width is correct, but
          // the resize handles are still at the initial size of 2!!!
          // why?!!
          if ($scope.cropBox.width && $scope.isCropMode)
            console.log("cropBox.width: "+$scope.cropBox.width);

          //FabricCanvas.getCanvas().renderAll();
        };
        // ===============
        $scope.handleObjectSelected = function(evt){
          if (evt.target){
            //console.log("===== Selected: "+evt.target);
            FabricCanvas.getCanvas().bringToFront(evt.target);
            if ($scope.isCropMode)
              FabricCanvas.getCanvas().bringToFront($scope.cropBox);

            $scope.currentObject = evt.target;

            if (evt.target instanceof fabric.Image)
              $scope.addControls(evt.target.oCoords.tr.x, evt.target.oCoords.tr.y);
            //console.log("scale of selected object: x="+evt.target.scaleX+" y="+evt.target.scaleY);
          };
        };
        // ===============
        $scope.handleObjectModified = function(evt){
          if (evt.target instanceof fabric.Image)
            $scope.addControls(evt.target.oCoords.tr.x, evt.target.oCoords.tr.y);
          else if (evt.target == $scope.cropBox){
            FabricCanvas.getCanvas().setActiveObject($scope.cropBox);
          }
        };
        // ===============
        $scope.handleObjectMoving = function(evt){
          $scope.removeControls();
        };
        // ===============
        $scope.handleObjectScaling = function(evt){
          $scope.removeControls();
        };
        // ===============
        $scope.handleObjectRotating = function(evt){
          $scope.removeControls();
          // TODO: adjust control icon rotations here.
        };
        // ===============
        $scope.handleObjectAdded = function(evt){
          // TODO: find out what's up with this... still adds to the middle!
          if (evt.target instanceof fabric.Image){
            //console.log(' >>> just added this: '+evt.target);
            var c = $scope.loaded % 5;
            var r = Math.floor($scope.loaded / 5);
            evt.target.set('top',(r * 50)+30);
            evt.target.set('left', c* $scope.determineLoadingWidth(window.innerWidth));
            $scope.loaded++;

            //console.log(' >>> just added this: '+evt.target+" : "+c+":"+r);
            console.log(' >>> just added image at top-'+evt.target.top+' left-'+evt.target.left);

            //$scope.fabric.render();
            //FabricCanvas.getCanvas().renderAll();
          }
        };
        // ===============> End of Event Handlers


        // ================================================================
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

        //$scope.$on('object:moved',alert("bling bling!"));
    });

/*
Notes:
=== Cropping: after reviewing several cropping libraries:
  https://fengyuanchen.github.io/cropperjs/
  http://www.croppic.net/
  https://github.com/alexk111/ngImgCrop
  plus others i've forgotten.

  I think this bit of stack overflow might be the best bet:
  https://stackoverflow.com/questions/18732876/crop-functionality-using-fabricjs
*/
