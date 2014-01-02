/*jshint "laxbreak":true,"shadow":true,"undef":true,"evil":true,"trailing":true,"proto":true,"withstmt":true*/
/*global document, $, window*/
var template = "",
    changedTemplate = "",
    currentSets = 1,
    pokemonIds = {}, moveIds = {}, natureIds = {}, itemIds = {}, abilityIds = {};
var neededFields = ["pokename", "pokepara", "set1name", "set1item", "set1ability", "set1evs", "set1nature", "set1move1", "set1move2", "set1move3", "set1move4", "set1desc", "set1synergy"];
$(document).ready(function () {
    $.get('index.template', function (data) {
        template = data;
    });
    $.getJSON("Data/pokemonIds.json", function (json) {
        pokemonIds = json;
    });
    $.getJSON("Data/moveIds.json", function (json) {
        moveIds = json;
    });
    $.getJSON("Data/itemIds.json", function (json) {
        itemIds = json;
    });
    $.getJSON("Data/natureIds.json", function (json) {
        natureIds = json;
    });
    $.getJSON("Data/abilityIds.json", function (json) {
        abilityIds = json;
    });
    $("#sendText").click(sendText);
    $("#preview").click(preview);
    $("#clone").click(clone);
    $("#set1delete").hide();
    labelsCheck();
});

function check(change, field, needed) {
    if (field === "pokename") {
        change = pokeCorrectCase(change, needed);
    }
    if (field.indexOf("move") !== -1) {
        change = moveCorrectCase(change, needed);
    }
    if (field.indexOf("nature") !== -1) {
        change = natureCorrectCase(change, needed);
    }
    if (field.indexOf("ability") !== -1) {
        change = abilityCorrectCase(change, needed);
    }
    if (field.indexOf("item") !== -1) {
        change = itemCorrectCase(change, needed);
    }
    return change;
}

function pokeCorrectCase(poke, needed) {
    for (var x in pokemonIds) {
        if (pokemonIds.hasOwnProperty(x)) {
            if (poke.toLowerCase() === pokemonIds[x].toLowerCase()) {
                return pokemonIds[x];
            }
        }
    }
    return needed ? false : poke;
}

function getPokeId(poke, needed) {
    for (var x in pokemonIds) {
        if (pokemonIds.hasOwnProperty(x)) {
            if (poke.toLowerCase() === pokemonIds[x].toLowerCase()) {
                return x;
            }
        }
    }
    return needed ? false : 0;
}

function moveCorrectCase(move, needed) {
    for (var x in moveIds) {
        if (moveIds.hasOwnProperty(x)) {
            if (move.toLowerCase() === moveIds[x].toLowerCase()) {
                return moveIds[x];
            }
        }
    }
    return needed ? false : move;
}

function natureCorrectCase(nature, needed) {
    for (var x in natureIds) {
        if (natureIds.hasOwnProperty(x)) {
            if (nature.toLowerCase() === natureIds[x].toLowerCase()) {
                return natureIds[x];
            }
        }
    }
    return needed ? false : nature;
}

function itemCorrectCase(item, needed) {
    for (var x in itemIds) {
        if (itemIds.hasOwnProperty(x)) {
            if (item.toLowerCase() === itemIds[x].toLowerCase()) {
                return itemIds[x];
            }
        }
    }
    return needed ? false : item;
}

function abilityCorrectCase(ability, needed) {
    for (var x in abilityIds) {
        if (abilityIds.hasOwnProperty(x)) {
            if (ability.toLowerCase() === abilityIds[x].toLowerCase()) {
                return abilityIds[x];
            }
        }
    }
    return needed ? false : ability;
}

function sendText() {
    changedTemplate = template;
    var error = $("#error"), rawHtml = $("#rawHtml");
    for (var x = 0; x < neededFields.length; x++) {
        var change = document.getElementById(neededFields[x]).value;
        var regex = new RegExp("{" + neededFields[x] + "}", "g");
        if (change === "") {
            error.html('Error: Missing field "' + document.getElementById(neededFields[x]).label.innerHTML.slice(0, -2) + '"');
            error.show();
            return;
        }
        change = check(change, neededFields[x], true);
        if (!change) {
            error.html('Error: "' + document.getElementById(neededFields[x]).label.innerHTML.slice(0, -2) + '" is spelt incorrectly');
            error.show();
            return;
        }
        changedTemplate = changedTemplate.replace(regex, change.replace(/\n/g, "<br>"));
    }
    var x = 10;
    while (x > currentSets) {
        var regex = new RegExp("<!-- Set " + x + " start -->[\\s\\S]*<!-- Set " + x + " end -->", "im");
        changedTemplate = changedTemplate.replace(regex, "");
        x--;
    }
    var pokeimg = "http://pokemon-online.eu/images/pokemon/x-y/" + getPokeId(document.getElementById("pokename").value) + ".png"; //stealing from PO, since I don't feel like hosting images myself
    changedTemplate = changedTemplate.replace(/\{pokeimg\}/g, pokeimg);
    rawHtml.show();
    rawHtml.text(changedTemplate);
    $("#preview").show();
    error.hide();
}

function preview() {
    window.open().document.write(changedTemplate);
}

function clone() {
    var origSetCount = currentSets;
    var error = $("#error");
    if (currentSets === 10) {
        error.html("You cannot have more than 10 sets per PokÃ©mon!");
        error.show();
        return;
    }
    currentSets += 1;
    var regex = new RegExp((origSetCount - 1).toString(), "g");
    var cloned = $('#' + origSetCount).clone().attr('id', currentSets).appendTo('#sets');
    fixIds(cloned, origSetCount);
    cloned.find('[type=text]').val('');
    var labels = $("#"+currentSets + " label");
    var regex = new RegExp("set" + origSetCount, "g");
    for (var i = 0; i < labels.length; i++) {
        labels[i].htmlFor = labels[i].htmlFor.replace(regex, "set" + currentSets);
    }
    $('#set' + currentSets + 'delete').show();
    $('#set' + origSetCount + 'delete').hide();
    $('#set' + currentSets + 'Title').html("<b>Set " + currentSets + "</b>");
    ["set" + currentSets + "name", "set" + currentSets + "item", "set" + currentSets + "ability", "set" + currentSets + "evs", "set" + currentSets + "nature", "set" + currentSets + "move1", "set" + currentSets + "move2", "set" + currentSets + "move3", "set" + currentSets + "move4", "set" + currentSets + "desc", "set" + currentSets + "synergy"].forEach(function (field) {
        neededFields.push(field);
    });
    labelsCheck();
}

function fixIds(elem, original) {
    $(elem).find("[id]").add(elem).each(function () {
        var regex = new RegExp("set" + original, "g");
        this.id = this.id.replace(regex, "set" + currentSets);
    });
}

function labelsCheck() {
    //this is for later on during error messages.
    //it assigns labels as an attribute to the element it belongs to
    //it's messy, and I could just give each element a proper name instead, but oh well :(
    var labels = $("label");
    for (var i = 0; i < labels.length; i++) {
        if (labels[i].htmlFor !== '') {
            var elem = $("#"+labels[i].htmlFor)[0];
            if (elem)
                elem.label = labels[i];
        }
    }
}

function deleteSet(element) {
    var original = currentSets;
    $(element).parents(".set").remove();
    currentSets -= 1;
    if (currentSets != 1) {
        $('#set' + currentSets + 'delete').show();
    }
    var index = $.inArray("set" + original + "name", neededFields);
    neededFields.splice(index, 11);
}
