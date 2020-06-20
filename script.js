/* 
Notes:
Id's are formated cell - x-coordinate|column - y-coordinate|row; with topleft being [0,0]
fieldArray is formated as fieldArray[y-coordinate|row][x-coordinate|column]; with [0,0] being topleft
    to make sure the array is an easy representation of the board
coords are formated as [x-coordinate|column, y-coordinate|row]
*/


const fieldHeight = 6;
const fieldWidth = 7;
const maxNameLength = 11;
var fieldArray;
var lowestPositions;
var turn = 0;
var gameFinished = false;
var discColors = ['lightcoral', 'lightskyblue']

function createEmptyField() {
    var div = document.getElementById("fieldDiv");

    // Clean div if a table is already present
    div.innerHTML = "";

    var table = document.createElement("table");
    table.id = "fieldTable";

    // Add cells to table
    for (var r = 0; r < fieldHeight; r++) {
        var row = document.createElement("tr");
        for (var c = 0; c < fieldWidth; c++) {
            var cell = document.createElement("td");
            cell.id = getIdFromCoord([c, r])
            cell.setAttribute('onmouseover', "onColumnClick(this)");
            cell.setAttribute('onmouseout', "onColumnClick(this, false)");
            cell.setAttribute('onclick', "insertDisc(this)");

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    div.appendChild(table);

    // Create field array
    fieldArray = new Array(fieldHeight);
    for (var i = 0; i < fieldHeight; i++) {
        // Create rows and initialize with zeroes
        fieldArray[i] = new Array(fieldWidth).fill(0);
    }

    // Create lowest position array
    lowestPositions = new Array(fieldWidth).fill(fieldHeight - 1);
}

function insertDisc(element) {
    // Get coordinate of click
    var coord = getCoordFromId(element.id);

    // Get lowest available row position in column
    var row = lowestPositions[coord[0]];

    // Add disc if spot available
    if (row != -1) {
        // Mark array with right disc
        fieldArray[row][coord[0]] = turn % 2 + 1;
        lowestPositions[coord[0]] = lowestPositions[coord[0]] - 1;

        if (checkWin([coord[0], row])) {
            // Get winning player name
            var name = "";
            if (turn % 2) {
                name = document.getElementById("player2Text").innerText;
            } else {
                name = document.getElementById("player1Text").innerText;
            }

            // Show dialog who won
            console.log("win");
            alert(name + " has won!");

            // Mark game as finished
            gameFinished = true;

            // Save and don't update layout
            saveGame();
            return;
        }

        // Update turn
        turn++;

        // Save new move
        saveGame();

        // Make current player name bold
        updateLayout();

        // Trigger next disc preview, as there is no new mouse-enter
        addDiscInColumn(coord[0]);
    } else {
        console.log("Column " + coord[0] + " full");
    }
}

function getIdFromCoord(coord) {
    return "cell-" + coord[0] + "-" + coord[1];
}

function getCoordFromId(id) {
    var splitId = id.split("-");
    return [parseInt(splitId[1]), parseInt(splitId[2])];
}

function onColumnClick(element, enter = true) {
    if (!gameFinished) {
        // Get column
        var coord = getCoordFromId(element.id);

        // Change column and disc
        highlightColumn(coord[0], enter);
        addDiscInColumn(coord[0], enter);
    }
}

function highlightColumn(column, doHighlight = true) {
    // highlight each cell in column
    for (var r = 0; r < fieldHeight; r++) {
        var cell = document.getElementById(getIdFromCoord([column, r]));

        if (doHighlight) {
            cell.classList.add("highlight");
        } else {
            cell.classList.remove("highlight");
        }
    }


}

function addDiscInColumn(column, doAdd = true) {
    var lowestPosition = lowestPositions[column];
    if (lowestPosition != -1) {
        var updatedCell = document.getElementById(getIdFromCoord([column, lowestPosition]));

        if (doAdd) {
            var discSpan = document.createElement("span");
            discSpan.classList.add("dot");
            discSpan.style.backgroundColor = discColors[turn % 2];
            updatedCell.appendChild(discSpan);
        } else {
            updatedCell.innerHTML = "";
        }
    }
}

function inBounds(coord) {
    return coord[0] >= 0 && coord[1] >= 0 && coord[0] < fieldWidth && coord[1] < fieldHeight;
}

function lengthSameNeighbors(coord, dir, playerId) {
    var len = 0;
    var newCoord = [coord[0] + dir[0], coord[1] + dir[1]];
    while (inBounds(newCoord) && fieldArray[newCoord[1]][newCoord[0]] == playerId) {
        len++;
        newCoord[0] += dir[0];
        newCoord[1] += dir[1];
    }
    return len;
}

function checkWin(coord) {
    /*
    Note:
    As we know the game was not won the previous turn (otherwise no new discs can be inserted)
    the new disc HAS to be in the winning connection if somebody won this turn.
    */
    var playerId = fieldArray[coord[1]][coord[0]];

    console.log(coord, playerId, fieldArray);

    // Check vertical connection
    if (lengthSameNeighbors(coord, [0, 1], playerId) >= 3) { return true }
    // Check horizontal connection
    if (lengthSameNeighbors(coord, [1, 0], playerId) + lengthSameNeighbors(coord, [-1, 0], playerId) >= 3) { return true }
    // Check diagonal-/ connection
    if (lengthSameNeighbors(coord, [1, -1], playerId) + lengthSameNeighbors(coord, [-1, 1], playerId) >= 3) { return true }
    // Check diagonal-\ connection
    if (lengthSameNeighbors(coord, [1, 1], playerId) + lengthSameNeighbors(coord, [-1, -1], playerId) >= 3) { return true }

    return false;
}

function saveGame() {
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("turn", turn);
        localStorage.setItem("board", JSON.stringify(fieldArray));
        localStorage.setItem("lowest", JSON.stringify(lowestPositions));
        localStorage.setItem("colors", JSON.stringify(discColors));
        localStorage.setItem("names", JSON.stringify([document.getElementById("player1Text").innerHTML, document.getElementById("player2Text").innerHTML]))
        localStorage.setItem("finished", JSON.stringify(gameFinished));
    }
}

function loadGame() {
    if (typeof(Storage) !== "undefined") {
        turn = parseInt(localStorage.turn);
        fieldArray = JSON.parse(localStorage.board);
        lowestPositions = JSON.parse(localStorage.lowest);
        discColors = JSON.parse(localStorage.colors);
        var names = JSON.parse(localStorage.names);
        gameFinished = JSON.parse(localStorage.finished);

        document.getElementById("player1Text").innerHTML = names[0];
        document.getElementById("player2Text").innerHTML = names[1];
        document.getElementById("player1").style.backgroundColor = discColors[0];
        document.getElementById("player2").style.backgroundColor = discColors[1];
        updateLayout();

        if (document.getElementById("fieldDiv").children.length == 0) {
            createEmptyField();
        }

        var rows = document.getElementById("fieldTable").children;
        for (var r = 0; r < fieldHeight; r++) {
            var cells = rows[r].children;
            for (var c = 0; c < fieldWidth; c++) {
                var id = fieldArray[r][c];

                if (id != 0) {
                    var discSpan = document.createElement("span");
                    discSpan.classList.add("dot");
                    discSpan.style.backgroundColor = discColors[id - 1];
                    cells[c].appendChild(discSpan);
                }
            }
        }
    }
}

function updateLayout() {
    // Change bottombar playername color, background and weight based on turn
    if (turn % 2) {
        document.getElementById("player2Text").style.fontWeight = "bold";
        document.getElementById("player1Text").style.fontWeight = "normal";
        document.getElementById("player2Text").style.color = "white";
        document.getElementById("player1Text").style.color = "black";
        document.getElementById("rightPlayer").style.backgroundColor = "black";
        document.getElementById("leftPlayer").style.backgroundColor = "white";

    } else {
        document.getElementById("player1Text").style.fontWeight = "bold";
        document.getElementById("player2Text").style.fontWeight = "normal";
        document.getElementById("player1Text").style.color = "white";
        document.getElementById("player2Text").style.color = "black";
        document.getElementById("leftPlayer").style.backgroundColor = "black";
        document.getElementById("rightPlayer").style.backgroundColor = "white";
    }

    // Show new turn
    document.getElementById("turn").innerHTML = turn + 1;
}

function updateLayoutStart() {
    // Update player names
    document.getElementById("player1Text").innerHTML = document.getElementById("player1InputName").value.slice(0, maxNameLength);
    document.getElementById("player2Text").innerHTML = document.getElementById("player2InputName").value.slice(0, maxNameLength);

    // TODO replace string player name if empty or give error
    // Update player colors
    discColors[0] = document.getElementById("player1InputColor").value;
    discColors[1] = document.getElementById("player2InputColor").value;
    document.getElementById("player1").style.backgroundColor = document.getElementById("player1InputColor").value;
    document.getElementById("player2").style.backgroundColor = document.getElementById("player2InputColor").value;

    //Update turn-based styles
    updateLayout()
}

function play() {
    turn = 0;
    createEmptyField();
    updateLayoutStart();
}

function openPlayerInfo() {
    document.getElementById("playerinfo").style.display = "block";
}

function closePlayerInfo() {
    document.getElementById("playerinfo").style.display = "none";

    // Update visuals with player names and colors
    document.getElementById("player1Text").innerHTML = document.getElementById("player1InputName").value.slice(0, maxNameLength);
    document.getElementById("player2Text").innerHTML = document.getElementById("player2InputName").value.slice(0, maxNameLength);
    discColors[0] = document.getElementById("player1InputColor").value;
    discColors[1] = document.getElementById("player2InputColor").value;
    document.getElementById("player1").style.backgroundColor = document.getElementById("player1InputColor").value;
    document.getElementById("player2").style.backgroundColor = document.getElementById("player2InputColor").value;


}

window.loadGame = play();