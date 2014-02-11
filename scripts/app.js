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
.controller('Game', ['$scope', '$firebase',
  function($scope, $firebase){
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
