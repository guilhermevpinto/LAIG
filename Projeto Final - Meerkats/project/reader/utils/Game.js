var ROUND_TIME = 60000;
var MAX_COLOR_AREA = 15;

function Game(scene) {

	this.scene = scene;
	this.players = [];
	this.roundMove = 'drop';
	this.roundNumber = 1;
	this.score = [0, 0, 0, 0];
	this.winner = null;

	this.board = new MyBoard(scene);
	this.scoreBoard = new MyScoreBoard(scene);
	this.movePannel = new MyScreen(scene, 'iluminated', 'drop', false);
	this.timer = new MyMarker(scene, 'iluminated');
	this.timer.first = 6;
	this.timer.second = 0;
	this.roundTime = 0;

	this.stones = [];
	this.remainingStones = [];
	this.prepareStones();

	this.animation = false;
	this.updateScore = false;
	this.validDragPositions = false;

	this.pickedStone = null;
	this.playedStone = null;
	this.pickedBoardTile = null;

	this.replays = 0;
	this.rewinds = 0;
	this.undo = false;
	this.undoRegister = [];

	this.currentPlayer = null;
	this.isBotTurn = false;

	this.botCanPlay = false;
	this.botCanDrag = false;
	this.moveHasFinished = false;

	//Ver se pode fazer o pickstone e pickTile no DROP
	this.botCanPickStoneDROP = false;
	this.botCanPickTileDROP = false;
	//Ver se pode fazer o pickstone e pickTile no DRAG
	this.botCanPickStoneDRAG = false;
	this.botCanPickTileDRAG = false;

};


Game.prototype = Object.create(Object.prototype);
Game.prototype.constructor = Game;



