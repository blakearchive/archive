angular.module("blake").directive('toTopOnBroadcast',function(){
  var link = function(scope,element,attr) {
      if(attr.toTopOnBroadcast){
          scope.$on(attr.toTopOnBroadcast,function(){
              if(attr.target){
                  $(element).find(attr.target).each(function(k,v){
                      $(v).animate({scrollTop: 0}, 'fast');
                  });
              } else {
                $(element).animate({scrollTop: 0}, 'fast');
              }
          })
      }
  };

  return {
      restrict: 'A',
      link: link
  }
});