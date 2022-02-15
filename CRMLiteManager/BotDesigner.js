//# sourceURL=BotDesigner.js
var arrCampaignsToTransfer = [];

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

function changeController(element) {
  let elemento = "";
  let elementController =
    element.parentElement.parentElement.querySelector(".elementController");

  switch (element.value) {
    case "multiple":
      elemento = `
        <div class="optionsHolder ui-sortable">
          <div class="holderRound ui-sortable-handle"><input class="optionInput" placeholder="Option" style="width: 60%;"> 
          <span onclick="$(this).parent().remove()" class="fa fa-times deleteOption"></span>
          <select  class="logicSwitch selectActionOnOption1" onchange="botChangeCMBOption($(this))" style="display: inline-block;">
              <option value="goto">Go to</option>
              <option selected value="goto:next">Next question / Finish</option>
              <option value="goto:finish">Finish</option>
              <option value="queuetransfer">Transfer to queue</option>
          </select>
          <select  class="logicSwitch selectActionOnOption2" style="display: none;">
            
          </select>
          </div>
          
        </div>
        <div class="otherBlock">
              <button class="btn btn-primary btnNormal" data-btn="addoption" onclick="botAddOption($(this))" data-i18n="ucontact.OPTION">Add an option</button>
          </div>`;

      break;

    default:
      elemento = `
      <div class="switch-hold">
                                
          <select class="form-control cmbQuestionActions1" onchange="botChangeCMB($(this))">
                                  <option value="goto">Go to</option>
                                  <option selected value="goto:next">Next question / Finish</option>
                                  <option value="goto:finish">Finish</option>
                                  <option value="queuetransfer">Transfer to queue</option>
          </select>
            <select class="form-control cmbQuestionActions2" style="display:none">
                <option value="" selected disable ></option>
            </select>
            
      </div>
      `;

      break;
  }

  elementController.innerHTML = elemento;
  addOptionListener();
}

async function init() {
  document.querySelector(".botdesigner_section").style.display = "none";
  document.getElementById("spnBotLastUpdate_main").style.display = "none";
  document.getElementById("btnBotSave").style.display = "none";
  //cargamos todos los datos
  makeOptionsSortables();
  loadCampaigns("cmbBotChannelsCampaigns", "Select a campaign");
  let emailqueues = JSON.parse(
    await UC_get_async(`SELECT name FROM ccdata.email_queues`, "")
  );
  document.getElementById("botdesigner_emailSection").style.display = "";
  $(`#cmbBotEmailCampaign`).empty();
  $(`#cmbBotEmailCampaign`).trigger("chosen:updated");
  $(`#cmbBotEmailCampaign`).prepend(
    `<option disabled selected value>Select a campaign</option>`
  );

  emailqueues.map((item) =>
    $(`#cmbBotEmailCampaign`).append(new Option(item.name, item.name))
  );
}

function addOptionListener() {
  /*let btns = document.querySelectorAll('[data-btn="addoption"]');
  btns.forEach((e) => {
    e.addEventListener("click", (ele) => {
      ele.path[2].querySelector(".optionsHolder").insertAdjacentHTML(
        "beforeend",
        `
      <div class="holderRound ui-sortable-handle"><input class="optionInput" placeholder="Option" style="width: 60%;"> 
      <span onclick="$(this).parent().remove()" class="fa fa-times deleteOption"></span>
      <select  class="logicSwitch selectActionOnOption1" style="display: inline-block;">
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

      let selectAnOptionActions = document.querySelectorAll(
        ".selectActionOnOption1"
      );
      selectAnOptionActions.forEach((elem) => {
        elem.addEventListener("change", (e) =>
          changeSecondLevelOfActions(
            e.target,
            e.target.parentElement.querySelector(".selectActionOnOption2")
          )
        );

      });

      makeOptionsSortables(); 
    });
  }); */
}

