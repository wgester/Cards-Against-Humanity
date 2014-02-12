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
    var playerRefer = ref.child('games').child($rootScope.gameName).child('users');
    var whiteRef = ref.child('games').child($rootScope.gameName).child('whiteCardCount');
    whiteRef.on('value', function(snapshot){
      $scope.whiteCardCount = snapshot.val();
    });
    var blackRef = ref.child('games').child($rootScope.gameName).child('blackCardCount');
    blackRef.on('value', function(snapshot){
      $scope.blackCardCount = snapshot.val();
    })
    $scope.players = playerRef.$getIndex();

    $scope.dealNewHand = function(players){
      var cardRef = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/games/' + $rootScope.gameName + '/whiteCards');
      var playerData = [];
      for (var i = 0; i < players.length; i++){
        playerData.push(playerRef.$child(players[i]));
      }
      $timeout(function(){
        for (var i = 0; i < playerData.length; i++){
          if (!playerData[i].dealt){
            cardRef.once('value', function(snapshot){
              console.log(players[i], 'here')
              for (var j = $scope.whiteCardCount; j < ($scope.whiteCardCount + 7); j++){
                var tempCard = snapshot.child(j).val();
                playerRefer.child(players[i]).child('cards').child(j).set({'Text': tempCard.Text, 'id':j});
              }
              whiteRef.set($scope.whiteCardCount + 7);
                
            })
            playerRef.$child(players[i]).$child('dealt').$set(true);
          }
        }
      },0);
    }
    $scope.dealNewHand($scope.players);

    $scope.playHand = function(){
      
    }
    
    var userRef = ref.child('games').child($rootScope.gameName).child('users');
    userRef.on('value', function(snapshot){
      $scope.userData = snapshot.val();
    })
    





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
    var userRef = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/games/' + $rootScope.gameName + '/users/' + $rootScope.user.id);
    $scope.whiteCards = {};
    
    userRef.child('cards').on('value', function(snapshot){
      $scope.whiteCards = {};
      for (var key in snapshot.val()){
        $scope.whiteCards[key] = snapshot.val()[key] 
      }
    });

    var ref = new Firebase('https://cardgames.firebaseio.com/cardsAgainstHumanity/games/' + $rootScope.gameName);

    var inPlayRef = ref.child('chosenCards');
    inPlayRef.on('value', function(snapshot){
      $scope.inPlay = snapshot.val();
      console.log($scope.inPlay)
    })
    
    userRef.child('picked').on('value', function(snapshot){
      $scope.picked = snapshot.val();
    })

    userRef.child('judge').on('value', function(snapshot){
      $scope.judge = snapshot.val();
    })

    $scope.pickWinner = function(card){
      if ($scope.judge){
        ref.child('users').child(card).child('score').once('value', function(snapshot){
          ref.child('users').child(card).child('score').set(snapshot.val() + 1);
          userRef.child('picked').set(false);
          userRef.child('judge').set(false);
          ref.child('users').child(card).child('judge').set(true);
          ref.child('chosenCards').set(null);
        });
        ref.once('value', function(snapshot){
          var blackCount = snapshot.child('blackCardCount').val();
          ref.child('blackCardCount').set(blackCount + 1);
        })
      }
    }

    $scope.pickCard = function(card){
      if (!$scope.picked){
        $scope.chosenCard = card.Text;
        userRef.child('cards').child(card.id).set(null);
        ref.child('chosenCards').child($rootScope.user.id).set({'Text':card.Text, 'id':$rootScope.user.id});
        userRef.child('picked').set(true);
        ref.once('value', function(snapshot){
          var whiteCount = snapshot.child('whiteCardCount').val();
          var tempCard = snapshot.child('whiteCards').child(whiteCount).val();
          userRef.child('cards').child(whiteCount).set({'Text': tempCard.Text, 'id':whiteCount});
          ref.child('whiteCardCount').set(whiteCount + 1);
        })
      }
    };


   
    var blackRef = ref.child('blackCardCount');
    blackRef.on('value', function(snapshot){
      $scope.blackCardCount = snapshot.val();
      ref.once('value', function(snapshot2){
        
        var blackCard = snapshot2.child('blackCards').child($scope.blackCardCount).val();
        $scope.blackCard = {'0':blackCard};
      });
    });
    
    // $scope.blackCard = {};
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
      absRef.child('/games/' + $scope.gameName + '/blackCardCount').set(0);
      absRef.child('/games/' + $scope.gameName + '/whiteCardCount').set(0);
      absRef.child('/games/' + $scope.gameName + '/users/' + $rootScope.user.id).set({'username':$rootScope.username.$value, 'dealt':false, 'cards':1, 'score':0, 'judge': true, 'picked': false});
      $rootScope.gameName = $scope.gameName;
      $location.path("/game");
    };


    $scope.joinGame = function(gameName){
      ref.child('/games/' + gameName + '/users/' + $rootScope.user.id).set({'username':$rootScope.username.$value, 'dealt':false, 'cards':1, 'score':0, 'judge':false, 'picked': false});
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
