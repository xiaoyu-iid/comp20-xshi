var game =  new Phaser.Game('90', '90', Phaser.AUTO);

game.global = {
	score : 0
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('level1', level1State);

game.state.start('boot');