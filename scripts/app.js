angular.module('App', ['ngRoute', 'cardsAgainstHumanity', 'login'])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/game', {
        templateUrl: 'partials/game.html',
        // controller: 'Game'
      }).
      when('/login', {
        templateUrl: 'partials/login.html',
        // controller: 'Auth'
      }).
      otherwise({
        redirectTo: '/login'
      });
}])

.run( function($rootScope, $location) {

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if ( $rootScope.loggedUser == null ) {
        // no logged user, we should be going to #login
        if ( next.templateUrl == "partials/login.html" ) {
          // already going to #login, no redirect needed
        } else {
          // not going to #login, we should redirect now
          $location.path( "/login" );
        }
      }         
    });
 })

angular.module('login', ['firebase'])

.controller('Auth', ['$scope', '$firebase', '$rootScope',
  function($scope, $firebase, $rootScope){
    var chatRef = new Firebase('https://cardgames.firebaseio.com');
    var auth = new FirebaseSimpleLogin(chatRef, function(error, user) {
      if (error) {
        // an error occurred while attempting login
        switch(error.code) {
          case 'INVALID_EMAIL': 
            console.log("EMAIL");
            break;
          case 'INVALID_PASSWORD':
            console.log("PASSWORD");
            break;
          default:
            console.log("Something else?");
        }
      } else if (user) {
        // user authenticated with Firebase
        console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
        window.user = user;
        $scope.loggedIn = "User " + user.id + " is logged in!";
        $rootScope.loggedUser = 'true';
      } else {
        console.log('User logged out');
        $rootScope.loggedUser = null;
      }
    });
    $scope.authorizeUser = function(){
      auth.createUser($scope.signUpEmail, $scope.signUpPassword, function(error, user) {
        if (!error) {
          console.log('User Id: ' + user.id + ', Email: ' + user.signUpEmail);
        }
        auth.login('password', {
          email: $scope.signUpEmail,
          password: $scope.signUpPassword
        });
      });
    };
    $scope.login = function(){
      auth.login('password', {
        email: $scope.email,
        password: $scope.password
      });
    };
    $scope.logout = function(){
      auth.logout();
      console.log("logged out");
      $scope.loggedIn = null;
      window.user = null;
      $rootScope.loggedUser = null;
    };
  }])

angular.module('cardsAgainstHumanity', ['firebase'])

// .controller('Cards', ['$scope', '$firebase',
//     function($scope, $firebase) {
      // var ref = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/');
      // $scope.whiteCards = {};
      // for (var i = 0; i < 7; i++){
      //   var tempIndex = Math.floor( 792 * Math.random() );
      //   ref.child('game').child('whiteCardsPlayed').child(tempIndex).set(true, function(){
      //     console.log(ref.child('game').child('whiteCardsPlayed'))
      //   });
      //   var tempCard = $firebase(ref.child('cards').child('white').child(tempIndex));
      //   $scope.whiteCards[tempIndex] = tempCard;
      // }
      // $scope.blackCard = {};
      // var tempIndex = Math.floor( 179 * Math.random() );
      // var tempCard = $firebase(ref.child('cards').child('black').child(tempIndex));
      // $scope.blackCard[tempIndex] = tempCard;
//     }])
.controller('Game', ['$scope', '$firebase', '$rootScope',
  function($scope, $firebase, $rootScope){
    var ref = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/');
    $scope.whiteCards = {};
    for (var i = 0; i < 7; i++){
      var tempIndex = Math.floor( 792 * Math.random() );
      ref.child('game').child('whiteCardsPlayed').child(tempIndex).set(true, function(){
      });
      var tempCard = $firebase(ref.child('cards').child('white').child(tempIndex));
      $scope.whiteCards[tempIndex] = tempCard;
    }
    $scope.blackCard = {};
    var tempIndex = Math.floor( 179 * Math.random() );
    var tempCard = $firebase(ref.child('cards').child('black').child(tempIndex));
    $scope.blackCard[tempIndex] = tempCard;

    $scope.newGame = function(){
      var dealOrderForWhite = newGame.getShuffledIndices(792);
      var dealOrderForBlack = newGame.getShuffledIndices(179);
      var ref = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/cards');
      var absRef = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/');
      ref.on('value', function(snapshot){
        for (var i = 0; i < dealOrderForWhite.length; i++){
          var tempCard = snapshot.child('/white/' + dealOrderForWhite[i]).val();
          absRef.child('/games/' + $scope.gameName + '/whiteCards/' + i).set(tempCard);
        }
        for (var i = 0; i < dealOrderForBlack.length; i++){
          var tempCard = snapshot.child('/black/' + dealOrderForBlack[i]).val();
          absRef.child('/games/' + $scope.gameName + '/blackCards/' + i).set(tempCard);
        }
      });
    };



  }])
