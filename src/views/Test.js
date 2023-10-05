//si mon code complet ressemble à ceci :

//component-page-inner.js :
const PageInner = Vue.component("Page-inner", {

    template: /*html*/ ` 
    <div class="page" :class="formatDoc" :id="idPage" @keydown.ctrl.enter.exact="emitNewPage" @paste="pasteElement">
        <Tete-et-pied id="__entete">
        <Corps-page :num_page="numero" :order_page="order_page" :id_corps_page="id_corps_page" ref="corpspage" v-on:checkElemSize="checkElemSize"> </Corps-page>
        <Tete-et-pied id="__piedDePage">
    </div> 
`,

    methods: {
        emitNewPage() {
            this.$emit("newPage", this.order_page, false, false, document.activeElement.id, true, false, true, true);
        },
        //Coller les éléments
       pasteElement (evt) {

            window.isPasteElement = true;

            var focusedID = getSelection().focusNode.id ? getSelection().focusNode.id : getSelection().focusNode.parentElement.closest('div').id;

            var contentFocusedID = document.getElementById(focusedID).innerHTML;

            let cursorPos = getSelection().focusOffset;

            if(document.getElementById(focusedID).hasChildNodes) {

                var timers = setTimeout(() => {

                    //Traitement des contenus d'un element où on fait coller le texte
                    this.processContentElement(focusedID, contentFocusedID, cursorPos);

                    this.checkDuplicateID();

                    if(document.querySelectorAll("#"+focusedID).length > 1) {

                        let newID = contentFile.generateID("el_");

                        document.querySelector("#"+focusedID).id = newID;

                        var dataElement = {
                            lineID      : newID,
                            pageID      : document.activeElement.id,
                            classElem   : document.getElementById(newID).classList
                        };

                        this.sendContentToWS(dataElement);

                    }

                    clearInterval(timers);

                }, 10);

            }

            var _this = this;

            setTimeout(async function () {
                window.isPasteElement = false;

                _this.parcourrirPageElement();

            }, 1000)

        },

        checkDuplicateID() {

            var nodes = document.querySelectorAll('[id]');
            var ids = [];
            var totalNodes = nodes.length;

            for(var i=0; i<totalNodes; i++) {
                var currentId = nodes[i].id ? nodes[i].id : "undefined";

                if(nodes[i].id) {
                    let indexID = ids.indexOf(nodes[i].id);
                    if(indexID == -1) {
                        ids.push(currentId);
                    }
                    else {

                        let newID = contentFile.generateID("el_");

                        document.getElementById(currentId).id = newID;

                        var dataElement = {
                            lineID      : newID,
                            pageID      : document.activeElement.id,
                            classElem   : document.getElementById(newID).classList
                        };

                        this.sendContentToWS(dataElement);

                    }
                }

            }

        },
        processContentElement(focusedID, contentFocusedID, cursorPos) {

            var tabDivChild = [];

            var thisPaste = this;

            if(document.getElementById(focusedID)) {
                let elChild = document.getElementById(focusedID).childNodes;

                elChild.forEach(function(item, index) {
                    if(item.tagName == "DIV") {
                        item.id = contentFile.generateID("el_");
                        tabDivChild.push(item);
                    }
                });

                tabDivChild.forEach(function(el) {
                    document.getElementById(document.activeElement.id).insertBefore(el, document.getElementById(focusedID));
                })
            }

            if(document.getElementById(document.activeElement.id).scrollHeight > document.getElementById(document.activeElement.id).offsetHeight) {

                window.totalElemHeight = 0;
                window.tabElement = [];

            }

            if(document.getElementById(focusedID) && document.getElementById(focusedID).querySelector('span')) {

                let parentSpan = document.getElementById(focusedID).querySelector('span').parentElement;

                let parentSpanTag = document.getElementById(focusedID).querySelector('span').parentElement.tagName;

                var spanElem = document.getElementById(focusedID).querySelectorAll('span');

                for (let el of spanElem) {
                    this.removeAttributes(el);
                }

                let pos = parseInt(cursorPos) + parseInt(document.getElementById(focusedID).querySelector('span').innerText.length);

                //S'il s'agit d'une liste "li"
                if(parentSpanTag == "LI") {

                    this.pasteInListElem(focusedID, parentSpan, pos);

                }
                else {

                    document.getElementById(focusedID).innerHTML = document.getElementById(focusedID).innerHTML.replace(/<span>/g, "");
                    document.getElementById(focusedID).innerHTML = document.getElementById(focusedID).innerHTML.replace(/<\/span>/g, "");

                    this.$root.setCurrentCursorPosition(pos, focusedID, 0, document.activeElement.id);
                }

            }

        },

        parcourrirPageElement() {
            var allPage = document.getElementsByClassName("page");
            for (var i = 0; i < allPage.length; i++) {

                let idPage = document.getElementsByClassName('page')[i].id;

                let corpsPage = document.getElementsByClassName('page')[i].querySelector(".__corps").id;

                const children = Array.from(document.getElementById(corpsPage).children);

                children.forEach((element, index) => {

                    this.checkElemSize(element.id);

                });

            }
        },

         //Vérifier si la hauteur d'un élément a été changé
        checkElemSize(focusID) {

                    var isResize = false;
        
                    var _this = this;
        
                    window["elHeight_"+focusID] = 0;
        
                    const resize_ob = new ResizeObserver(function(entries) {
        
                        // since we are observing only a single element, so we access the first element in entries array
                        let rect = entries[0].contentRect;
        
                        if(window["elHeight_"+focusID] != 0 && window["elHeight_"+focusID] != rect.height && document.getElementById(focusID) && window["elHeight_"+focusID] < rect.height) {
                            _this.$refs.corpspage.overflowed(focusID);
                        }
                        else if(window["elHeight_"+focusID] > rect.height) { //Taille d'un élément diminu
        
                            if(document.getElementById(focusID)) {
        
                                let corpPageID = document.getElementById(focusID).parentElement.id;
        
                                var elementParent = _this.recupererElementParent(focusID);
        
                                var elementPrecedent = _this.recupererElementPrecedent(elementParent.pageID);
        
                                _this.$refs.corpspage.verifierContenuPage(elementPrecedent.corpPagePrecedentID, false);
        
                            }
        
                        }
        
                        window["elHeight_"+focusID] = rect.height;
        
                        isResize = true;
        
                    });
        
                    // start observing for resize
                    resize_ob.observe(document.querySelector("#"+focusID));
        
        },

    }
})

