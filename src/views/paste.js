pasteElement(evt) {
    // Marquer le flag pour indiquer que la fonction de collage est en cours d'exécution
    window.isPasteElement = true;

    // Récupérer l'ID de l'élément actuellement ciblé (où le curseur est positionné)
    var focusedID = getSelection().focusNode.id ? getSelection().focusNode.id : getSelection().focusNode.parentElement.closest('div').id;

    // Récupérer le contenu de l'élément actuellement ciblé
    var contentFocusedID = document.getElementById(focusedID).innerHTML;

    // Récupérer la position du curseur dans l'élément actuellement ciblé
    let cursorPos = getSelection().focusOffset;

    // Vérifier si l'élément actuellement ciblé contient des enfants (éléments enfants)
    if (document.getElementById(focusedID).hasChildNodes) {
        // Attendre un court délai avant de traiter le contenu collé
        var timers = setTimeout(() => {
            // Traitement du contenu collé dans l'élément où le collage est effectué
            this.processContentElement(focusedID, contentFocusedID, cursorPos);

            // Vérifier s'il y a des doublons d'ID sur la page (éléments avec le même ID)
            this.checkDuplicateID();

            // Si l'élément actuellement ciblé a été dupliqué (plusieurs éléments avec le même ID)
            if (document.querySelectorAll("#" + focusedID).length > 1) {
                // Générer un nouvel ID unique pour l'élément actuellement ciblé
                let newID = contentFile.generateID("el_");

                // Remplacer l'ID de l'élément actuellement ciblé par le nouvel ID unique
                document.querySelector("#" + focusedID).id = newID;

                // Préparer les données de l'élément pour les envoyer via WebSocket
                var dataElement = {
                    lineID: newID,
                    pageID: document.activeElement.id,
                    classElem: document.getElementById(newID).classList
                };

                // Envoyer les données de l'élément via WebSocket
                this.sendContentToWS(dataElement);
            }

            // Nettoyer le délai d'attente
            clearInterval(timers);
        }, 10);
    }

    // Récupérer une référence au composant lui-même
    var _this = this;

    // Attendre un court délai avant de réinitialiser le flag isPasteElement
    setTimeout(async function () {
        // Réinitialiser le flag pour indiquer que la fonction de collage est terminée
        window.isPasteElement = false;

        // Parcourir tous les éléments de la page
        _this.parcourrirPageElement();
    }, 1000);
}



processContentElement(focusedID, contentFocusedID, cursorPos) {
    // Déclaration d'un tableau pour stocker les éléments <div> enfants
    var tabDivChild = [];

    // Copie de la référence au composant dans une variable locale
    var thisPaste = this;

    // Vérifier si l'élément actuellement ciblé (où le collage est effectué) existe
    if (document.getElementById(focusedID)) {
        // Récupérer tous les enfants de l'élément actuellement ciblé
        let elChild = document.getElementById(focusedID).childNodes;

        // Parcourir tous les enfants de l'élément actuellement ciblé
        elChild.forEach(function (item, index) {
            // Si l'enfant est un élément <div>, générer un nouvel ID unique pour cet enfant et l'ajouter au tableau
            if (item.tagName == "DIV") {
                item.id = contentFile.generateID("el_");
                tabDivChild.push(item);
            }
        });

        // Parcourir tous les éléments <div> enfants et les insérer avant l'élément actuellement ciblé
        tabDivChild.forEach(function (el) {
            document.getElementById(document.activeElement.id).insertBefore(el, document.getElementById(focusedID));
        });
    }

    // Vérifier si la hauteur de la page dépasse la hauteur maximale autorisée
    if (document.getElementById(document.activeElement.id).scrollHeight > document.getElementById(document.activeElement.id).offsetHeight) {
        // Réinitialiser les variables utilisées pour gérer le débordement de la page
        window.totalElemHeight = 0;
        window.tabElement = [];
    }

    // Vérifier si l'élément actuellement ciblé (où le collage est effectué) contient des éléments <span>
    if (document.getElementById(focusedID) && document.getElementById(focusedID).querySelector('span')) {
        // Récupérer l'élément parent du premier élément <span> trouvé dans l'élément actuellement ciblé
        let parentSpan = document.getElementById(focusedID).querySelector('span').parentElement;

        // Récupérer la balise HTML de l'élément parent du premier élément <span>
        let parentSpanTag = document.getElementById(focusedID).querySelector('span').parentElement.tagName;

        // Récupérer tous les éléments <span> de l'élément actuellement ciblé
        var spanElem = document.getElementById(focusedID).querySelectorAll('span');

        // Supprimer les attributs des éléments <span>
        for (let el of spanElem) {
            this.removeAttributes(el);
        }

        // Calculer la position finale du curseur après le collage
        let pos = parseInt(cursorPos) + parseInt(document.getElementById(focusedID).querySelector('span').innerText.length);

        // Si l'élément parent du premier élément <span> est une liste <li>
        if (parentSpanTag == "LI") {
            // Insérer le contenu collé dans la liste <li>
            this.pasteInListElem(focusedID, parentSpan, pos);
        } else {
            // Supprimer les balises <span> de l'élément actuellement ciblé
            document.getElementById(focusedID).innerHTML = document.getElementById(focusedID).innerHTML.replace(/<span>/g, "");
            document.getElementById(focusedID).innerHTML = document.getElementById(focusedID).innerHTML.replace(/<\/span>/g, "");

            // Définir la position du curseur à la position finale après le collage
            this.$root.setCurrentCursorPosition(pos, focusedID, 0, document.activeElement.id);
        }
    }
}