//Controla as principais açoes durante a execuçao do jogo
Game.prototype.handler = function(){

	//controlo da execuçao do replay, calculando quandos retrocessos deve realizar e quantos replays deverá apresentar
	if(this.rewinds > 0 && !this.animation){
		this.processUNDO();
		this.rewinds--;
	}
	else if(this.replays > 0 && !this.animation){
		this.processREPLAY();
		this.replays--;
	}

	//termina a execução do jogo e apresenta o vencedor
	if(this.endGame && this.winner != null && !this.animation)
	{
		var screenTexture = null;
		var screenMaterial = null;

		if(this.winner.length == 0)
		{
			screenTexture = 'draw';
			screenMaterial = 'orange';
		}
		else{
			screenTexture = this.winner[0] + "Won";
			switch(this.winner[1]){
				case 1:
					screenMaterial = 'blueMarker';
					this.animateStones('blueStone');
					break;
				case 2:
					screenMaterial = 'redMarker';
					this.animateStones('redStone');
					break;
				case 3:
					screenMaterial = 'greenMarker';
					this.animateStones('greenStone');
					break;
				case 4:
					screenMaterial = 'yellowMarker';
					this.animateStones('yellowStone');
					break; 
				default: break;
			}
		}

		this.scene.stateMachine.endScreen = new MyScreen(this.scene, screenMaterial, screenTexture, true);
		this.scene.stateMachine.currentState = 'EndScreen';
		return;
	}

	//se as rondas do jogo forem superiores a 15, poderá ocorrer uma situação de vitoria
	var groupOf15 = this.score.indexOf(MAX_COLOR_AREA) + 1;
	if((this.colorAssigned(groupOf15) || this.remainingStones.length == 0) && !this.endGame)
	{
		this.endGame = true;

		var stringBoard = this.scene.socket.processBoardToString();
		var requestString = "[checkWinner," + stringBoard + ",_Result]";
		this.scene.socket.sendRequest(requestString, 'winner');
		return;
	}

	this.updateTimer();

	//recolhe a informaçao relativa a cores sorteadas para cada jogador
	if(this.scene.socket.colorsResponse != null)
		this.generatePlayersList();

	//INICIO DA PARTE DE JOGADA DO BOT

	//Quando o bot termina de jogar, caso seja a primeira ou a segunda ronda do jogo, passa convenientemente o jogo.
	if(this.players.length != 0 )
		if(this.currentPlayerIsBOT()){
			if(this.roundNumber== 1 && this.roundMove == 'pass' && this.moveHasFinished == true){
				this.moveHasFinished = false;
				this.passTurn();
			}else if(this.roundNumber>1 && this.roundMove == 'pass'  && this.moveHasFinished == true){
				this.moveHasFinished = false;
				this.passTurn();
			}
		}
		


	//caso seja um bot a jogar, é preciso ir fazer um pedido ao prolgo para saber onde se vai jogar
	if(this.isBotTurn && this.scene.socket.botResponseDROP == null && this.remainingStones.length > 0 && this.scene.cameraAnimation.span == 0) {
		this.isBotTurn=false;

		//fazer o pedido ao prolog para que o bot possa ter a resposta para  -->DROP
		var board = this.scene.socket.processBoardToString();
		var remainingStones =  this.scene.socket.processRemainingStonesToString();
		var requestString = "[stoneDropBOT,"+ board+","+ remainingStones + ",_IDstone,_Xpos,_Ypos]";
		this.scene.socket.sendRequest(requestString, 'botdrop');
		this.botCanPickStoneDROP=true;
	}
	//Seleciona a peça à volta do tabuleiro de acordo com a resposta do prolog que vai conter o ID da pedra e a posição
	if(this.botCanPickStoneDROP == true && this.scene.socket.botResponseDROP !=null){
		this.botCanPickStoneDROP=false;
		var response = this.scene.socket.botResponseDROP;

		//resultados da resposta do prolog que vem num array deste genero [2,5,6]
		var stoneID = response[0];
		//funções responsáveis por irem buscar os obj para enviar ao picking
		var stone = this.getRegistedStone(stoneID);

		//vai fazer o picking
		this.pickingStone(stone);

		this.updateStones(stoneID);
		this.botCanPickTileDROP=true;
	}
	//coloca a peça no tabuleiro de acordo com a resposta do prolog no tile selecionado pela posição Xpos, Ypos
	if(this.botCanPickTileDROP == true && this.scene.socket.botResponseDROP !=null){
		this.botCanPickTileDROP = false;
		//console.warn("Fazer o picking TILE para o DROP!");
		var response = this.scene.socket.botResponseDROP;

		//resultados da resposta do prolog que vem num array deste genero [2,5,6]
		var Xpos = response[1];
		var Ypos = response[2];
		//funções responsáveis por ir buscar tile para enviar ao picking
		var tile = this.board.getRegistedBoard(Xpos,Ypos);

		this.pickingTile(tile);
		this.botCanDrag=true;

	}
	//quando a animação da movimentação da peça do DROP acabar
	if(this.botCanDrag==true && this.scene.socket.botResponseDROP!=null && this.moveHasFinished == true){
		this.botCanDrag=false;
		//caso não seja a primeira ronda, vai realizar o drag de uma peça, fazendo assim um pedido ao prolog
		if(this.roundNumber !=1){
			this.moveHasFinished=false;
			var board = this.scene.socket.processBoardToString();
			var XplayedStone = this.scene.socket.botResponseDROP[1];
			var YplayedStone = this.scene.socket.botResponseDROP[2];
			var requestString = "[stoneDragBOT,"+ board+",[\""+ XplayedStone +"\"],[\""+YplayedStone+ "\"],_Xinicial,_Yinicial,_Xfinal,_Yfinal]";
			this.scene.socket.sendRequest(requestString, 'botdrag');
		}else{
			//caso seja a primeira ronda não faz o drag e termina a jogada para passar para o próximo jogador
			return;
		}
		this.botCanPickStoneDRAG=true;
	}
	//Caso seja uma ronda > 1, o bot faz o drag de uma peça aleatória escolhida pelo PROLOG para fazer o DRAG. O prolog
	//dirá qual a peça a movimentar e para que posição retornando assim um array deste género [Xinicial,Yinicial,Xfinal,Yfinal]
	//sendo Xinicial,Yinicial a posição da peça a movimentar e Xfinal,Yfinal a posição final
	//nesta funcção faz o picking da peça a selecionar para realizar o DRAG desta
	if(this.botCanPickStoneDRAG == true && this.scene.socket.botResponseDROP!=null && this.scene.socket.botResponseDRAG!=null && this.playedStone != null){
		this.botCanPickStoneDRAG =false;

		var response = this.scene.socket.botResponseDRAG;
		var Xinicial = response[0];
		var Yinicial = response[1];
		//pedra que se vai mover
		var movingStone = this.getRegistedStoneFromPos(Xinicial,Yinicial);

		this.pickingStone(movingStone);

		this.botCanPickTileDRAG = true;
	}
	//Depois da peça selecionada, faz amovimentação da peça e coloca-a no tile selecionado pelo prolog, o Xfinal,Yfinal
	if(this.botCanPickTileDRAG==true && this.scene.socket.botResponseDROP!=null && this.scene.socket.botResponseDRAG!=null && this.scene.socket.boardResponse!=null ){
		this.botCanPickTileDRAG=false;

		var response = this.scene.socket.botResponseDRAG;
		this.board.highlightDragPositions(this.scene.socket.boardResponse);
		var Xfinal = response[2];
		var Yfinal = response[3];
		//pedra que se vai mover
		var tileToMove = this.board.getRegistedBoard(Xfinal,Yfinal);

		this.pickingTile(tileToMove);
		this.canPass=true;
	}

	//FIM DO BOT


	//se o socket contiver informação respetiva ao arrasto de uma peça, o tabuleiro é alterado
	if(this.validDragPositions && this.scene.socket.boardResponse != null)
	{
		this.board.highlightDragPositions(this.scene.socket.boardResponse);
		this.validDragPositions = false;
		this.scene.socket.boardResponse = null;
	}
	//se o socket contiver informaçao respetiva a novos valores de score, o array de scores é atualizado
	if(this.updateScore && this.scene.socket.scoreResponse != null)
	{
		this.updateGameScore();
		this.updateScore = false;
		this.scene.socket.scoreResponse = null;
	}
};

