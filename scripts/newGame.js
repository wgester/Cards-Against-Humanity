window.newGame = {};

newGame.getShuffledIndices = function(num){
  var shuffledIndices = [];
  for (var i = 0; i < num; i++){
    shuffledIndices.push(i);
  }
  shuffleArray = function(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };
  return shuffleArray(shuffledIndices);
};