// component-corps-page.js
const corps = Vue.component("Corps-page", {
    template: /* html */ ` 
    <div 
        contentEditable="true"
        @keyup="changeFocus"
        @keyup.enter.exact="newLine" 
    >
        <Content-page 
            v-on:overflowed="overflowed"
        />
        </Content-page>
    </div>    
`,
methods: {
        overflowed(id) {                                                             
            window["lastWord"] = false;
            window["classElem"] = false;

            var paramEmpty = false;

            var isScroll = true;

            var selectedNode = {
                node        : getSelection().anchorNode,
                divParentNode  : getSelection().anchorNode.parentElement.parentElement
            };

            if(id) {
                let parentCorps = document.getElementById(id).parentElement.id;
                scrollHeight = document.getElementById(parentCorps).scrollHeight;
                offsetHeight = document.getElementById(parentCorps).offsetHeight;
                activeElementID = parentCorps;

                isScroll = false;

            }
            else if(window.activeID) {
                scrollHeight = document.getElementById(window.activeID).scrollHeight;
                offsetHeight = document.getElementById(window.activeID).offsetHeight;
                activeElementID = window.activeID;
            }
            else {
                scrollHeight = this.$el.scrollHeight;
                offsetHeight = this.$el.offsetHeight;
                activeElementID = document.activeElement.id;

            }

            if (scrollHeight > offsetHeight) {

                //Si hauteur du contenu d'une page est supérieur à la hauteur d'une page, déplacer le paragraphe dépassé dans la page suivante
                this.deplacerElement(id, activeElementID, isScroll, selectedNode);

            } else {
                window.isEnterPress = false;
                return false;
            }

            window.arrowCode = false;

        },

        async newLine(e) {

            let focusParentElement = getSelection().focusNode.parentElement;

            let isLast = this.isLastParagraphe(e);

            window.isEnterPress = true;

            if (!isLast) {

                let focusedID = getSelection().focusNode.id ? getSelection().focusNode.id : getSelection().focusNode.parentElement.closest('div').id;

                if(!focusedID.includes("corp-page")) {

                    if(document.querySelectorAll("#"+focusedID).length > 1) {

                        var newId = window.newLineID = contentFile.generateID("el_");

                        if(getSelection().focusNode.id) getSelection().focusNode.id = newId;
                        else {
                            getSelection().focusNode.parentElement.closest('div').id = newId;
                        }

                        //Definir class par defaut d'un élément
                        this.changeElementClassList(newId);

                    }
                    else {
                        var newId = focusedID;
                    }

                    var lineID = getSelection().focusNode.parentElement.closest('div').id;

                    if(document.getElementById(newId).parentElement.tagName == "DIV" && !document.getElementById(newId).parentElement.closest('div').id.includes("corp-page")) {


                        if(document.getElementById(newId).tagName == 'DIV') {
                            var parentID = document.getElementById(newId).parentElement.closest('div').id;
                        }
                        else {
                            let newDivID = contentFile.generateID("el_");

                            document.getElementById(newId).parentElement.closest('div').id = newDivID;

                            var parentID = document.getElementById(newDivID).parentElement.closest('div').id;

                            lineID = getSelection().focusNode.parentElement.closest('div').id;
                        }

                        document.getElementById(newId).remove();

                        let newElemID = contentFile.generateID("el_");

                        document.getElementById(parentID).insertAdjacentHTML("afterend", '<div id="'+newElemID+'" class="champ __element text"></div>');

                        this.$root.setCurrentCursorPosition(0, newElemID, 0, document.activeElement.id);

                    }
                    else if(getSelection().focusNode.tagName == "DIV" && ((getSelection().focusNode.previousSibling) && (getSelection().focusNode.previousSibling.tagName == 'UL' || getSelection().focusNode.previousSibling.tagName == 'OL'))) {

                        var newDivID = contentFile.generateID("el_");

                        getSelection().focusNode.id = newDivID;

                        document.getElementById(newDivID).classList.add("champ", "__element", "text");

                        document.getElementById(newDivID).remove();

                        newDivID = contentFile.generateID("el_");

                        if(!focusParentElement.id.includes("corp-page")) {
                            this.traitementContenuElement(newId);
                        }
                        else {
                            document.getElementById(newId).insertAdjacentHTML("afterend", '<div id="'+newDivID+'" class="champ __element text"></div>');
                            this.$root.setCurrentCursorPosition(0, newDivID, 0, document.activeElement.id);
                        }

                    }

                    var dataElement = {
                        lineID      : focusedID,
                        pageID      : document.activeElement.id,
                        classElem   : document.getElementById(focusedID).classList
                    };

                    this.sendContentToWS(dataElement);

                    var dataElement = {
                        lineID      : lineID,
                        pageID      : document.activeElement.id,
                        classElem   : document.getElementById(lineID).classList
                    };

                    this.sendContentToWS(dataElement);

                    if(document.querySelectorAll("#"+getSelection().focusNode.parentElement.closest('div').id).length > 1) {
                        document.querySelectorAll("#"+getSelection().focusNode.parentElement.closest('div').id).forEach(function(element, key) {
                            if(key == document.querySelectorAll("#"+getSelection().focusNode.parentElement.closest('div').id).length-1) {
                                document.querySelectorAll("#"+getSelection().focusNode.parentElement.closest('div').id)[key].id = newId;
                            }
                        })
                    }

                }

            } else {
                e.preventDefault();
            }
        },

        async changeFocus(arrow) {

            window.arrowCode = arrow.code;

            if(arrow.code == "Enter" || arrow.code == "Space") {
                window.isPasteElement = false;
                window.lastSetCursor = false;
            }

            await this.$emit("focusChanged", arrow);

            this.overflowed();

        },

        recupererPositionCurseur(id) {

            const myDiv = document.getElementById(id);
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(myDiv);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const caretOffset = preCaretRange.toString().length;

            return caretOffset;

        },

        deplacerElement(id, activeElementID, isScroll, selectedNode) {

            var dernierPositionCurseur = this.recupererPositionCurseur(getSelection().focusNode.parentElement.closest('div').id);

            var isSetCursor = true;

            var isSetCursorNewPage = true;

            var lastWord = false;
            var lineTag = false;
            var parentID = "";

            var isCompteLigne = false;

            var lineID = document.getElementById(activeElementID).lastChild.id;

            //Si l'élément focus est différent au dernier élément d'une page
            //càd le curseur n'est pas dans le dernier ligne d'une page, il est au milieu d'une page
            if((getSelection().focusNode.parentElement.closest('div').id != document.getElementById(activeElementID).lastChild.id)) {

                //Si l'Id de l'élémént focus ne contient page "corp-page"
                if(!getSelection().focusNode.parentElement.closest('div').id.includes("corp-page")) {

                    window.cursorPos = this.$root.cursorInfo().caretPosition;

                    window.idToCursor = getSelection().focusNode.parentElement.closest('div').id;
                    window.activeElement = activeElementID;

                    if(window.isPasteElement) {

                        window["compterLigne"] = false;

                        var timers = setTimeout(() => {
                            this.compterLigne(lineID, activeElementID);
                        }, 20)

                    }
                    else {
                        this.compterLigne(lineID, activeElementID);
                    }

                    isCompteLigne = true;

                    lastWord = window["lastWord"];

                    lineTag = window["lineTag"];

                    this.sendWebsocket(lineID, activeElementID, true);

                    window.setLastWordFalse = true;

                    window.lastSetCursor = {
                        "pos" 	: dernierPositionCurseur,
                        "elId" 	: getSelection().focusNode.parentElement.closest('div').id,
                    };

                }
                else if(document.getElementById(lineID).innerHTML != "<br>") {

                    window["parentID"] = lineID;

                    this.compterLigne(lineID, activeElementID);

                    isCompteLigne = true;

                    lastWord = window["lastWord"];
                    lineTag = window["lineTag"];

                }

                isSetCursor = false;
                isSetCursorNewPage = false;

            }
            else {

                if(this.$root.cursorInfo().textToKeep != "" && this.$root.cursorInfo().textToNewLine != "") {

                    isSetCursor = false;
                    window.lastSetCursor = {
                        "pos" 	: this.$root.cursorInfo().caretPosition,
                        "elId" 	: id,
                    };
                }

                this.compterLigne(lineID, activeElementID);
                lastWord = window["lastWord"];
                lineTag = window["lineTag"];

            }

            if(getSelection().focusNode.parentElement.closest('div').id.includes("corp-page")) {

                if(selectedNode.node.tagName == "LI") {

                    window.lastSetCursor = {
                        "pos" 	: dernierPositionCurseur,
                        "elId" 	: selectedNode.divParentNode.id,
                    };

                    isSetCursor = false;

                }

            }

            if(window.activeID && (getSelection().focusNode.parentElement.closest('div').id != activeElementID)) {
                isSetCursor = true;
            }

            if(window.isEnterPress) {
                isSetCursor = false;
            }

            if(window.newLineID != document.getElementById(activeElementID).lastChild.id) {
                window.focusID = window.newLineID;
            }

            if(window.isPasteElement) {
                var _condition = (document.getElementById(document.getElementById(activeElementID).lastChild.id).innerHTML != "<br>");
            }
            else {
                var _condition = document.getElementById(document.getElementById(activeElementID).lastChild.id).innerHTML != "<br>" && document.getElementById(document.getElementById(activeElementID).lastChild.id).innerText != "";
            }

            if(_condition) {
                if(!window.setLastWordFalse) {
                    if(!getSelection().focusNode.parentElement.closest('div').id.includes("corp-page") && (getSelection().focusNode.parentElement.closest('div').id == document.getElementById(activeElementID).lastChild.id)) {

                        window.cursorPos = false;
                        window.idToCursor = getSelection().focusNode.parentElement.closest('div').id;
                        window.activeElement = activeElementID;

                        let tabLastElContent = document.getElementById(getSelection().focusNode.parentElement.closest('div').id).innerHTML.split(" ");
                        if(!window.isPasteElement && !this.$root.getTextSelected() && this.$root.cursorInfo().textToNewLine == "") {

                            window["lastWord"] = tabLastElContent.pop();
                        }
                        else {

                            window["compterLigne"] = false;

                            if(!isCompteLigne) {

                                var timers = setTimeout(() => {

                                    this.compterLigne(lineID, activeElementID);

                                    isCompteLigne = true;

                                    lineTag = window["lineTag"];

                                }, 20)

                            }

                            if(this.$root.cursorInfo().textToNewLine != "") {
                                isSetCursorNewPage = false;
                            }
                        }

                        let lineID = getSelection().focusNode.parentElement.closest('div').id;

                        window["parentID"] = getSelection().focusNode.parentElement.closest('div').id;

                        window["classElem"] = document.getElementById(getSelection().focusNode.parentElement.closest('div').id).classList;

                        lastWord = window["lastWord"];

                        let isTextSelected = this.$root.getTextSelected();

                        if(tabLastElContent.length > 0) {
                            document.getElementById(getSelection().focusNode.parentElement.closest('div').id).innerHTML = tabLastElContent.join(' ');
                        }

                        if(isTextSelected && !window.isPasteElement) {
                            document.getElementById(id).remove();
                        }
                        else if(getSelection().focusNode.tagName == 'LI') {
                            id = getSelection().focusNode.parentElement.closest("div").id;
                            document.getElementById(id).remove();
                        }

                    }
                    else {

                        window["parentID"] = lineID;

                        if(!isCompteLigne) {
                            this.compterLigne(lineID, activeElementID);
                        }

                        lastWord = window["lastWord"];
                        lineTag = window["lineTag"];

                        this.sendWebsocket(lineID, activeElementID, true);

                    }
                }
            }

            var _this = this;

            if(window.isPasteElement) {

                var timer = setInterval(function() {
                    if(window["compterLigne"]) {
                        if(window["lastWordPast"]) lastWord = window["lastWordPast"];
                        else lastWord = false;

                        window["lastWord"] = window["lastWordPast"];

                        _this.continuControlPage(activeElementID, isSetCursor, lastWord, isScroll, isSetCursorNewPage, lineTag, selectedNode);
                        window["lastWord"] = false;
                        window["compterLigne"] = false;
                        clearInterval(timer);
                    }
                }, 100);

            }
            else {

                _this.continuControlPage(activeElementID, isSetCursor, lastWord, isScroll, isSetCursorNewPage, lineTag, selectedNode);

                lastWord = false;

            };

            return true;

        },

        continuControlPage(activeElementID, isSetCursor, lastWord, isScroll, isSetCursorNewPage, lineTag, selectedNode) {

            //Si la page suivante existe, deplacer la derniere paragraphe vers la page suivante, si non, créer une nouvelle page
            if(document.getElementById(document.getElementById(activeElementID).parentElement.closest('div').id).nextSibling) {
                this.pageBreakProcessing(activeElementID, isSetCursor, lastWord, lineTag, selectedNode); //(corp-page-x, true/false)
            }
            else {

                this.$root.newPage(this.order_page, false, false, activeElementID, true, lastWord, isScroll, isSetCursorNewPage);

                setTimeout(function () {

                    if(document.getElementById(activeElementID) && document.getElementById(activeElementID).lastChild && document.getElementById(document.getElementById(activeElementID).lastChild.id).innerHTML == "<br>") {
                        document.getElementById(document.getElementById(activeElementID).lastChild.id).remove();
                    }

                }, 100)

                var _this = this;

                setTimeout(function () {

                    if(document.getElementById(activeElementID).scrollHeight > document.getElementById(activeElementID).offsetHeight) {

                        let dernierElement = document.getElementById(activeElementID).lastChild.id;

                        _this.overflowed(dernierElement);
                    }

                }, 100)

            }

            window.isEnterPress = false;

            var _this = this;

        },

        pageBreakProcessing(currentPage, setCursorElem, lastWord, lineTag, selectedNode) {

            var _phrases = window["lastWord"];
            var pageSuivant = document.getElementById(document.getElementById(currentPage).parentElement.closest('div').id).nextSibling.id;
            var corpsPageSuivant = document.getElementById(pageSuivant).querySelector(".__corps").id;
            var premierElemCorpsPageSuivant = document.getElementById(corpsPageSuivant).firstChild.id;
            var setCursorDone = false;

            if(!_phrases) {
                let currentPagelastChildID = document.getElementById(currentPage).lastChild.id;
                if(document.getElementById(currentPagelastChildID).innerHTML == document.getElementById(premierElemCorpsPageSuivant).innerHTML) {
                    document.getElementById(currentPagelastChildID).remove();
                    return;
                }
            }
            else if(!lineTag) {
                _phrases = this.reformerBalise(_phrases);
            }

            var cursorThisID = false;

            if(window.tabElement && window.tabElement.length > 0) {

                isPaste = true;
                var tabElement = window.tabElement;

                for (let i = 0; i < tabElement.length; i++) {

                    let lastWord = tabElement[i];
                    let thisID = contentFile.generateID("el_");

                    document.getElementById(premierElemCorpsPageSuivant).insertAdjacentHTML("beforebegin", '<div id="'+thisID+'" class="champ __element text">'+tabElement[i]+'</div>');

                    this.$root.checkElemSize(thisID);

                    premierElemCorpsPageSuivant = document.getElementById(corpsPageSuivant).firstChild.id;

                    if(cursorThisID == false) cursorThisID = thisID;

                    this.sendWebsocket(thisID, pageSuivant);

                    if(i == 0) {

                        let pos = tabElement[i].length;
                        let el = thisID;
                        this.$root.setCurrentCursorPosition(pos, el, 0, corpsPageSuivant);
                        this.$root._scrollNext("#"+corpsPageSuivant);

                    }

                }

                window.tabElement = [];

            }

            if(document.getElementById(currentPage).scrollHeight > document.getElementById(currentPage).offsetHeight) {

                let elemFocusedID = getSelection().focusNode.id ? getSelection().focusNode.id : getSelection().focusNode.parentElement.closest('div').id;
                let dernierElement = document.getElementById(currentPage).lastChild.id;

                if(elemFocusedID == document.getElementById(currentPage).lastChild.id && !this.$root.getTextSelected()) {

                    this.compterLigne(dernierElement, currentPage);

                    if(this.$root.cursorInfo().textToNewLine != "") {
                        setCursorElem = false;
                    }
                    else {
                        setCursorElem = true;
                    }

                }
                else {
                    this.overflowed(dernierElement);
                }

            }

            var newID = contentFile.generateID("el_");

            //S'il ne s'agit pas de l'action copier/coller
            if(!window.isPasteElement) {
                this.traitementSaisieNormal(premierElemCorpsPageSuivant, newID, corpsPageSuivant, setCursorElem, selectedNode, setCursorDone, _phrases);
            }
            else {

                let listClass = window["classElem"] ? window["classElem"] : "champ __element text";
                var elParent = window["parentID"] ? " el_parent="+window["parentID"]+" " : "";
                window["parentID"] = false;

                document.getElementById(premierElemCorpsPageSuivant).insertAdjacentHTML("beforebegin", '<div id="'+newID+'" class="'+listClass+'" '+elParent+'>'+(_phrases ? _phrases : "") +'</div>');

                if(elParent != "") {
                    this.fusionnerElement(newID);
                }

                if(!setCursorElem && window.lastSetCursor) {
                    if(document.getElementById(window.lastSetCursor.elId).parentElement.closest('div').id == corpsPageSuivant) setCursorDone = true;
                    this.$root.setCurrentCursorPosition(window.lastSetCursor.pos, window.lastSetCursor.elId, 0, corpsPageSuivant);
                    window.lastSetCursor = false;
                }
            }

            let _scrollHeight = document.getElementById(currentPage).scrollHeight;

            if(document.getElementById(document.getElementById(currentPage).lastChild.id).innerText == "") {
                _scrollHeight += 11;
            }

            if((_scrollHeight > document.getElementById(currentPage).offsetHeight) && (document.getElementById(document.getElementById(document.activeElement.id).lastChild.id).innerHTML == "<br>" || document.getElementById(document.getElementById(document.activeElement.id).lastChild.id).innerHTML == "")) {

                document.getElementById(document.getElementById(document.activeElement.id).lastChild.id).remove();

                if(!setCursorElem) {
                    if(document.getElementById(newID).parentElement.closest('div').id == corpsPageSuivant) setCursorDone = true;
                    this.$root.setCurrentCursorPosition(0, newID, 0, corpsPageSuivant);
                }

            }

            if(setCursorElem) {

                let pos = window["lastWord"].length;
                let el = newID;

                if(document.getElementById(el).parentElement.closest('div').id == corpsPageSuivant) setCursorDone = true;
                this.$root.setCurrentCursorPosition(pos, el, 0, corpsPageSuivant);

            }

            this.checkElemSize(newID);

            this.copyLastElement(corpsPageSuivant);

            this.sendWebsocket(newID, corpsPageSuivant, true);

            if(setCursorDone) this.$root._scrollNext("#"+corpsPageSuivant);

        },

        copyLastElement(page, maxIterations) {
            maxIterations = maxIterations || 10; // Limite le nombre d'itérations
            id = document.getElementById(page).lastChild.id;
        
            if(document.getElementById(page).scrollHeight > document.getElementById(page).offsetHeight) {
                this.overflowed(id);
        
                var _this = this;
        
                setTimeout(function () {
                    _this.copyLastElement(page, maxIterations - 1); // Décrémente le nombre d'itérations
                }, 100)
        
            }
            else {
                if(maxIterations > 0) { // Vérifie si le nombre d'itérations restant est supérieur à 0
                    if(document.getElementById(document.getElementById(page).parentElement.closest('div').id).nextSibling) {
                        let nextPage = document.getElementById(document.getElementById(page).parentElement.closest('div').id).nextSibling.id
                        let nextCorpsPage = document.getElementById(nextPage).querySelector(".__corps").id;
                        
                        if (nextCorpsPage !== page) {
                            this.copyLastElement(nextCorpsPage, maxIterations); // Passe le nombre d'itérations restant
                        }
                    }
                }
            }
        },

        compterLigne(id, idCorps) {

            let contenuPage = this.getCorpsElementHeight(idCorps, false);

            let dernierParagrapheID = document.getElementById(idCorps).lastChild.id;

            let hauteurParagraphe = document.getElementById(dernierParagrapheID).scrollHeight - 16;

            if(document.getElementById(id)) {

                let lineBreaks = this.getLineBreaks(id, true);

                let lineTag = lineBreaks[1];

                let lines = lineBreaks[0];

                let ligneParagraphe = lines;

                let hauteurLigne = hauteurParagraphe / lines.length;

                var ligne = [];
                ligne.text = "";
                ligne.lineToKeep = "";

                if(document.getElementById(idCorps).scrollHeight > document.getElementById(idCorps).offsetHeight) {

                    const BreakError = {};

                    var lineToKeep = lines;

                    let pageHeight = document.getElementById(idCorps).scrollHeight;

                    let tabIndex = [];

                    try {
                        lines.forEach((element, index)=> {

                            if(pageHeight > document.getElementById(idCorps).offsetHeight) {

                                if(lineTag) {
                                    if(index == 0) {
                                        ligne.text = [];
                                    }

                                    let textLine = lines[(lines.length - index) - 1];

                                    ligne.text.push(textLine);

                                }
                                else {
                                    ligne.text = lines[(lines.length - index) - 1] + ' '+ ligne.text;
                                }

                                tabIndex.push((lines.length - index) - 1);

                            }

                            pageHeight = pageHeight - (hauteurLigne);

                        });
                    } catch (err) {
                        //
                    }

                    if(lineTag) {
                        document.getElementById(id).innerText = "";
                    }

                    let i = 0;
                    var ul = "";

                    lines.forEach((element, index)=> {
                        if(!tabIndex.includes(index)) {

                            if(lineTag && (lineTag == "UL" || lineTag == "OL")) {

                                if(i == 0) {
                                    var ul = document.createElement(lineTag);
                                }
                                else {

                                    var ul = document.getElementById(id).childNodes[0]

                                }

                                var li = document.createElement('li');
                                li.innerHTML = element;
                                ul.appendChild(li);
                                document.getElementById(id).appendChild(ul);

                                i++;

                            }

                            ligne.lineToKeep += element;

                        }
                    })

                    window["lastWord"] = ligne.text;
                    window["classElem"] = document.getElementById(id).classList;
                    window["parentID"] = id;
                    window["lineTag"] = lineTag;

                    let supprLigne = lines.pop();

                    if(ligne.lineToKeep == "") {
                        document.getElementById(id).remove();
                    }
                    else {

                        if(!lineTag) {

                            ligne.lineToKeep = this.reformerBalise(ligne.lineToKeep);

                            document.getElementById(id).innerHTML = ligne.lineToKeep;

                        }

                        document.getElementById(id).setAttribute("el_parent", id);

                        this.sendWebsocket(id, idCorps, true);

                    }
                }

                window["lastWordPast"] = window["lastWord"]
                window["compterLigne"] = true;
            }

        },

        getCorpsElementHeight(idCorpPage, idLigneSupprim) {

            let allChildHeight = 37;

            document.getElementById(idCorpPage).childNodes.forEach((element) => {

                if((idLigneSupprim && idLigneSupprim != element.id) || !idLigneSupprim) {

                    //Si l'élémént contient la class h1/h2/h3/h4/h5/h6
                    if(element.className.match(/\bh./) != null) {

                        allChildHeight += 30; //Somme margin-top + margin-bottom d'un élément avec class h* = 30;

                    }

                    if(element.innerHTML == "") allChildHeight += 21;

                    allChildHeight += element.scrollHeight;

                }

            });

            return allChildHeight;

        },

        reformerBalise(text) {

            text = text.replace(/!b!/g,'<b>').replace(/!\/b!/g,'</b>');
            text = text.replace(/!i!/g,'<i>').replace(/!\/i!/g,'</i>');
            text = text.replace(/!u!/g,'<u>').replace(/!\/u!/g,'</u>');

            return text;

        },

        isLastParagraphe(e) {
            let currentPage = this.$el;
            if (this.contentHeight() > currentPage.offsetHeight) 
            {
                console.log(
                    "end of file :" +
                    this.contentHeight() +
                    ">" +
                    currentPage.offsetHeight +
                    " \n this element : "
                );
                
                return true;
            }
            return false;
        },

        contentHeight() {
            let arrParagraph = Object.values(this.$el.children);
            let sHeight = 0;
            arrParagraph.forEach((element) => {
                sHeight += element.offsetHeight;
            });

            return sHeight;
        },
    }
})


