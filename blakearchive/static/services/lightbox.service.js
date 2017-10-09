angular.module('blake')
  .factory('lightbox_service',function(ngDexie,$rootScope){
    var svc = {
      sayHi: function(){
        console.log("==== lightbox_service says: hi!!!!");
      },
      addToCart: function(cartItem){
        ngDexie.put('cartItems',cartItem).then(function(data){
          console.log("==just added this: "+JSON.stringify(data));
          // signal the lightbox... i know, a pub/sub mechanism would
          // have been better... but it just wasn't cooperating.
          window.localStorage.setItem('cart-item-added',data);
        });

      },
      getCartItem: function(index){
        //return ngDexie.get('cartItems',index);
        //return await ngDexie.getDb().cartItems.get(index);
        //console.log("== so u want cartItem with id: "+index);
        return ngDexie.get('cartItems',index).then(function(item){
          //console.log("== promised item: "+JSON.stringify(item));
          return item;
        });
      },
      clearCart: function(){
        ngDexie.getDb().cartItems.clear();
      },
      listCartItems: function(){
        return ngDexie.list('cartItems').then(function(data){
          //console.log("===data:::"+JSON.stringify(data));
          return data;
        });
      },
      setImageToCrop: function(imgToCrop){
        imgToCrop.id=1;
        ngDexie.put('imageToCrop',imgToCrop);
      },
      getImageToCrop: function(){
        return ngDexie.get('imageToCrop',1);
      },
      setCroppedImage: function(cropped,windw){
        cropped.id=1;
        //alert(JSON.stringify(cropped).length+":"+JSON.stringify(cropped));
        ngDexie.put('croppedImage',cropped).then(function(){
          //alert("success");
          if (windw){
            windw.close();
          }
        },function(){
          alert("failed");
        });

      },
      getCroppedImage: function(){
        return ngDexie.list('croppedImage').then(function(data){
          //console.log("===data:::"+JSON.stringify(data));
          return data[0];
        });
      },
      getDb: function(){
        return ngDexie.getDb();
      }
    };

    return svc;
  });
