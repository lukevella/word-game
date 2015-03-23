angular.module('wordGame',[])
.controller('MainCtrl', function($scope, $http){

    $scope.userInput = "";
    $scope.timeLeft = 0;
    $scope.score = 0;
    $scope.hintsLeft = 0;

    $scope.$watch('userInput', function(newValue){
        if ($scope.word && newValue.length == $scope.word.length) {
            if (newValue == $scope.word) {
                getNewWord();
            } else {

            }

        }
    });

    // Returns a scrambled version of a string in lower case letters
    String.prototype.scramble = function(){
        var index,
            scrambledString = "",
            string  = this.toUpperCase();

        while (string.length > 0) {
            index = Math.floor(Math.random() * string.length);
            scrambledString += string[index];
            string = string.removeCharAt(index);
        }

        return scrambledString;
    };

    // Removes the character at the specified index in the string
    String.prototype.removeCharAt = function(index){
        return this.slice(0, index) + this.slice(index + 1);
    };

    // When pressing escape the input should reset
    $scope.$on('keypress:esc', function(){
        $scope.$apply(function(){
            resetInput();
        })
    });

    // When pressing an alphabet character
    $scope.$on('keypress:char', function(e, keyEvent, char){
        // Check if char is in the list of characters
        var index = $scope.characters.indexOf(char);
        if (index != -1) {
            $scope.$apply(function(){
                // Remove instance of char from the list of characters
                $scope.characters = $scope.characters.removeCharAt(index);
                // Add char to the users input
                $scope.userInput += char;
            })
        }
    })

    // Get the word from the API
    var getNewWord = function(){
        $http.jsonp("http://api.wordnik.com/v4/words.json/randomWord?callback=JSON_CALLBACK&hasDictionaryDef=false&minCorpusCount=10000&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=4&maxLength=6&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5")
            .success(function(data){
                resetInput();
                $scope.word = data.word.replace("-", "").toUpperCase(); // remove dash from compound words
                var scrambled = data.word.scramble(); // scramble the word
                $scope.scrambled = scrambled;
                $scope.characters = scrambled;
            });
    }

    var resetInput = function(){
        $scope.userInput = "";
        $scope.characters = $scope.scrambled;
    }

    getNewWord();
})
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
