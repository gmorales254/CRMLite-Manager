//# sourceURL=CRMLiteManager.js
preBindTab(null); //Don't delete this line

//------------------INICIO INTERNACIONALIAZCIÓN ---------
var language = parent.language;
 var options = {
  lng: language,
   resGetPath: "CRMLiteManager" + "-" + language + ".json"
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



//BotDesigner>> funciones de eventos

//evento click en boton de agregar opciones

function botAddOption(ele){
ele[0].parentElement.parentElement.querySelector(".optionsHolder").insertAdjacentHTML(
  "beforeend",
  `
<div class="holderRound ui-sortable-handle"><input class="optionInput" placeholder="Option" style="width: 60%;"> 
<span onclick="$(this).parent().remove()" class="fa fa-times deleteOption"></span>
<select  class="logicSwitch selectActionOnOption1" onclick="botChangeCMBOption($(this))" style="display: inline-block;">
    <option value="goto">Go to</option>
    <option selected value="goto:next">Next question / Finish</option>
    <option value="goto:finish">Finish</option>
    <option value="queuetransfer">Transfer to queue</option>
</select>
<select  class="logicSwitch selectActionOnOption2" style="display: none;">
   
</select>
</div>
`
);

makeOptionsSortables();
}

async function makeOptionsSortables() {
    //$("#surveyContainer").i18n();
  
    $(".element>.elementController>.optionsHolder").sortable({
      helper: "clone",
      items: "> div.holderRound",
      start: function (event, ui) {},
      stop: function (event, ui) {},
    });
  
    $("#surveyHolder").sortable({
      helper: "clone",
      items: "> div[data-element]",
      start: function (event, ui) {},
      stop: function (event, ui) {},
    });
  }

async function botChangeCMB(e){
  await changeSecondLevelOfActions(
    e[0],
    e[0].parentElement.querySelector(".cmbQuestionActions2")
  )
}
async function botChangeCMBOption(e){
    await changeSecondLevelOfActions(
      e[0],
      e[0].parentElement.querySelector(".selectActionOnOption2")
    )

}

async function changeSecondLevelOfActions(firstselect, secondselect) {
  let queue = document.getElementById('cmbBotChannelsCampaigns').value.split(" ")[0];
  let channel = document.getElementById('cmbBotChannelsCampaigns').value.split(" ")[1];
  channel = channel.substring(1, channel.length - 1);

  let queuesForTransfer = JSON.parse(
    await UC_get_async(
      `SELECT name FROM ccdata.${channel}_queues WHERE name NOT IN ('${queue}') group by name `,
      ""
    )
  );


  if (firstselect.value == "goto:next" || firstselect.value == "goto:finish") {
    secondselect.style.display = "none";
    secondselect.innerHTML = `
        <option disabled selected value="">With no value</option>
    `;
  } else if (firstselect.value == "queuetransfer") {
    secondselect.style.display = "inline-block";
    secondselect.innerHTML = `
          <option selected value="" disable> Select a campaign</option>
          ${queuesForTransfer.map((eee) => {
            return `<option value="${eee.name}">${eee.name}</option>`;
          })}
    `;
  } else if (firstselect.value == "goto") {
    let questionsCount = document
      .getElementById("surveyHolder")
      .querySelectorAll("[data-element]").length;
    let optionsActions = "";
    for (let i = 0; i < questionsCount; i++)
      optionsActions += `<option value="${i}">${i + 1}</option>`;

    secondselect.style.display = "inline-block";
    secondselect.innerHTML = `
          <option selected value="" disable> Select a question</option>
          ${optionsActions}
    `;
  } else {
    secondselect.style.display = "none";
    secondselect.innerHTML = `
          <option selected value="" disable> Non-value option</option>
    `;
  }
}
