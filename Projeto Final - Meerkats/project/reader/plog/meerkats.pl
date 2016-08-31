:- use_module(library(random)).
:- use_module(library(system)).
:- use_module(library(lists)).
:- include('utilities.pl').
:- include('menus.pl').
:- include('game.pl').
:- include('bot.pl').


meerkats :- mainMenu.

emptyCell(empty).
blueStone(blue).
yellowStone(yellow).
redStone(red).
greenStone(green).

%----------------------------------------------%
%-------------Set of valid positions-----------%
%----------------------------------------------%

validCell(1,X):- X < 6, X > 0.
validCell(2,X):- X < 7, X > 0.
validCell(3,X):- X < 8, X > 0.
validCell(4,X):- X < 9, X > 0.
validCell(5,X):- X < 10, X > 0.
validCell(6,X):- X < 9, X > 0.
validCell(7,X):- X < 8, X > 0.
validCell(8,X):- X < 7, X > 0.
validCell(9,X):- X < 6, X > 0.

%----------------------------------------------%
%----------------Socket functions--------------%
%----------------------------------------------%
