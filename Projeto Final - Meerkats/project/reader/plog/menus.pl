mainMenu:-
	printMainMenu,
	getChar(Input),
	(
		Input = '1' -> numberOfPlayersScreen, mainMenu;
		Input = '2' -> help, mainMenu;
		Input = '3' -> abort;

		nl,
		mainMenu
	).

printMainMenu:-
	clearScreen,
	write('*********************************'), nl,
	write('||           MEERKATS          ||'), nl,
	write('||                             ||'), nl,
	write('||  1 - Play                   ||'), nl,
	write('||  2 - How to                 ||'), nl,
	write('||  3 - Exit Game              ||'), nl,
	write('||                             ||'), nl,
	write('*********************************'), nl,
	write('Choose an option:'), nl.

numberOfPlayersScreen:-
	printNumbOfPlayersScreen,
	getInteger(NumberPlayers),
	(
		NumberPlayers > 4 -> numberOfPlayersScreen;
		NumberPlayers < 2 -> numberOfPlayersScreen;
		numberOfBotsScreen(NumberPlayers)
	).

printNumbOfPlayersScreen:-
	clearScreen,
	write('***************************************************'), nl,
	write('||                                               ||'), nl,
	write('||   Type a number of players (between 2 or 4)   ||'), nl,
	write('||                                               ||'), nl,
	write('***************************************************'), nl.

numberOfBotsScreen(NumberPlayers):-
	printNumberOfBotsScreen(NumberPlayers),
	getInteger(NumberBots),
	(
		NumberBots > NumberPlayers -> write('Number of Bots exceeds the number of Players.'), getEnter;
		playGame(NumberPlayers,NumberBots)
	).

printNumberOfBotsScreen(NumberPlayers):- 
	clearScreen,
	write('***************************************************'), nl,
	write('||                                               ||'), nl,
	format('||    Type a number of bots (between 0 and ~d)    ||', [NumberPlayers]), nl,
	write('||                                               ||'), nl,
	write('***************************************************'), nl.



help:-
	clearScreen,
	write('**********************************************************************'), nl,
	write('||                       How to play Meerkats                       ||'), nl,
	write('**********************************************************************'), nl,
	write('||                                                                  ||'), nl,
	write('||  Meerkats is a game that can be played between 2, 3 or 4 players ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  It\'s used an empty hexagonal board, with 5 hexagons per side.  ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  Also, 60 stones are needed, where 15 are blue, 15 green,        ||'), nl,
	write('||  15 yellow and 15 red.                                           ||'), nl,
	write('||                                                                  ||'), nl,
	write('||                                                       Part 1-4   ||'), nl,
	write('||                                                                  ||'), nl,
	write('**********************************************************************'), nl,
	getEnter,


	clearScreen,
	write('**********************************************************************'), nl,
	write('||                       How to play Meerkats                       ||'), nl,
	write('**********************************************************************'), nl,
	write('||                                                                  ||'), nl,
	write('||  At the start of the match, each player draws a stone            ||'), nl,
	write('||  with different colors, without revealing them to the others.    ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  The color of the stone drawn, corresponds to the color of       ||'), nl,
	write('||  the stones that belong to the player.                           ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  The first player starts by adding a stone of any color to       ||'), nl,
	write('||  the board, then passes his turn.                                ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  From then on, in every following turn, each player must drop    ||'), nl,
	write('||  a stone of any color in an empty hexagon and move a different   ||'), nl,
	write('||  stone, already on the board, to another empty hexagon.          ||'), nl,
	write('||                                                                  ||'), nl,
	write('||                                                       Part 2/4   ||'), nl,
	write('||                                                                  ||'), nl,
	write('**********************************************************************'), nl,
	getEnter,


	clearScreen,
	write('**********************************************************************'), nl,
	write('||                       How to play Meerkats                       ||'), nl,
	write('**********************************************************************'), nl,
	write('||  A stone is moved in a straight line until another stone is in   ||'), nl,
	write('||  it\'s path or the edge of the board blocks it.                  ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  Stones cannot jump over other stones.                           ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  Communication isn\'t allowed between the players.               ||'), nl,
	write('||                                                                  ||'), nl,
	write('||                                                       Part 3/4   ||'), nl,
	write('||                                                                  ||'), nl,
	write('**********************************************************************'), nl,
	getEnter,


	clearScreen,
	write('**********************************************************************'), nl,
	write('||                       How to play Meerkats                       ||'), nl,
	write('**********************************************************************'), nl,
	write('||  The game ends when any of the following happens:                ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  - A player manages to group all the 15 stones of his color.     ||'), nl,
	write('||  - When the board is full, the player with the largest group in  ||'), nl,
	write('||  in his color wins.                                              ||'), nl,
	write('||                                                                  ||'), nl,
	write('||  If two players got tied, the tie-break is calculated by         ||'), nl,
	write('||  calculating their second largest groups.                        ||'), nl,
	write('||                                                                  ||'), nl,
	write('||                                                       Part 4/4   ||'), nl,
	write('||                                                                  ||'), nl,
	write('**********************************************************************'), nl,
	getEnter.