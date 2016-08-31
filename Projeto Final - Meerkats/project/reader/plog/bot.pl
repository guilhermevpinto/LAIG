chooseStoneBOT(ChoosedStone):-
							random(1,5,StoneID),(
							StoneID == 1 ->  ChoosedStone = red;
							StoneID == 2 ->  ChoosedStone = green;
							StoneID == 3 ->  ChoosedStone = blue;
							StoneID == 4 ->  ChoosedStone = yellow;
							chooseStone(ChoosedStone)).
							
withdrawStoneBOT(Stones,RemainingStones,StoneColor):-
									chooseStoneBOT(ChoosedStone),
									getStoneNumber(Stones,ChoosedStone,Number),
									Number > 0 ->format('~w', [ChoosedStone]), NewNum is Number -1,
									setStoneNumber(Stones,ChoosedStone,NewNum,RemainingStones),
									StoneColor = ChoosedStone;
									withdrawStoneBOT(Stones,RemainingStones,StoneColor).

getWinningOnDropBOT(_,_,FinalBoard,_,Players,_,_,2,ID,_,_):-
											winner(FinalBoard, [H|_], 15),
											getPlayer(Players,H,ID),
											ID \= 0.

getWinningOnDropBOT(_,RemainingStones1,FinalBoard,_,Players,_,_,2,ID,_,_):-
			getStoneNumber(RemainingStones1,red,Number1),
			getStoneNumber(RemainingStones1,green,Number2),
			getStoneNumber(RemainingStones1,blue,Number3),
			getStoneNumber(RemainingStones1,yellow,Number4),
			Number is Number1 + Number2 + Number3 + Number4,
			Number == 0,
			winner(FinalBoard, [H|_], _),
			clearScreen,
			displayBoard(B),
			drawBoard(B,FinalBoard),
			getPlayer(Players,H,ID).
											
getWinningOnDropBOT(Board,RemainingStones1,FinalBoard,Tail,Players,ResultBoard,RemainingStones,2,Winner,RowIdentifier,RowPos):-		
												drawBoard(Board, FinalBoard),
												dragStoneBOT(FinalBoard,RowIdentifier,RowPos,FinalBoard1), !, 
												getWinningOnDrag(Board,RemainingStones1,FinalBoard1,Tail,Players,ResultBoard,RemainingStones,2,Winner,RowIdentifier,RowPos), !.			


dragStoneBOT(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,ResultBoard):-
										getStoneCellBOT(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,Initial1,Initial2),
										random(1, 7, Direction), 
										random(1, 5, NumberCells),
										checkDrag(LogicalBoard,Initial1,Initial2,Direction,NumberCells,Final1,Final2),
										getInfo(Initial1,Initial2,Stone,LogicalBoard),setInfo(Initial1,Initial2,empty,LogicalBoard,Res),setInfo(Final1,Final2,Stone,Res,ResultBoard).


dragStoneBOT(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,ResultBoard):-
										dragStoneBOT(LogicalBoard,PlayedStoneCoord1,PlayedStoneCoord2,ResultBoard), !.	


displayGetNumberCellsBOT(NumberCells):-	write('Insert the number of cells you want to drag your stone: '), random(1,10,NumberCells).					

getStoneCellBOT(Board,PlayedStoneCoord1,PlayedStoneCoord2,Row,Pos):- 
					getNotEqualCoordsBOT(PlayedStoneCoord1,PlayedStoneCoord2,Temp1,Temp2),
					getInfo(Temp1,Temp2,Info,Board),
					number(Info),
					Info \= 0 -> Row is Temp1,Pos is Temp2;			
					getStoneCellBOT(Board,PlayedStoneCoord1,PlayedStoneCoord2,Row,Pos).
					
notEqual(Initial1,Initial2,Final1,Final2):-
										Num1 is Initial1-Final1,
										Num2 is Initial2-Final2,
										Num1 + Num2 =\=0.
					
					
%getStoneCellBOT(Board,PlayedStoneCoord1,PlayedStoneCoord2,Row,Pos):-
%					getColorCells(Board,1, 1, ResultBlues, blue),
%					getColorCells(Board,1, 1, ResultReds, red),
%					getColorCells(Board,1, 1, ResultGreens, green),
%					getColorCells(Board,1, 1, ResultYellows, yellow),
%					append(ResultBlues, ResultYellows, Result1),
%					append(ResultGreens, ResultReds, Result2),
%					append(Result1, Result2, ResultStones),
%					getNotEqualCoordsBOT(ResultStones, PlayedStoneCoord1, PlayedStoneCoord2, Row, Pos).
	
				
getNotEqualCoordsBOT(Initial1,Initial2,ResCoord1,ResCoord2):-
											getValidCoordsBOT(C1,C2),
											notEqual(Initial1,Initial2,C1,C2)-> ResCoord1 is C1,ResCoord2 is C2;
											getNotEqualCoordsBOT(Initial1,Initial2,ResCoord1,ResCoord2).
											
					
					
	

/*getEmptyCellBOT(Board,Row,Pos):-	getEmptyCells(Board, 1, 1, ResultBoardWithEmptyCells),
									length(ResultBoardWithEmptyCells, Length),
									L is Length + 1,
									random(1, L, Index),
									getIndexInfo(ResultBoardWithEmptyCells,Index,[Row|Pos]).

getEmptyCellBOT(_, 9, 6).
*/

getEmptyCellBOT(Board,Row,Pos):- 
					random(1,10,Row),
					random(1,10,Pos),
					getInfo(Row,Pos,Info,Board),
					Info == 0.
getEmptyCellBOT(Board,Row,Pos):-
					getEmptyCellBOT(Board,Row,Pos),!.

	
getValidCoordsBOT(X,Y):-
				random(1,10,X),
				random(1,10,Y),
				validCell(X,Y),!.
				
getValidCoordsBOT(X,Y):-
				getValidCoordsBOT(X,Y).
	


dropStoneBOT(_,LogicalBoard,Stones,RemainingStones1,RowIdentifier,RowPos,ResultBoard1):-
			withdrawStoneBOT(Stones,RemainingStones1,ChoosedStone),
			getEmptyCellBOT(LogicalBoard,RowIdentifier,RowPos),
			setInfo(RowIdentifier,RowPos,ChoosedStone,LogicalBoard,ResultBoard1).