//Inicializa o array de pedras respetivas ao jogo
Game.prototype.prepareStones = function(){
	var id = 1;
	var radius = 12;
	var angleStep = 2*Math.PI/60;
	var angle = 0;
	for(var i = 0; i < 4; i++)
	{
		for(var j = 0; j < 15; j++)
		{
			var position = new Coords(radius*Math.sin(angle), 0, radius*Math.cos(angle));

			if(i == 0){
				this.stones.push(new MyStone(this.scene, id, 'blueStone', position));
				this.remainingStones.push(id);
			}
			else if(i == 1){
				this.stones.push(new MyStone(this.scene, id, 'redStone', position));
				this.remainingStones.push(id);
			}		
			else if(i == 2){
				this.stones.push(new MyStone(this.scene, id, 'yellowStone', position));
				this.remainingStones.push(id);
			}
			else if(i == 3){
				this.stones.push(new MyStone(this.scene, id, 'greenStone', position));
				this.remainingStones.push(id);
			}

			angle += angleStep;
			id++;
		}
	}
};

//Handler de controlo do picking dos objectos do jogo, diferenciando Pedras das Peças do tabuleiro
Game.prototype.picking = function(obj){
	if(!this.currentPlayerIsBOT()){
		if(obj[0] instanceof MyStone)
			this.pickingStone(obj);
		else if(obj[0] instanceof MyBoardTile)
			this.pickingTile(obj);
	}
};

// Handler responsavel pelo controlo de Pedras selecionadas pelo picking
Game.prototype.pickingStone = function(obj){
	//restrição para picking das peças, dependendo do movimento esperado (DROP ou DRAG)
	if((this.roundMove == 'drop' && obj[0].settledTile == null) || (this.roundMove == 'drag' && obj[0].settledTile != null && obj[0].id != this.playedStone.id))
	{

		if(this.pickedStone != null)
		{
			if(this.pickedStone.id == obj[0].id)
			{
				this.pickedStone.picked = false;
				this.pickedStone = null;
				this.board.resetHighlight();
				return;
			}
			else {
				this.pickedStone.picked = false;
				this.pickedStone = null;
				this.board.resetHighlight();
			}
			

			//se a pickedStone for a mesma que a peça selecionada, elimina-se a seleçao e termina se a execuçao da funcao
			
		}

		obj[0].picked = true;
		this.pickedStone = obj[0];

		if(this.roundMove == 'drop')
			this.board.highlightDropPositions();
		else if(this.roundMove == 'drag')
		{
			this.validDragPositions = true;
			//realiza pedido ao ProLog para identificação de possiveis destinos de movimento da pedra selecionada
			var stringBoard = this.scene.socket.processBoardToString();
			var requestString = "[validDragPositions," + this.pickedStone.settledTile.row + ',' + this.pickedStone.settledTile.col + ',' + stringBoard + ",_Result" + "]";
			this.scene.socket.sendRequest(requestString, 'board');
		}
	}
};

