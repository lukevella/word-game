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


angular.module('wordGame',[])
.controller('MainCtrl', function($scope, $http, $interval, $timeout){

    $scope.userInput = "";
    $scope.timeLeft = 0;
    $scope.score = 0;
    $scope.gameInProgress = false;
    $scope.word = ""; // the target word to guess
    $scope.scrambled = ""; // the target word in scrambled form
    $scope.characterStore = [];
    $scope.characters = ""; // the characters that are available for the user to guess from

    $scope.inputStatus = "default"; // inputStatus = default|correct|incorrect

    $scope.startGame = function(){
        $scope.userInput = "";
        $scope.timeLeft = 15;
        $scope.score = 0;
        $scope.gameInProgress = true;
        getNewWord();

        $scope.timer = $interval(function(){
            if ($scope.timeLeft > 0) {
                $scope.timeLeft--;
            } else {
                $scope.gameOver();
            }
        }, 1000);
    };

    $scope.gameOver = function(){
        $scope.gameInProgress = false;
        $interval.cancel($scope.timer);
    }

    $scope.$watch('userInput', function(newValue){
        if ($scope.word && newValue.length == $scope.word.length) {
            if (newValue == $scope.word) {
                $scope.inputStatus = "correct";
                $scope.timeLeft += 5; // add 5 seconds to the clock
                $scope.score += Math.pow(2,$scope.word.length); // exponential score based on word length
                getNewWord();
            } else {
                $scope.inputStatus = "incorrect";
                $timeout(function(){
                    resetInput();
                }, 500);
            }
        }
    });

    // When pressing escape the input should reset
    $scope.$on('keypress:esc', function(){
        if (!$scope.gameInProgress) return;
        $scope.$apply(function(){
            resetInput();
        })
    });

    // When pressing an alphabet character
    $scope.$on('keypress:char', function(e, keyEvent, char){
        // Check if char is in the list of characters
        if (!$scope.gameInProgress) return;
        for (var i = 0; i < $scope.characterStore.length; i++){
            if (!$scope.characterStore[i].used && $scope.characterStore[i].char == char){
                $scope.$apply(function(){
                    // Remove instance of char from the list of characters
                    $scope.characterStore[i].used = true;
                    // Add char to the users input
                    $scope.userInput += char;
                })
                break;
            }
        }
    });

    // Get the word from the API
    var getNewWord = function(){
        $http.jsonp("http://api.wordnik.com/v4/words.json/randomWord?callback=JSON_CALLBACK&hasDictionaryDef=false&minCorpusCount=10000&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=4&maxLength=6&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5")
            .success(function(data){
                $scope.word = data.word.replace(/[-']/g, "").toUpperCase(); // remove dash from compound words
                $scope.scrambled = $scope.word.scramble(); // scramble the word;
                resetInput();
            });
    }

    var resetInput = function(){
        $scope.userInput = "";
        $scope.characters = $scope.scrambled;
        $scope.characterStore = [];
        for (var i = 0; i < $scope.scrambled.length; i++){
            $scope.characterStore.push({
                char : $scope.scrambled[i],
                used : false
            });
        }
        $scope.inputStatus = "default";
    }

    $scope.startGame();

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

                if (keyCode == 8) {
                    $rootScope.$broadcast('keypress:backspace', e, String.fromCharCode(e.which));
                }

            });
        }
    }
});