export async function changeSecondLevelOfActions(firstselect, secondselect) {
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

document
  .getElementById("botpregunta_addquestion")
  .addEventListener("click", () => {
    let doc = document.getElementById("surveyHolder");
    doc.insertAdjacentHTML(
      "beforeend",
      `
  <div class="element control ui-sortable-handle botpregunta__div activeElement"
											data-element="simple">
                      
											<span onclick="$(this).parent().remove()" class="fa fa-times deleteOption" style="float:right;"></span>
											<div class="question">
												<textarea class="input-element" rows="3"
													onkeyup="$(this).html($(this).val().trim());" placeholder="Question"
													style="margin-top: 0px; margin-bottom: 20px; height: 75px;">Here the question</textarea>
											</div>
											<div class="selectElement">
												<select class="form-control selectTypeOfQuestion">
													<option selected value="simple">Simple question</option>
													<option value="multiple">Multiple options</option>
													<option value="file">Request a document/file</option>
													<option value="message">Message</option>
												</select>

											</div>
											<div class="elementController">
                      <div class="switch-hold">
                      <select class="form-control cmbQuestionActions1" onchange="botChangeCMB($(this))">
                        <option value="goto">Go to</option>
                        <option selected value="goto:next">Next question / Finish</option>
                        <option value="goto:finish">Finish</option>
                        <option value="queuetransfer">Transfer to queue</option>
                      </select>
                      <select class="form-control cmbQuestionActions2" style="width: 30px; display: none;">
                        
                      </select>
                    </div>
											</div>
											
										</div>
  `
    );

    let changerOfAllTypeOfQuestions = document.querySelectorAll(
      ".selectTypeOfQuestion"
    );
    changerOfAllTypeOfQuestions.forEach((elem) => {
      elem.addEventListener("change", (e) => changeController(e.target));
    });
    addOptionListener();
  });

async function loadCampaigns(inputName = "", defaultOpt = "") {
  let campaigns = [];

  //email
  let channelEmail = JSON.parse(
    await UC_get_async(`SELECT name FROM ccdata.email_queues group by name`, "")
  );
  if (channelEmail.length)
    channelEmail.map((item) => campaigns.push(`${item.name} (email)`));
  //messenger
  let channelMessenger = JSON.parse(
    await UC_get_async(
      `SELECT name FROM ccdata.messenger_queues group by name`,
      ""
    )
  );
  if (channelMessenger.length)
    channelMessenger.map((item) => campaigns.push(`${item.name} (messenger)`));
  //sms
  let channelSms = JSON.parse(
    await UC_get_async(`SELECT name FROM ccdata.sms_queues group by name`, "")
  );
  if (channelSms.length)
    channelSms.map((item) => campaigns.push(`${item.name} (sms)`));
  //Webchat
  let channelWeb = JSON.parse(
    await UC_get_async(
      `SELECT name FROM ccdata.webchat_queues group by name`,
      ""
    )
  );
  if (channelWeb.length)
    channelWeb.map((item) => campaigns.push(`${item.name} (webchat)`));

  //cargo los datos recogidos:
  $(`#${inputName}`).empty();
  $(`#${inputName}`).trigger("chosen:updated");
  $(`#${inputName}`).prepend(
    `<option disabled selected value>${defaultOpt}</option>`
  );
  campaigns.map((item) => $(`#${inputName}`).append(new Option(item, item)));
  $(`#${inputName}`).trigger("chosen:updated");

  //agrego event listener
  document
    .getElementById(`${inputName}`)
    .addEventListener("change", async (e) => {
      let queue = e.target.value.split(" ")[0];
      let channel = e.target.value.split(" ")[1];
      channel = channel.substring(1, channel.length - 1);
      await getAndInsertBotByCampaign(queue, channel);
    });
}

async function getAndInsertBotByCampaign(queue = "", channel = "") {
  document.getElementById("surveyHolder").innerHTML = "";
  document.getElementById("spnBotLastUpdate_main").style.display = "none";
  document.getElementById("btnBotSave").style.display = ""; //Se muestra el botón ya que la campaña es distinta a vacío.
  document.getElementById("botdesigner_emailSection").style.display = "none";
  document.querySelector(".botdesigner_section").style.display = "";

  let botToLoad = JSON.parse(
    await UC_get_async(
      `SELECT * FROM CRMLite_bots WHERE campaign = "${queue}" AND channel = "${channel}" LIMIT 1`,
      ""
    )
  );
  if (botToLoad.length) {
    let queuesForTransfer = JSON.parse(
      await UC_get_async(
        `SELECT name FROM ccdata.${channel}_queues WHERE name NOT IN ('${queue}') group by name `,
        ""
      )
    );
    arrCampaignsToTransfer = queuesForTransfer;

    botToLoad = botToLoad[0];
    //cargamos bot
    document.getElementById("spnBotLastUpdate_main").style.display = "";
    document.getElementById("spnBotLastUpdate").innerText =
      botToLoad.lastupdate;
    document.getElementById("txtBotTitle").value = botToLoad.title;
    document.getElementById("cmbBotLanguage").value = botToLoad.language;
    document.getElementById("txtBotWelcome").value = botToLoad.welcome;
    document.getElementById("txtBotMsgBeforeFinishInteraction").value =
      botToLoad.msgBeforeFinishInteraction;
    document.getElementById("txtBotMsgAfterTimeout").value =
      botToLoad.msgBeforeTimeOutAction;
    document.getElementById("cmbBotAfterFinish2").style.display = "none";

    if (botToLoad.afterTimeout === "goto:finish") {
      document.getElementById("cmbBotAfterFinish2").style.display = "none";
      document.getElementById("cmbBotAfterFinish1").value = "goto:finish";
    } else if (botToLoad.afterTimeout.split(":")[0] === "queuetransfer") {
      let aftertimeoutQueueTransfer = botToLoad.afterTimeout.split(":")[1];

      $(`#cmbBotAfterFinish2`).empty();
      $(`#cmbBotAfterFinish2`).trigger("chosen:updated");
      $(`#cmbBotAfterFinish2`).prepend(
        `<option disabled selected value>Select a campaign</option>`
      );
      queuesForTransfer.map((item) =>
        $(`#cmbBotAfterFinish2`).append(new Option(item.name, item.name))
      );
      $(`#cmbBotAfterFinish2`).trigger("chosen:updated");

      document.getElementById("cmbBotAfterFinish2").value =
        aftertimeoutQueueTransfer;
      document.getElementById("cmbBotAfterFinish2").style.display = "";
      document.getElementById("cmbBotAfterFinish1").value = "queuetransfer";
    } else {
      document.getElementById("cmbBotAfterFinish2").style.display = "none";
      document.getElementById("cmbBotAfterFinish1").value = "";
      return { error: "Option doesn't exists" };
    }

    document.getElementById("chkBotRequiredInfo").checked =
      botToLoad.requiredInfo;
    document.getElementById("chkBotSendInteractionHistory").checked =
      botToLoad.sendInteractionHistory;
    if (document.getElementById("chkBotSendInteractionHistory").checked) {
      document.getElementById("botdesigner_emailSection").style.display = "";

      if (botToLoad.emailConfig) {
        let emailConfig = botToLoad.emailConfig.split("|");

        if (!!emailConfig[0])
          document.getElementById("cmbBotEmailCampaign").value = emailConfig[0];
        else document.getElementById("cmbBotEmailCampaign").value = "";
        if (!!emailConfig[1])
          document.getElementById("txtBotEmailTo").value = emailConfig[1];
        else document.getElementById("txtBotEmailTo").value = "";
        if (!!emailConfig[2])
          document.getElementById("txtBotEmailCC").value = emailConfig[2];
        else document.getElementById("txtBotEmailCC").value = "";
      }
    } else {
      document.getElementById("botdesigner_emailSection").style.display =
        "none";
      document.getElementById("cmbBotEmailCampaign").value = "";
      document.getElementById("txtBotEmailCC").value = "";
      document.getElementById("txtBotEmailTo").value = "";
    }

    //FUNCION PARA CARGAR TODOS LOS CAMPOS NUEVOS DEL SURVEY
    botToLoad.questions = JSON.parse(botToLoad.questions);

    botToLoad.questions.map((e, i, a) => {
      let doc = document.getElementById("surveyHolder");
      let selectType = `
<select class="form-control selectTypeOfQuestion" >
                    <option ${
                      e.type == "simple" && "selected"
                    } value="simple">Simple question</option>
                    <option ${
                      e.type == "multiple" && "selected"
                    } value="multiple">Multiple options</option>
                    <option ${
                      e.type == "file" && "selected"
                    } value="file">Request a document/file</option>
                    <option ${
                      e.type == "message" && "selected"
                    } value="message">Message</option>
</select>
`;
      let inserthtml = "";
      let selectAnOptionActionsSimple = null;
      switch (e.type) {
        case "multiple":
          let options = "";
          let selectOptionAction2 = "";

          e.action.map((ee, ii, aa) => {
            if (ee == "goto:next" || ee == "goto:finish") {
              selectOptionAction2 = `
            <select  class="logicSwitch selectActionOnOption2" style="display: none">
                <option selected value="" disable> Non-value option</option>
            </select>
            `;
            } else if (ee.split(":")[0] == "queuetransfer") {
              selectOptionAction2 = `
            <select  class="logicSwitch selectActionOnOption2" style="display: inline-block;">
                ${queuesForTransfer.map((eee) => {
                  return `<option value="${eee.name}" ${
                    ee.split(":")[1] == eee.name && "selected"
                  }>${eee.name}</option>`;
                })}
            </select>
            `;
            } else if (ee.split(":")[0] == "goto") {

              let questions_arrr = "";
            for (let ii = 0; ii < a.length; ii++) {
              questions_arrr += `<option value="${ii}" ${
                ee.split(":")[1] == ii && "selected"
              }>${ii + 1}</option>`;
            }

              selectOptionAction2 = `
          <select  class="logicSwitch selectActionOnOption2"
															style="display: inline-block;">
              ${questions_arrr}
          </select>
          `;
            } else {
              selectOptionAction2 = `
            <select  class="logicSwitch selectActionOnOption2"
            style="display: none;">
            </select>
            `;
            }

            options += `
          <div class="holderRound ui-sortable-handle">
          <input class="optionInput" placeholder="Question" style="width: 60%;" value="${
            e.question[ii]
          }" /> 
          <span onclick="$(this).parent().remove()" class="fa fa-times deleteOption"></span>
														<select  class="logicSwitch selectActionOnOption1"  onchange="botChangeCMBOption($(this))" style="display: inline-block;">
                              <option ${
                                ee != "goto:next" &&
                                ee != "goto:finish" &&
                                ee.split(":")[0] === "goto" &&
                                "selected"
                              } value="goto">Go to</option>
                              <option ${
                                ee == "goto:next" && "selected"
                              } value="goto:next">Next question / Finish</option>
                              <option ${
                                ee == "goto:finish" && "selected"
                              } value="goto:finish">Finish</option>
                              <option ${
                                ee.split(":")[0] == "queuetransfer" &&
                                "selected"
                              } value="queuetransfer">Transfer to queue</option>
														</select>
                            ${selectOptionAction2}
													</div>
          `;
          });

          inserthtml = `
        <div class="element control activeElement logicInput botpregunta__div"
											data-element="Seleccion multiple">
											<span onclick="$(this).parent().remove()" class="fa fa-times deleteOption" style="float:right;"></span>
											<div class="question"><textarea class="input-element" rows="3"
													onkeyup="$(this).html($(this).val().trim());">${e.message}</textarea>
											</div>
											<div class="selectElement">
												${selectType}

											</div>
											<div class="elementController">
												<div class="optionsHolder ui-sortable">
													${options}
												</div>
												<div class="otherBlock">
                        <button class="btn btn-primary btnNormal" data-btn="addoption" onclick="botAddOption($(this))" data-i18n="ucontact.OPTION">Add an option</button>
												</div>

											</div>

										</div>
                    `;

  /*        selectAnOptionActionsSimple = document.querySelectorAll(
            ".cmbQuestionActions1"
          );
          selectAnOptionActionsSimple.forEach((elem) => {
            elem.addEventListener("change", (e) =>
              changeSecondLevelOfActions(
                e.target,
                e.target.parentElement.querySelector(".cmbQuestionActions2")
              )
            );
          });
*/
          break;

        default:
          let selectAction1 = `
          <select class="form-control cmbQuestionActions1" onchange="botChangeCMB($(this))">
                                  <option ${
                                    e.action != "goto:next" &&
                                    e.action != "goto:finish" &&
                                    e.action.split(":")[0] === "goto" &&
                                    "selected"
                                  } value="goto">Go to</option>
                                  <option ${
                                    e.action == "goto:next" && "selected"
                                  } value="goto:next">Next question / Finish</option>
                                  <option ${
                                    e.action == "goto:finish" && "selected"
                                  } value="goto:finish">Finish</option>
                                  <option ${
                                    e.action.split(":")[0] == "queuetransfer" &&
                                    "selected"
                                  } value="queuetransfer">Transfer to queue</option>
          </select>
          `;

          let selectAction2 = "";

          if (e.action == "goto:next" || e.action == "goto:finish") {
            selectAction2 = `
            <select class="form-control cmbQuestionActions2" style="width: 30px; display: none;">
  
            </select>
            `;
          } else if (e.action.split(":")[0] == "queuetransfer") {
            selectAction2 = `
            <select class="form-control cmbQuestionActions2" style="width: 120px;">
                ${queuesForTransfer.map((ee) => {
                  return `<option value="${ee.name}" ${
                    e.action.split(":")[1] == ee.name && "selected"
                  }>${ee.name}</option>`;
                })}
            </select>
            `;
          } else if (e.action.split(":")[0] == "goto") {
            let questions_arr = "";
            for (let ii = 0; ii < a.length; ii++) {
              questions_arr += `<option value="${ii}" ${
                e.action.split(":")[1] == ii && "selected"
              }>${ii + 1}</option>`;
            }

            selectAction2 = `
          <select class="form-control cmbQuestionActions2" style="width: 30px;">
              ${questions_arr}
          </select>
          `;
          } else {
            selectAction2 = `
            <select class="form-control cmbQuestionActions2" style="width: 30px; display: none;">
            </select>
            `;
          }

          inserthtml = `
          <div class="element control ui-sortable-handle botpregunta__div activeElement"
                              data-element="simple">
                              
                              <span onclick="$(this).parent().remove()" class="fa fa-times deleteOption" style="float:right;"></span>
                              <div class="question">
                                <textarea class="input-element" rows="3"
                                  onkeyup="$(this).html($(this).val().trim());" placeholder="Question"
                                  style="margin-top: 0px; margin-bottom: 20px; height: 75px;">${e.question}</textarea>
                              </div>
                              <div class="selectElement">
                                ${selectType}
                              </div>
                              <div class="elementController">
                              <div class="switch-hold">
                              ${selectAction1}
                              ${selectAction2}
                            </div>
                              </div>
                              
                            </div>
          `;

          selectAnOptionActionsSimple = document.querySelectorAll(
            ".cmbQuestionActions1"
          );
          selectAnOptionActionsSimple.forEach((elem) => {
            elem.addEventListener("change", (e) =>
              changeSecondLevelOfActions(
                e.target,
                e.target.parentElement.querySelector(".cmbQuestionActions2")
              )
            );
          });

          break;
      }

      doc.insertAdjacentHTML("beforeend", inserthtml);
    });

    addOptionListener();
    makeOptionsSortables();

    //CARGA DE BOT COMPLETA
  } else {
    //limpiamos campos y bloqueamos los default
    document.getElementById("spnBotLastUpdate").innerText = "";
    document.getElementById("txtBotTitle").value = "";
    document.getElementById("cmbBotLanguage").value = "";
    document.getElementById("txtBotWelcome").value = "";
    document.getElementById("txtBotMsgBeforeFinishInteraction").value = "";
    document.getElementById("txtBotMsgAfterTimeout").value = "";
    document.getElementById("chkBotSendInteractionHistory").checked = false;
    document.getElementById("chkBotRequiredInfo").checked = false;
    document.getElementById("cmbBotEmailCampaign").value = "";
    document.getElementById("txtBotEmailCC").value = "";
    document.getElementById("txtBotEmailTo").value = "";
    document.getElementById("spnBotLastUpdate_main").style.display = "none";
    document.getElementById("botdesigner_emailSection").style.display = "none";
    document.getElementById('cmbBotAfterFinish1').value = "goto:finish";
    document.getElementById('cmbBotAfterFinish2').value = "";
    document.getElementById('cmbBotAfterFinish2').style.display = "none";
    //funcion para borrar todos los elementos del cuerpo dentro del .optionsHolder
    document.getElementById("surveyHolder").innerHTML = "";
    return { result: "info dont found" };
  }
}

document
  .getElementById("chkBotSendInteractionHistory")
  .addEventListener("change", async (e) => {
    if (e.target.checked)
      document.getElementById("botdesigner_emailSection").style.display = "";
    else
      document.getElementById("botdesigner_emailSection").style.display =
        "none";
  });

document
  .getElementById("cmbBotAfterFinish1")
  .addEventListener("change", async (e) => {
    if (e.target.value === "goto:finish") {
      document.getElementById("cmbBotAfterFinish2").style.display = "none";
    } else if (e.target.value === "queuetransfer") {
      let queue = document
        .getElementById("cmbBotChannelsCampaigns")
        .value.split(" ")[0];
      let channel = document
        .getElementById("cmbBotChannelsCampaigns")
        .value.split(" ")[1];
      channel = channel.substring(1, channel.length - 1);

      let queuesForTransfer = await UC_get_async(
        `SELECT name FROM ccdata.${channel}_queues WHERE name NOT IN ('${queue}')`,
        ""
      );
      queuesForTransfer = JSON.parse(queuesForTransfer);

      $(`#cmbBotAfterFinish2`).empty();
      $(`#cmbBotAfterFinish2`).trigger("chosen:updated");
      $(`#cmbBotAfterFinish2`).prepend(
        `<option disabled selected value>Select a campaign</option>`
      );
      queuesForTransfer.map((item) =>
        $(`#cmbBotAfterFinish2`).append(new Option(item.name, item.name))
      );
      $(`#cmbBotAfterFinish2`).trigger("chosen:updated");

      document.getElementById("cmbBotAfterFinish2").style.display = "";
    } else {
      console.log("No se encuentra opcion");
      return { error: "Option doesn't exists" };
    }
  });

document.getElementById("btnBotSave").addEventListener("click", async () => {
  //objeto de guardado:
  let objSave = {};

  //guarado de configuracion del bot:
  objSave.title = document.getElementById("txtBotTitle").value;
  objSave.language = document.getElementById("cmbBotLanguage").value;
  objSave.welcome = document.getElementById("txtBotWelcome").value;
  objSave.msgBeforeFinishInteraction = document.getElementById("txtBotMsgBeforeFinishInteraction").value;
  objSave.msgBeforeTimeOutAction = document.getElementById("txtBotMsgAfterTimeout").value;
  objSave.requiredInfo = document.getElementById("chkBotRequiredInfo").checked ? 1 : 0;
  objSave.sendInteractionHistory = document.getElementById("chkBotSendInteractionHistory").checked ? 1 : 0;
  if( document.getElementById("cmbBotAfterFinish1").value == "goto:finish" || document.getElementById("cmbBotAfterFinish1").value == "goto:next"){
    objSave.afterTimeout = document.getElementById("cmbBotAfterFinish1").value;
  }else{
    objSave.afterTimeout = document.getElementById("cmbBotAfterFinish1").value + ":" + document.getElementById("cmbBotAfterFinish2").value 
  }

  if(document.getElementById("chkBotSendInteractionHistory").checked){
    objSave.emailConfig = "";
    objSave.emailConfig += document.getElementById("cmbBotEmailCampaign").value;
    objSave.emailConfig += "|" + document.getElementById("txtBotEmailTo").value;
    objSave.emailConfig += "|" + document.getElementById("txtBotEmailCC").value;
    }else{
      objSave.emailConfig = "";
    }

  //guardado del array de preguntas:
  let arrQuestions = [];
  let doqui = document.getElementById("surveyHolder");
  for (let i = 0; i < doqui.childElementCount; i++) {
    let tempObj = {};
    tempObj.type = doqui.children[i].querySelector(
      ".selectTypeOfQuestion"
    ).value;
    if (tempObj.type == "multiple") {
      tempObj.message = doqui.children[i].querySelector(
        ".question>.input-element"
      ).value;
      tempObj.question = [];
      tempObj.action = [];
      let options = doqui.children[i].querySelectorAll(".holderRound");
      for (let x = 0; x < options.length; x++) {
        tempObj.question.push(options[x].querySelector(".optioninput").value);
        let tempActionDOM1 = options[x].querySelector(".selectActionOnOption1").value;
        let tempActionDOM2 = options[x].querySelector(".selectActionOnOption2").value;

        if (tempActionDOM1 === "goto:next" || tempActionDOM1 === "goto:finish")
          tempObj.action.push(tempActionDOM1);
        else if (tempActionDOM1 == "queuetransfer" || (tempActionDOM1 == "goto" && !!tempActionDOM2))
          tempObj.action.push(`${tempActionDOM1}:${tempActionDOM2}`);
        else return;
      }
      

    } else {
      tempObj.question = doqui.children[i].querySelector(
        ".question>.input-element"
      ).value;
      let cmb1 = doqui.children[i].querySelector(".cmbQuestionActions1").value;
      let cmb2 = doqui.children[i].querySelector(".cmbQuestionActions2").value;

      if (cmb1 === "goto:next" || cmb1 === "goto:finish") tempObj.action = cmb1;
      else if (cmb1 == "queuetransfer" || (cmb1 == "goto" && !!cmb2))
        tempObj.action = `${cmb1}:${cmb2}`;
      else return;
    }
    arrQuestions.push(tempObj);
  }

  objSave.questions = JSON.stringify(arrQuestions);
  //busco si existe bot
  let queue = document.getElementById('cmbBotChannelsCampaigns').value.split(" ")[0];
  let channel = document.getElementById('cmbBotChannelsCampaigns').value.split(" ")[1];
  channel = channel.substring(1, channel.length - 1);
  let botFound = JSON.parse(
    await UC_get_async(
      `SELECT id FROM CRMLite_bots WHERE campaign = "${queue}" AND channel = "${channel}" LIMIT 1`,
      ""
    )
  );
  ////////
      objSave.channel = channel;
      objSave.campaign = queue;

  if (botFound.length) {
    //debo actualizar
    objSave.id = botFound[0].id; //asigno id;
    let resp = await UC_update_async(
      objSave,
      "CRMLite_bots",
      "id",
      ""
    );
    console.log("update response: " + resp);
    notification('Success','The bot has been updated','fa fa-success', 'success');
  } else {
    //genero este bot como nuevo
    let resp = await UC_Save_async(objSave, "CRMLite_bots", "");
    console.log("saved response: " + resp);
    //actualizo la campaña para agregar el bot
    if(resp=="OK"){
      let actualizoCamp = await UC_update_async({"botName":"CRMLITEBOT", "name": objSave.campaign}, `ccdata.${objSave.channel}_queues`, "name", "");
      console.log('update campaign with bot response: '+ actualizoCamp);
      notification('Success','The bot has been created','fa fa-success', 'success');
    }
  }
  
});

init();
