//# sourceURL=CRMLiteManager.js
preBindTab(null); //Don't delete this line

//------------------INICIO INTERNACIONALIAZCIÓN ---------
var language = parent.language;
 var options = {
  lng: language,
   resGetPath: "TAFF" + "-" + language + ".json"
 };

 i18n.init(options, function (t) {
     $("body").i18n();
 });
 //------------------FIN INTERNACIONALIAZCIÓN ----------


/* LOGICA DEL TAB */
var tab = document.getElementsByClassName('tab');
var tabContent = document.getElementsByClassName('tabContent');

hideTabsContent(1);


document.getElementById('tabs').onclick = function (event) {

    if (event.target.className == 'tab') {
        for (let i = 0; i < tab.length; i++) {
            console.log(`target: ${event.target} / ${tab[i]}`)
            if (event.target == tab[i]) {
                showTabsContent(i);
                break;
            }
        }
    }
}

function hideTabsContent(a) {
    for (var i = a; i < tabContent.length; i++) {
        tabContent[i].classList.remove('show');
        tabContent[i].classList.add("hide");
        tab[i].classList.remove('whiteborder');
    }
}

function showTabsContent(b) {
    if (tabContent[b].classList.contains('hide')) {
        hideTabsContent(0);
        tab[b].classList.add('whiteborder');
        tabContent[b].classList.remove('hide');
        tabContent[b].classList.add('show');
    }
}

/* FIN DE LOGICA DEL TAB */



