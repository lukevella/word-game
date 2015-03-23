angular.module('wordGame')
.directive('keypress', function(){
    return {
        restrict : 'A',
        controller : function($document, $rootScope){
            $document.bind('keydown', function(e) {
                var keyCode = e.which;
                $rootScope.$broadcast('keypress', e);

                //keyCode is esc
                if (keyCode == 27){
                    $rootScope.$broadcast('keypress:esc', e);
                }

                // keyCode is a character between a-z
                if (keyCode >= 65 && e.which <= 90){
                    $rootScope.$broadcast('keypress:char', e, String.fromCharCode(e.which));
                }

            });
        }
    }
});