const ContentPage = Vue.component("Content-page", {
    template: /* html */ `
    <div :id="id"  :class="classElement" v-html="data" @click="focused">
         
    </div> 
`,

    methods: {
        focused(e) {

            let focusID = getSelection().focusNode.id ? getSelection().focusNode.id : getSelection().focusNode.parentElement.closest('div').id;
            this.$emit("checkElemSize", focusID);

            if (this.id === getSelection().focusNode.parentElement.id) {
                this.$emit("focused", { el: this, event: e });
            }

            var lineID = getSelection().focusNode.parentElement.closest('div').id;


            if(lineID) {

                if(window["lastLineID"] === false) {
                    window["lastLineID"] = lineID;
                }

                var cursorInfo = this.$root.cursorInfo();

                if(window["lastLineID"] != lineID) {
                    window["lastcursorPosition"] = false;
                }

                if(window["lastcursorPosition"] === false) {
                    window["lastcursorPosition"] = cursorInfo.caretPosition;
                }

                var charLength = cursorInfo.caretPosition - window["lastcursorPosition"];

                var allLineID = [];

                if(e.keyCode == 8 || e.keyCode == 46) {

                    const parent = document.getElementById(document.activeElement.id);

                    const children = Array.from(parent.children);

                    allLineID = children.map(element => {
                        return element.id;
                    });

                }

                if(!window["lastLineVal"]) {
                    window["lastLineVal"] = document.getElementById(lineID).innerHTML;
                }

                if(window["lastLineVal"] != document.getElementById(lineID).innerHTML) {

                    var dataElement = {
                        lineID      : lineID,
                        pageID      : document.activeElement.id,
                        classElem   : document.querySelector("#"+lineID) ? document.getElementById(lineID).classList : "",
                        allLineID   : allLineID,
                        nextSibling : document.getElementById(document.getElementById(document.activeElement.id).parentElement.closest('div').id).nextSibling ? true : false,
                        siblingID   : document.getElementById(document.getElementById(document.activeElement.id).parentElement.closest('div').id).nextSibling ? document.getElementById(document.getElementById(document.activeElement.id).parentElement.closest('div').id).nextSibling.id : (document.getElementById(document.getElementById(document.activeElement.id).parentElement.closest('div').id).previousSibling ? document.getElementById(document.getElementById(document.activeElement.id).parentElement.closest('div').id).previousSibling.id : document.activeElement.id),
                        charLength  : charLength,
                        cursorPos   : window["lastcursorPosition"],
                    };

                    window["lastLineVal"] = document.getElementById(lineID).innerHTML;

                    this.$emit("sendContentToWS", dataElement);

                }

                window["lastcursorPosition"] = cursorInfo.caretPosition;

                window["lastLineID"] = lineID;

            }

        },
    },

    computed: {
        classElement() {
            let strClass = "champ __element ";
            switch (this.type) {
                case "paragraphe":
                    //strClass += "text " + this.styles;
                    break;
                default:
                    strClass += this.type + " " + this.styles;
            }

            let classList = strClass.split(" ");
            let uniqCL = [...new Set(classList)];

            return uniqCL.join(" ");
        },
    },

    created() {
        this.$parent.$on("focusChanged", (e) => this.focused(e));
    },

})