//Hendler responsavel pelo controlo das Peças do tabuleiro selecionadas
Game.prototype.pickingTile = function(obj){
	//um tile so pode ser selecionado se estiver marcado com 'highlight' e se uma Pedra ja tiver sido selecionada
	if(this.pickedStone != null && obj[0].highlight)
	{

		if(this.roundMove == 'drag')
			this.pickedStone.settledTile.info = 0;

		this.pickedBoardTile = obj[0];
		this.saveUNDO();
		//guardar na stone o tile onde ela vai ficar
		this.pickedStone.settledTile = obj[0];
		this.animation = true;
		if(!this.currentPlayerIsBOT())
			this.updateStones(obj[0].id);
		this.moveStone(obj[0]);
		this.board.resetHighlight();

		//com a movimentação de uma pedra, o score é atualizado
		this.updateScore = true;
		var stringBoard = this.scene.socket.processBoardToString();
		var requestString = "[checkScore," + stringBoard + ",_Result]";
		this.scene.socket.sendRequest(requestString, 'score');
	}
};

// função de desenho da cena de jogo
Game.prototype.display = function(){

	if(this.scene.stateMachine.currentState == 'Gameplay' || this.scene.stateMachine.currentState == 'EndScreen')
	{

		this.scene.pushMatrix();
		this.scene.translate(-4.5,-2.5,-10);
		this.scene.rotate(Math.PI/6, 0, 1, 0);
		//this.scene.rotate(Math.PI/30, 0, 0, 1);
		this.scene.scale(0.6, 0.6, 0.6);
		this.timer.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
		this.scene.translate(-2.5,2.5,-10);
		this.scene.rotate(Math.PI/6, 0, 1, 0);
		this.scene.rotate(Math.PI/30, 0, 0, 1);
		this.scene.scale(0.4, 0.4, 0.4);
		this.scoreBoard.display();
		this.scene.popMatrix();

		if(this.currentPlayer instanceof MyScreen)
		{
			this.scene.pushMatrix();
			this.scene.translate(4,2.5,-10);
			this.scene.scale(2, 1, 1);
			this.currentPlayer.display();
			this.scene.popMatrix();
		}

		this.scene.pushMatrix();
		this.scene.translate(4,-2.5,-10);
		this.scene.scale(2, 1, 1);
		this.movePannel.display();
		this.scene.popMatrix();
	}

	this.scene.pushMatrix();
	this.scene.applyViewMatrix();
	this.board.display();
	this.displayStones();
	this.scene.popMatrix();
};

// função de display e registo das peças do jogo
Game.prototype.displayStones = function(){
	for(var i = 0; i < this.stones.length; i++)
	{
		this.scene.pushMatrix();
		this.scene.translate(this.stones[i].position.x,this.stones[i].position.y+0.2,this.stones[i].position.z);
		this.scene.register(this.stones[i]);
		this.stones[i].display();
		this.scene.graph.pickID++;
		this.scene.popMatrix();
	}
};

