angular.module('App', ['ngRoute', 'cardsAgainstHumanity', 'login', 'user', 'allGames', 'userHand'])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/main', {
        templateUrl: 'partials/main.html',
        // controller: 'Game'
      }).
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
      if ( $rootScope.loggedUser === null || $rootScope.auth === undefined ) {
        // no logged user, we should be going to #login
          // not going to #login, we should redirect now
        $location.path( "/login" );
      }         
    });
 })

angular.module('login', ['firebase'])

.controller('Auth', ['$scope', '$firebase', '$rootScope', '$location', '$timeout',
  function($scope, $firebase, $rootScope, $location, $timeout){
    var chatRef = new Firebase('https://cardgames.firebaseio.com');
    $rootScope.auth = new FirebaseSimpleLogin(chatRef, function(error, user) {
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

        $scope.loggedIn = "User " + user.id + " is logged in!";
          $rootScope.loggedUser = 'true';
          $rootScope.user = user;
          $rootScope.username = $firebase(chatRef.child('users').child(user.id).child('username'));
          console.log($rootScope.username)
          $timeout(function(){
            //Needs to be changed, absolute path currently
            console.log($rootScope.loggedUser, $rootScope.user, $location.path());
            $location.path("/main");
            
            console.log($location.path());
          }, 0);
      } else {
        console.log('User logged out');
        $rootScope.loggedUser = null;
      }
    });
    $scope.authorizeUser = function(){
      if ($scope.signUpUsername){
        $rootScope.auth.createUser($scope.signUpEmail, $scope.signUpPassword, function(error, user) {
          if (!error) {
            console.log('User Id: ' + user.id + ', Email: ' + user.signUpEmail);
          }
          chatRef.child('users').child(user.id).child('username').set($scope.signUpUsername);
          $rootScope.auth.login('password', {
            email: $scope.signUpEmail,
            password: $scope.signUpPassword
          });
        });
      }
    };
    $scope.login = function(){
      $rootScope.auth.login('password', {
        email: $scope.email,
        password: $scope.password
      });
    };
   
  }])

angular.module('cardsAgainstHumanity', ['firebase'])

.controller('Game', ['$scope', '$firebase', '$rootScope', '$location', '$timeout',
  function($scope, $firebase, $rootScope, $location, $timeout){
    if (!$rootScope.gameName){
      $timeout(function(){
        $location.path("/main");
      }, 0);
    }
    var ref = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/');
    var playerRef = $firebase(ref.child('games').child($rootScope.gameName).child('users'));
    
    $scope.whiteCardCount = 0;
    $scope.blackCardCount = 0;
    $scope.players = playerRef.$getIndex();

    $scope.dealNewHand = function(players){
      var cardRef = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/games/' + $rootScope.gameName + '/whiteCards');
      var playerData = [];
      for (var i = 0; i < players.length; i++){
        playerData.push(playerRef.$child(players[i]));
      }
      $timeout(function(){
        for (var i = 0; i < playerData.length; i++){
          if (!playerData.dealt){
            cardRef.once('value', function(snapshot){
              for (var j = $scope.whiteCardCount; j < ($scope.whiteCardCount + 7); j++){
                var tempCard = snapshot.child(j).val();
                playerRef.$child(players[i]).$child('cards').$add(tempCard);
              }
              $scope.whiteCardCount += 7;
                
            })
            playerRef.$child(players[i]).$child('dealt').$set(true);
          }
        }
      },0);
    }
    $scope.dealNewHand($scope.players);



    // for (var i = 0; i < 7; i++){
    //   var tempIndex = Math.floor( 792 * Math.random() );
    //   ref.child('game').child('whiteCardsPlayed').child(tempIndex).set(true, function(){
    //   });
    //   var tempCard = $firebase(ref.child('cards').child('white').child(tempIndex));
    //   $scope.whiteCards[tempIndex] = tempCard;
    // }




    // var tempIndex = Math.floor( 179 * Math.random() );
    // var tempCard = $firebase(ref.child('cards').child('black').child(tempIndex));
    // $scope.blackCard[tempIndex] = tempCard;



    //connection status?
    var connectedRef = new Firebase("https://cardGames.firebaseio.com/.info/connected");
    connectedRef.on("value", function(snap) {
      if (snap.val() === true) {
      } else {
        ref.child('/games/' + $rootScope.gameName + '/users/' + $rootScope.user.id).set(null);
      }
    });

    // window.onbeforeunload = function(){
    //   return "You have attempted to leave this page. Are you sure you want to leave the game?";
    //   $rootScope.leftGame = true;
    //   console.log($rootScope.leftGame);
    //   ref.child('/games/' + $rootScope.gameName + '/users/' + $rootScope.user.id).set(null);
    // };
    
  }])

angular.module('userHand', ['firebase'])

.controller('UserHand', ['$scope', '$firebase', '$rootScope', '$location', '$timeout',
  function($scope, $firebase, $rootScope, $location, $timeout){
    if (!$rootScope.gameName){
      $timeout(function(){
        $location.path("/main");
      }, 0);
    }
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



    //connection status?
    var connectedRef = new Firebase("https://cardGames.firebaseio.com/.info/connected");
    connectedRef.on("value", function(snap) {
      if (snap.val() === true) {
      } else {
        ref.child('/games/' + $rootScope.gameName + '/users/' + $rootScope.user.id).set(null);
      }
    });

  }])

angular.module('allGames', ['firebase'])

.controller('AllGames', ['$scope', '$firebase', '$rootScope', '$location', '$timeout',
  function($scope, $firebase, $rootScope, $location, $timeout){

    var ref = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/');
    console.log("Sent")
    $scope.ref = $firebase(ref);
    $scope.ref.$on('loaded', function(){
      $scope.games = $scope.ref.$child('games').$getIndex();
      console.log($scope.games, $scope.$$phase);
    });

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
      absRef.child('/games/' + $scope.gameName + '/gameName').set($scope.gameName);
      absRef.child('/games/' + $scope.gameName + '/users/' + $rootScope.user.id).set({'username':$rootScope.username.$value, 'dealt':false, 'cards':1});
      $rootScope.gameName = $scope.gameName;
      $location.path("/game");
    };


    $scope.joinGame = function(gameName){
      ref.child('/games/' + gameName + '/users/' + $rootScope.user.id).set({'username':$rootScope.username.$value, 'dealt':false, 'cards':1});
      $rootScope.gameName = gameName;
      $location.path("/game");
    };
    
  }])

angular.module('user', ['firebase'])

.controller('User', ['$scope', '$firebase', '$rootScope', '$location',
  function($scope, $firebase, $rootScope, $location){
    

    $scope.logout = function(){
      $rootScope.auth.logout();
      console.log("logged out");
      $scope.loggedIn = null;
      $rootScope.loggedUser = null;
      $location.path("/login");
    };

  }])
