/* 
Notes:
Id's are formated cell - x-coordinate|column - y-coordinate|row; with topleft being [0,0]
fieldArray is formated as fieldArray[y-coordinate|row][x-coordinate|column]; with [0,0] being topleft
    to make sure the array is an easy representation of the board
coords are formated as [x-coordinate|column, y-coordinate|row]
*/

var discColors = ['lightcoral', 'lightskyblue']
var fieldHeight = 6;
var fieldWidth = 7;
var fieldArray;
var lowestPositions;
var turn = 0;

function createEmptyField() {
    var div = document.getElementById("fieldDiv");

    // Clean div if a table is already present
    div.innerHTML = "";

    var table = document.createElement("table");

    // Add cells to table
    for (var r = 0; r < fieldHeight; r++) {
        var row = document.createElement("tr");
        for (var c = 0; c < fieldWidth; c++) {
            var cell = document.createElement("td");
            cell.id = getIdFromCoord([c, r])
            cell.setAttribute('onmouseover', "highlightColumn(this)");
            cell.setAttribute('onmouseout', "highlightColumn(this, false)");
            cell.setAttribute('onclick', "insertDisc(this)");

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    div.appendChild(table);

    // Create field array
    fieldArray = new Uint8Array(fieldHeight);
    for (var i = 0; i < fieldHeight; i++) {
        // Create rows and initialize with zeroes
        fieldArray[i] = new Uint8Array(fieldWidth).fill(0);
    }

    // Create lowest position array
    lowestPositions = new Int8Array(fieldWidth).fill(fieldHeight - 1);
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

        // Add disc to right cell in table
        // ----- As long as preview disc is exacly the same as this one, this code is not needed
        // var updatedCell = document.getElementById(getIdFromCoord([coord[0], row]));
        // var discSpan = document.createElement("span");
        // discSpan.classList.add("dot");
        // discSpan.style.backgroundColor = discColors[turn % 2];
        // discSpan.id = "player" + (turn % 2 + 1); // Currently not used?
        // updatedCell.appendChild(discSpan);

        // Update turn
        turn++;
        document.getElementById("turn").innerHTML = turn + 1;

        // Make current player name bold
        if (turn % 2) {
            document.getElementById("player2Text").style.fontWeight = "bold";
            document.getElementById("player1Text").style.fontWeight = "normal";
        } else {
            document.getElementById("player1Text").style.fontWeight = "bold";
            document.getElementById("player2Text").style.fontWeight = "normal";
        }

        // Trigger next disc preview, as there is no new mouse-enter
        highlightColumn(document.getElementById(getIdFromCoord([coord[0], row])))
    } else {
        console.log("Column " + coord[0] + " full");
    }


    console.log(fieldArray);
}

function getIdFromCoord(coord) {
    return "cell-" + coord[0] + "-" + coord[1];
}

function getCoordFromId(id) {
    var splitId = id.split("-");
    return [splitId[1], splitId[2]];
}

function highlightColumn(element, doHighlight = true) {
    // Get hover coordinates
    var coord = getCoordFromId(element.id);
    console.log("Hoover coordinates: ", coord);

    // highlight each cell in column
    for (var r = 0; r < fieldHeight; r++) {
        var cell = document.getElementById(getIdFromCoord([coord[0], r]));

        if (doHighlight) {
            cell.classList.add("highlight");
        } else {
            cell.classList.remove("highlight");
        }
    }

    //Add disc preview
    var lowestPosition = lowestPositions[coord[0]];
    if (lowestPosition != -1) {
        var updatedCell = document.getElementById(getIdFromCoord([coord[0], lowestPosition]));

        if (doHighlight) {
            var discSpan = document.createElement("span");
            discSpan.classList.add("dot");
            discSpan.style.backgroundColor = discColors[turn % 2];
            discSpan.id = "player" + (turn % 2 + 1); // Currently not used?
            updatedCell.appendChild(discSpan);
        } else {
            updatedCell.innerHTML = "";
        }

    }
}

function updateLayoutStart() {
    // Update player names
    document.getElementById("player1Text").innerHTML = document.getElementById("player1InputName").value;
    document.getElementById("player2Text").innerHTML = document.getElementById("player2InputName").value;

    // TODO replace string player name if empty or give error
    // Update player colors
    discColors[0] = document.getElementById("player1InputColor").value;
    discColors[1] = document.getElementById("player2InputColor").value;
    document.getElementById("player1").style.backgroundColor = document.getElementById("player1InputColor").value;
    document.getElementById("player2").style.backgroundColor = document.getElementById("player2InputColor").value;

    //Update turn
    document.getElementById("turn").innerHTML = turn + 1;
    document.getElementById("player1Text").style.fontWeight = "bold";
    document.getElementById("player2Text").style.fontWeight = "normal";
}


function play() {
    turn = 0;
    createEmptyField();
    updateLayoutStart();
}