//função responsavel pela atualização do score nos marcadores de jogo
Game.prototype.updateGameScore = function(){
    var max = 0;
    if(this.scene.socket.scoreResponse[0][1].length > 0)
    {
        max = Math.max.apply(null, this.scene.socket.scoreResponse[0][1]);
        this.score[0] = max;
    }

    if(this.scene.socket.scoreResponse[1][1].length > 0)
    {
        max = Math.max.apply(null, this.scene.socket.scoreResponse[1][1]);
        this.score[1] = max;
    }

    if(this.scene.socket.scoreResponse[2][1].length > 0)
    {
        max = Math.max.apply(null, this.scene.socket.scoreResponse[2][1]);
        this.score[2] = max;

    }

    if(this.scene.socket.scoreResponse[3][1].length > 0)
    {
        max = Math.max.apply(null, this.scene.socket.scoreResponse[3][1]);
        this.score[3] = max;
    }

    this.updateMarkers();
};

// função responsavel pela atualização dos valores nos marcadores de jogo
Game.prototype.updateMarkers = function(){
    if(this.score[0] > 9)
            this.scoreBoard.blueMarker.first = 1;
        else this.scoreBoard.blueMarker.first = 0;

        this.scoreBoard.blueMarker.second = this.score[0] % 10;

    if(this.score[1] > 9)
            this.scoreBoard.redMarker.first = 1;
        else this.scoreBoard.redMarker.first = 0;

        this.scoreBoard.redMarker.second = this.score[1] % 10;

    if(this.score[2] > 9)
            this.scoreBoard.greenMarker.first = 1;
        else this.scoreBoard.greenMarker.first = 0;

        this.scoreBoard.greenMarker.second = this.score[2] % 10;

    if(this.score[3] > 9)
            this.scoreBoard.yellowMarker.first = 1;
        else this.scoreBoard.yellowMarker.first = 0;

        this.scoreBoard.yellowMarker.second = this.score[3] % 10;
};

//função de registo de cada jogada executada pelo jogador
Game.prototype.saveUNDO = function(){
	if(this.roundMove == 'drop')
	{
		this.undoRegister['drop'] = [];
		//pedra movida
		this.undoRegister['drop']['stone'] = this.pickedStone;
		//posição inicial da pedra
		this.undoRegister['drop']['initialPosition'] = this.pickedStone.position;
		//peça do tabuleiro selecionada
		this.undoRegister['drop']['tile'] = this.pickedBoardTile;
		
		//valores do score
		this.undoRegister['drop']['score'] = [];
		this.undoRegister['drop']['score'][0] = this.score[0];this.undoRegister['drop']['score'][1] = this.score[1];
		this.undoRegister['drop']['score'][2] = this.score[2];this.undoRegister['drop']['score'][3] = this.score[3];
	}
	else if(this.roundMove == 'drag')
	{
		this.undoRegister['drag'] = [];
		//pedra arrastada
		this.undoRegister['drag']['stone'] = this.pickedStone;
		//pedra jogada no momento de DROP
		this.undoRegister['drag']['playedStone'] = this.playedStone;
		//posicão inicial da pedra arrastada
		this.undoRegister['drag']['initialTile'] = this.pickedStone.settledTile;
		//peça de destino no tabuleira
		this.undoRegister['drag']['finalTile'] = this.pickedBoardTile;
		//posiçao inicial da pedra
		this.undoRegister['drag']['initialPosition'] = this.pickedStone.position;

		//valores do score
		this.undoRegister['drag']['score'] = [];
		this.undoRegister['drag']['score'][0] = this.score[0];this.undoRegister['drag']['score'][1] = this.score[1];
		this.undoRegister['drag']['score'][2] = this.score[2];this.undoRegister['drag']['score'][3] = this.score[3];
	}
};