const Application = new Vue({
	el: "#app",
	template: /* html */ `  
        <div id="innerApp" @click.once="firstClick" @keydown.esc = "hideError" @keydown.80.ctrl.prevent="exportToPDF" > 
            <div style="display: flex; vertical-align: middle; justify-content: center; position: absolute; right: 1px; margin-top: 10px">
            	<User-list v-for="(user,index) in getUserList" :client="user.client" :util_img="user.util_img" :util_id="user.util_id" :util_nom="user.util_nom" :util_prenom="user.util_prenom" :util_surnom="user.util_surnom" :util_mail="user.util_mail" v-if="user.util_id != connectedUtilId"/>
            	<button type="button" class="btn btn-success btn-sm" style="margin-right: 5px; margin-left: 3px; background-color: #0b8d13" disabled>
            		<i class="fa fa-slideshare"></i> Partager
            	</button>
            	<div v-for="(user,index) in getUserList" :client="user.client" :util_img="user.util_img" :util_id="user.util_id" :util_nom="user.util_nom" :util_prenom="user.util_prenom" :util_surnom="user.util_surnom" :util_mail="user.util_mail">
            		<user-photo v-if="user.util_id == connectedUtilId" :u-url="'https://licences.manao.eu/uploads/'+client.toString().padStart(6, '0')+'/'+util_img" :u-userid="util_id" :u-firstname="util_nom" :u-lastname="util_prenom" :u-username="util_surnom" :u-usermail="util_mail"></user-photo>
            	</div>
            </div>
            <Option-bar :urlIcon="icon" :urlIconFolderPath="iconFolderPath" v-on:sendContentToWS="sendContentToWS"/>
			<transition name="fade"  v-for="(Error,num) in Errors"> 
				<Pop-up v-if="error" :type="Error.type" :titre="Error.titre" :message="Error.message" :id="num"/>
			</transition>
            <div class="page-back" @keyup.stop="listenKeyPressed">
                <Page-inner v-on:newPage="newPage" v-on:sendContentToWS="sendContentToWS"  v-on:headerFooterUpd="headerFooterUpd" :numero="index + 1" :format="format_doc" :orientation="orientation"  :order_page="page.order" :id_corps_page="page.id" v-for="(page,index) in Pages" ref="pageinner"/>
            </div>
			<Status-bar :connexion="StatusConnexion"/>

        </div>
    `,
})