//execução de cancelamento da jogada anterior realizada pelo jogador
Game.prototype.processUNDO = function(){
	this.undo = true;


	if(this.roundMove == 'drag' || (this.roundMove == 'pass' && this.roundNumber == 1))
	{
		this.undoRegister['drop']['tile'].info = 0;
		this.undoRegister['drop']['stone'].settledTile = null;
		this.playedStone = null;
		this.pickedStone = this.undoRegister['drop']['stone'];
		this.animation = true;
		this.undoRegister['drop']['stone'].moveStone(this.undoRegister['drop']['initialPosition']);

		this.score[0] = this.undoRegister['drop']['score'][0];this.score[1] = this.undoRegister['drop']['score'][1];
		this.score[2] = this.undoRegister['drop']['score'][2];this.score[3] = this.undoRegister['drop']['score'][3];
	}
	else if(this.roundMove == 'pass'){

		switch(this.undoRegister['drag']['stone'].colorMaterial){
			case 'blueStone':
				this.undoRegister['drag']['initialTile'].info = 1;
				break;
			case 'redStone':
				this.undoRegister['drag']['initialTile'].info = 2;
				break;
			case 'greenStone':
				this.undoRegister['drag']['initialTile'].info = 3;
				break;
			case 'yellowStone':
				this.undoRegister['drag']['initialTile'].info = 4;
				break;
			default: break;
		}

		this.playedStone = this.undoRegister['drag']['playedStone'];
		this.undoRegister['drag']['finalTile'].info = 0;
		this.undoRegister['drag']['stone'].settledTile = this.undoRegister['drag']['initialTile'];
		this.animation = true;
		this.pickedStone = this.undoRegister['drag']['stone'];
		this.undoRegister['drag']['stone'].moveStone(this.undoRegister['drag']['initialPosition']);

		this.score[0] = this.undoRegister['drag']['score'][0];this.score[1] = this.undoRegister['drag']['score'][1];
		this.score[2] = this.undoRegister['drag']['score'][2];this.score[3] = this.undoRegister['drag']['score'][3];
	}

	this.updateMarkers();
};

//execuçao do replay
Game.prototype.processREPLAY = function(){
	if(this.roundMove == 'drop')
	{
		this.animation = true;
		//console.log('teste');
		this.pickedStone = this.undoRegister['drop']['stone'];
		this.moveStone(this.undoRegister['drop']['tile']);
	}
	else if(this.roundMove == 'drag'){
		this.animation = true;
		this.pickedStone = this.undoRegister['drag']['stone'];
		this.moveStone(this.undoRegister['drag']['finalTile']);
	}
};

//função de calculo de rewinds para execuçao de replay
Game.prototype.prepareREPLAY = function(){
	if(this.roundMove == 'drag' || (this.roundMove == 'pass' && this.roundNumber == 1))
		{this.rewinds = 1;}
	else this.rewinds = 2;

	this.replays = this.rewinds;
};

//funçao para preparaçao do proximo turno
Game.prototype.passTurn = function(){
	if(this.roundMove == 'pass' && this.animation == false)
	{
		//console.log(this.roundNumber);
		//console.log("passa de ronda!");
  		this.scene.socket.botResponseDROP = null;
		this.scene.socket.botResponseDRAG = null;
		this.scene.socket.boardResponse = null;
		//socket.boardResponse
		this.botCanPickStoneDROP=false;
		this.botCanPickTileDROP=false;
		this.botCanPickStoneDRAG=false;
		this.botCanPickTileDRAG=false;

  		this.roundNumber++;
		this.roundMove = 'drop';
		this.roundTime = this.scene.milliseconds + ROUND_TIME;
		this.movePannel.texture = this.roundMove;
		this.undoRegister = [];
		if(this.pickedStone != null)
			this.pickedStone.picked = false;
		this.board.resetHighlight();
		this.pickedStone = null;
		this.playedStone = null;
		this.pickedBoardTile = null;

		var playerIndex = (this.roundNumber - 1) % this.players.length;
		this.currentPlayer.texture = this.players[playerIndex][0];
		this.currentPlayer.setMaterial(this.players[playerIndex][1])

		this.scene.cameraAnimation.startCameraOrbit(1000, vec3.fromValues(0,1,0), -2*Math.PI/this.players.length);

		if(this.currentPlayerIsBOT())
			this.isBotTurn=true;
 	} 
};

//funçao para calculo do vencedor
Game.prototype.saveWinner = function(color){

	this.winner = [];
	for(var i = 0; i < this.players.length; i++)
		if(this.players[i][1] == color){
			this.winner = this.players[i];
			return;
		}
};

//funçao para determinação 
Game.prototype.colorAssigned = function(color){
	for(var i = 0; i < this.players.length; i++)
		if(this.players[i][1] == color)
			return true;

	return false;
};

//função de criaçao de da lista de jogadores selecionados na interface
Game.prototype.generatePlayersList = function(){
	var totalPlayers = this.scene.Humans + this.scene.Bots;
	var index = this.scene.socket.colorsResponse.length -1;
	for(var i = 1; i <= this.scene.Humans; i++, index--)
	{
		var Human = 'Player' + i;
		var player = [Human, this.scene.socket.colorsResponse[index][1]];
		this.players.push(player);
	}

	for(var i = 1; i <= this.scene.Bots; i++, index--)
	{
		var Bot = 'Bot' + i;
		var player = [Bot, this.scene.socket.colorsResponse[index][1]];
		this.players.push(player);
	}

	this.scene.socket.colorsResponse = null;

	this.currentPlayer = new MyScreen(this.scene, 'iluminated', 'Player1', false);
	this.currentPlayer.setMaterial(this.players[0][1]);

	if(this.currentPlayerIsBOT())
		this.isBotTurn=true;
};

//função responsavel pelo movimento de cada pedra
Game.prototype.moveStone = function(tile){
	//alteração da informação do tile a ser ocupado
	switch(this.pickedStone.colorMaterial){
		case 'blueStone':
			tile.info = 1;
			break;
		case 'redStone':
			tile.info = 2;
			break;
		case 'greenStone':
			tile.info = 3;
			break;
		case 'yellowStone':
			tile.info = 4;
			break;
		default: break;
	}

	this.pickedStone.picked = false;
	this.pickedStone.moveStone(tile.position);
};

//calculo do movimento seguinte
Game.prototype.nextMove = function(stone){
	if(this.roundNumber == 1)
	{
		this.playedStone = stone;
		this.roundMove = 'pass';
	}
	else if(this.roundMove == 'drop')
	{
		this.playedStone = stone;
		this.roundMove = 'drag';
	}
	else this.roundMove = 'pass';

	this.movePannel.texture = this.roundMove;
};

//calculo do movimento anterior, para undo
Game.prototype.previousMove = function(stone){
	if(this.roundNumber == 1 || this.roundMove == 'drag')
	{
		this.roundMove = 'drop';
	}
	else if(this.roundMove == 'pass')
		this.roundMove = 'drag';

	this.undo = false;
	this.pickedStone = null;


	this.movePannel.texture = this.roundMove;
};

//funçao de atualização do timer de cada ronda
Game.prototype.updateTimer = function(){

	var time = Math.floor((this.roundTime - this.scene.milliseconds) / 1000);
	this.timer.first = Math.floor(time/10);
	this.timer.second = time % 10;

	if(time <= 0)
	{
		this.roundMove = 'pass';
		this.animation = false;
		this.passTurn();
	}
};

//função para animação das pedras correspondentes à cor vencedora
Game.prototype.animateStones = function(material){
	for(var i = 0; i < this.stones.length; i++)
		if(this.stones[i].colorMaterial == material)
			this.stones[i].picked = true;
};


Game.prototype.currentPlayerIsBOT = function(){
	var playerIndex = (this.roundNumber - 1) % this.players.length;
	var res = (this.players[playerIndex][0]).search("Bot");
	if(res == -1)
		return false;
	else
		return true;
};


Game.prototype.getRegistedStone = function(stoneID){
	for(var i = 0 ; i < this.stones.length;i++){
		if(this.stones[i].id == stoneID)
			return [this.stones[i],this.stones[i].id];
	}
};


Game.prototype.updateStones = function(stoneID){
	this.removeRemainingStones(stoneID);
};


Game.prototype.removeRemainingStones = function(stoneID){
	var index = this.remainingStones.indexOf(stoneID);
	if(index > -1)
		this.remainingStones.splice(index,1);
};


//função que através das coordenadas X, Y vao buscar a pedra que se encontra na posição X Y do tabuleiro
Game.prototype.getRegistedStoneFromPos = function(Xpos,Ypos){
	for(var i = 0 ; i < this.stones.length;i++){
		if(this.stones[i].settledTile!=null){
			if(this.board.board[Xpos][Ypos].id == this.stones[i].settledTile.id){
				var stone = this.getRegistedStone(this.stones[i].id);
				return stone;
			}
		}
	}
};

