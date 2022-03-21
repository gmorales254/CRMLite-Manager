//# sourceURL=GeneralSettings.js
import { loadInformation, loadTable } from "./Customers.js";
import fieldsAvailable from "./env.js";

//VARIABLES -------------------------

var fieldArray = [];
//------------------------- VARIABLES

//FIELD TYPE Available----------------

let fieldsAvailableHTML = "";
fieldsAvailable.map((item) => {
  fieldsAvailableHTML += `<option value=${item}>${item}</option>`;
}); //PARSEO INFORMACION A HTML

//----------------FIELD TYPE Available

//FEATURES SECTION --------------------

async function loadFeatures() {
  let qq = JSON.parse(
    await UC_get_async(`SELECT * FROM CRMLite_features`, "Repo")
  );
  let featuresHTML = "";

  if (!qq) {
    featuresHTML = `
  <span>Don't features to show</span>
  `;
  } else {
    qq.map((item) => {
      featuresHTML += `
              <div class="features__container_int">
									<div style="display: flex;align-items: center;flex-direction: row;">
										<div class="features__slide">
                    <input type="checkbox" id="chk_${
                      item.name
                    }" data-featurechk="${item.name}" ${
        item.active == true && "checked"
      }>
											<label for="chk_${item.name}"></label>
										</div>
                  <span class="features__slide_description">${
                    item.description
                  }</span>
									</div>
                  
									<div class="input-group" ${
                    item.requiredVal == false && 'style="display:none;"'
                  }>
                  <input type="text" id="feature${
                    item.name
                  }" class="form-control" placeholder="${item.placeholder}" 
                  aria-describedby="val_${item.name}" value="${
        item.featureVal
      }" >
										<span class="input-group-addon btn-success" id="val_${
                      item.name
                    }" data-featurespn="${item.name}" style="color: azure;">
								<i class="fa fa-check-circle-o" aria-hidden="true" ></i>
							</span>
									</div>
								</div>
                `;
    });
  }

  document.getElementById("featuresToShow").innerHTML = featuresHTML; //renderizamos HTML y luego agregamos los eventos.
  let featuresCheck = document.querySelectorAll("[data-featurechk]");
  featuresCheck.forEach((item, indx) => {
    featuresCheck[indx].addEventListener("click", async (e) => {
      let featureID = featuresCheck[indx].dataset.featurechk;
      let featureInp = document.getElementById(`chk_${featureID}`);
      let respUpdate = await UC_exec_async(
        `UPDATE CRMLite_features SET active="${
          featureInp.checked ? 1 : 0
        }" WHERE name = "${featureID}"`,
        "Repo"
      );
      if (respUpdate === "OK") {
        notification(
          `The feature has been ${featureInp.checked ? "actived" : "disabled"}`,
          "",
          "fa fa-success",
          "success"
        );
        await loadFeatures(); // recargamos el valor desde la base.
      }
    });
  });

  let featuresSpan = document.querySelectorAll("[data-featurespn]");

  featuresSpan.forEach((item, indx) => {
    featuresSpan[indx].addEventListener("click", async (e) => {
      let featureID = featuresSpan[indx].dataset.featurespn;
      let featureInp = document.getElementById(`feature${featureID}`);
      let required = JSON.parse(
        await UC_get_async(
          `SELECT requiredVal FROM CRMLite_features WHERE name = "${featureID}"`,
          "Repo"
        )
      )[0].requiredVal;
      if (required == true) {
        let respUpdate = await UC_exec_async(
          `UPDATE CRMLite_features SET featureVal="${featureInp.value}" WHERE name = "${featureID}"`,
          "Repo"
        );
        if (respUpdate === "OK") {
          notification(
            "The feature's value has been update",
            "",
            "fa fa-success",
            "success"
          );
          await loadFeatures(); // recargamos el valor desde la base.
        }
      }
    });
  });
}

//------------------- FEATURES SECTION

//DINAMIC FIELDS-----------------------

// ------------------------------------
async function updateFieldsSortEvent() {
  function enableDragSort(listClass) {
    const sortableLists = document.getElementsByClassName(listClass);
    Array.prototype.map.call(sortableLists, (list) => {
      enableDragList(list);
    });
  }

  function enableDragList(list) {
    Array.prototype.map.call(list.children, (item) => {
      enableDragItem(item);
    });
  }

  function enableDragItem(item) {
    item.setAttribute("draggable", true);
    item.ondrag = handleDrag;
    item.ondragend = handleDrop;
  }

  function handleDrag(item) {
    const selectedItem = item.target,
      list = selectedItem.parentNode,
      x = event.clientX,
      y = event.clientY;

    selectedItem.classList.add("drag-sort-active");
    let swapItem =
      document.elementFromPoint(x, y) === null
        ? selectedItem
        : document.elementFromPoint(x, y);

    if (list === swapItem.parentNode) {
      swapItem =
        swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
      list.insertBefore(selectedItem, swapItem);
      document.getElementById("bdgSavePositions").style.display = "flex";
    }
  }

  function handleDrop(item) {
    item.target.classList.remove("drag-sort-active");
  }

  (() => {
    enableDragSort("drag-sort-enable");
  })();
}

//----------------- drag and drop --------------

//----------------- Save position ------------->

document
  .getElementById("bdgSavePositions")
  .addEventListener("click", async () => {
    parent.loaderSetVisible(true);
    document.getElementById("bdgSavePositions").style.display = "none";
    let fields = document.getElementById("drag-sort-fields").children;
    if (!fields.length) return { error: "no elements to sort" };

    let i = 0;

    let errors = false;
    for (let ele of fields) {
      let respExec = await UC_exec_async(
        `UPDATE CRMLite_structure SET position = ${i} WHERE fieldId = "${ele.dataset.fieldid}"`,
        "Repo"
      );
      if (respExec === "ERROR") errors = true;
      i++;
    }

    parent.loaderSetVisible(false);
    if (!errors) {
      await loadFields(); //cargo campos nuevamente ya actualizados
      await loadInformation(); //cargo informacion del Customers.js tabla
      await loadTable(); // Cargo tabla del Customers.js
      notification(
        "Congratulations",
        "sort the fields has been successfully",
        "fa fa-success",
        "success"
      );
    } else {
      notification(
        "Error in the database",
        "Please try again",
        "fa fa-warning",
        "warning"
      );
    }
  });

//<---------------- Save position -------------

document.getElementById("bdgNewfile").addEventListener("click", async () => {
  //AÑADIR UN NUEVO FIELD

  const { value: formValues } = await Swal.fire({
    title: `Add a new field`,
    didRender: () => {
      loadCampaigns("cmbFieldOptCampaign", "Select a campaign");

      
      document
        .getElementById("chkFieldOptional")
        .addEventListener("click", (e) => {
          if (e.target.checked)
            document.getElementById("optionalfields").style.display = "";
          else document.getElementById("optionalfields").style.display = "none";
        });

      document
        .getElementById("btnFieldAddCampaign")
        .addEventListener("click", (e) => {
          let campaignAndChannel = document.getElementById(
            "cmbFieldOptCampaign"
          ).value;

          if(!campaignAndChannel) return; //

          let campaignsDefined = document.getElementById(
            "cmbFieldSelectedCampaigns"
          ).children;
          let cmbFieldSelectedCampaigns = document.getElementById(
            "cmbFieldSelectedCampaigns"
          );

          let found = false;

          if(campaignsDefined.length){

            for (let i = 0; i < campaignsDefined.length; i++) {
              if (campaignAndChannel === campaignsDefined[i].value) found = true;
            }

          }

          if(found) return; // SI ya tengo una campaña y canal que está existente en los seleccionados, no agrego.
          else cmbFieldSelectedCampaigns.options[cmbFieldSelectedCampaigns.options.length] = new Option(campaignAndChannel, campaignAndChannel)

        });

        document.getElementById('btnFieldDropCampaign').addEventListener('click',e=>{
          //eliminamos elemento seleccionado
          let cmbFieldSelectedCampaigns = document.getElementById('cmbFieldSelectedCampaigns')
          cmbFieldSelectedCampaigns.remove(cmbFieldSelectedCampaigns.selectedIndex)
        });

    },
    html: `
        <input type="text" id="inpFieldId" class="swal2-input" style="width:220px;" placeholder="* Field ID (unique name)" />
        <input type="text" id="inpFieldName" class="swal2-input" style="width:220px;" placeholder="* Name or description" />
        ${
          document.getElementById("chk_RingbaTransfer").checked
            ? `
        <input type="text" id="inpRingbatag" class="swal2-input" style="width:220px;" placeholder="Tag for ringba transfer"/>
        `
            : ""
        }
      <select id="cmbFieldType" class="swal2-input" style="width:220px;">
            <option disabled selected value>Select a type</option>
            ${fieldsAvailableHTML}
      </select>
      
      </select>
      <input  type="number" id="inpMaxLenght" placeholder="Max lenght" class="swal2-input" style="width:220px;">
      
        <input type="text" id="inpFieldValue" class="swal2-input" style="width:220px;" placeholder="Default value (separate by comma if type is 'select')" />
      
       <input type="checkbox" id="chkFieldRequired" />
      
     <label for="chkFieldRequired" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Required</span>
    </label>

     <input type="checkbox" id="chkFieldActive" />
      
     <label for="chkFieldActive" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Active</span>
    </label>

    <input type="checkbox" id="chkFieldOptional">
    <label for="chkFieldOptional" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Optional</span>
    </label>
    
    <div id="optionalfields" style="display:none;">
    <select id="cmbFieldOptCampaign" class="swal2-input" style="width:220px;">
            
      </select>
    <button type="button" id="btnFieldAddCampaign" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;width: 70%;background-color: green;">Add campaign</button>
     
     <select id="cmbFieldSelectedCampaigns" class="swal2-input" style="width:220px;" size="5">
            
     </select>

    <button type="button" id="btnFieldDropCampaign" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;width: 70%;background-color: goldenrod;">Drop campaign</button>
    </div>
      `,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: "Save now",
    preConfirm: async () => {
      let ArrFieldOptCampaign = () =>{
        let cmbFieldSelectedCampaigns = document.getElementById(
          "cmbFieldSelectedCampaigns"
        );
        
        if (cmbFieldSelectedCampaigns.options.length === 0) return '[]';
        else{
          let campaignsDefined = document.getElementById(
            "cmbFieldSelectedCampaigns"
          ).children;
          
          let values = [];
          for (let i = 0; i < campaignsDefined.length; i++) {
            values.push(campaignsDefined[i].value)
          }

          values = JSON.stringify(values);
          return values;

        }

          
      }


      let objField = {
        fieldId: document.getElementById("inpFieldId").value,
        fieldName: document.getElementById("inpFieldName").value,
        ringbatag: document.getElementById("chk_RingbaTransfer").checked ? document.getElementById("inpRingbatag").value : "",
        fieldValue: document.getElementById("inpFieldValue").value,
        fieldType: document.getElementById("cmbFieldType").value,
        fieldMaxLength: document.getElementById("inpMaxLenght").value,
        fieldRequired:
          document.getElementById("chkFieldRequired").checked == true ? 1 : 0,
        fieldActive:
          document.getElementById("chkFieldActive").checked == true ? 1 : 0,
        optional: document.getElementById('chkFieldOptional').checked == true ? 1 : 0,
        optCamps: ArrFieldOptCampaign()
      };
      //confirmo que todos los datos estén bien
      if (!objField.fieldType) objField.fieldType = "text"; // valor por default
      if (!objField.fieldMaxLength) objField.fieldMaxLength = 0;
      if (objField.fieldType === "select") objField.fieldMaxLength = 0; // control de property MaxLenght
      if (objField.fieldType === "select" && !objField.fieldValue)
        objField.fieldRequired = false; // si no tenes datos, no podes ser requerido, fallaria al intentar gestionar.
      if (!objField.fieldName || !objField.fieldId) {
        notification(
          "Error",
          'You most to fill fields "Name" and "Field ID"',
          "fa fa-warning",
          "warning"
        );
        return;
      }
      // si pasó todo OK, valido en la base:

      const {
        fieldId,
        fieldName,
        fieldValue,
        fieldType,
        fieldMaxLength,
        fieldRequired,
        fieldActive,
        ringbatag,
        optional,
        optCamps
      } = objField;

      let resp = JSON.parse(
        await UC_get_async(
          `SELECT count(*) as 'registrosEncontrados' FROM ccrepo.CRMLite_structure WHERE fieldId = "${fieldId}"`,
          ""
        )
      )[0];
      if (resp.registrosEncontrados != 0) {
        notification(
          "Error",
          "This Field ID is current in the database",
          "fa fa-warning",
          "error"
        );
        return;
      } else {
        let lastPosition = JSON.parse(
          await UC_get_async(
            `SELECT position FROM ccrepo.CRMLite_structure ORDER BY position DESC LIMIT 1`,
            ""
          )
        )[0].position;
        let qq = await UC_exec_async(
          `INSERT INTO ccrepo.CRMLite_structure (fieldId, name, fieldType, fieldValue, maxLength, required, active, position, ringbatag, optional, optCamps) VALUES ("${fieldId}", "${fieldName}", "${fieldType}", 
        "${fieldValue}", ${fieldMaxLength}, ${fieldRequired}, ${fieldActive}, ${
            lastPosition + 1
          }, "${ringbatag}", ${optional}, '${optCamps}')`,
          ""
        );


        if (qq == "OK") {
          notification(
            "Your field has been save successfully",
            "",
            "fa fa-success",
            "success"
          );
        } else {
          notification(
            "Error",
            "Problems in the database",
            "fa fa-error",
            "warning"
          );
          return;
        }
      }

      // Agregamos en el front:
      await loadFields();
      await loadInformation();
      await loadTable();
    },
  });
});

async function loadFields(fields) {
  let fieldStr = "";
  let fieldStrDragSort = "";
  let qq = JSON.parse(
    await UC_get_async(
      `SELECT * FROM CRMLite_structure ORDER BY position`,
      "Repo"
    )
  );

  if (qq) {
    fieldArray = [];
    qq.map((item) => {
      fieldArray.push(
        `${item.fieldId}>${item.name}>${item.fieldValue}>${item.fieldType}>${item.maxLength}>${item.required}>${item.active}`
      );
    });
  }

  if (fields) {
    // si pase parametros, parsealos y pushealos, sino, actualizame el array.
    let fieldsParse = fields.split("|");
    fieldsParse.map((item) => {
      fieldArray.push(item);
    }); //actualizo mi array con elementos nuevos
  }

  fieldArray.map((item, position) => {
    let reparse = item.split(">");

    fieldStrDragSort += `<li class="li_drag_sort_fields" data-fieldid="${reparse[0]}">
    <i data-fieldid="${reparse[0]}" class="closebadge fa fa-window-close"></i>
    <i data-fieldid="${reparse[0]}" class="editbadge fa fa-pencil-square-o"></i>  
    ID: ${reparse[0]} - Detail: ${reparse[1]}
    </li>`;
  });

  document.getElementById("drag-sort-fields").innerHTML = fieldStrDragSort;

  await updateBadges(); //actualizo los elementos
  await updateFieldsSortEvent(); //Actualizo los elementos para que tengan sort.
}

//eliminar un archivo de tipo link y actualizacion de elementos pills
async function updateBadges() {
  let closebadge = document.querySelectorAll(".closebadge");
  let fieldDetails = document.querySelectorAll(".editbadge");

  closebadge.forEach(async (val, indx) => {
    closebadge[indx].addEventListener("click", async (e) => {
      await deleteFieldInformation(e.currentTarget.dataset.fieldid);
    });
  });

  fieldDetails.forEach(async (val, indx) => {
    fieldDetails[indx].addEventListener("click", async (e) => {
      await changeFieldInformation(e.currentTarget.dataset.fieldid);
    });
  });
}

async function deleteFieldInformation(fieldIdTEMP = "") {
  let position = JSON.parse(
    await UC_get_async(
      `SELECT position FROM CRMLite_structure WHERE fieldId = "${fieldIdTEMP}" LIMIT 1`
    )
  )[0].position;
  Swal.fire({
    title: `Do you want to delete "${fieldIdTEMP}"?`,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Do it",
    denyButtonText: `Don't delete`,
  }).then(async (result) => {
    if (result.isConfirmed) {
      parent.loaderSetVisible(true);
      let respExc = await UC_exec_async(
        `DELETE FROM ccrepo.CRMLite_structure WHERE fieldId = "${fieldIdTEMP}"`,
        ""
      ); // elimino campo

      if (respExc === "OK") {
        await UC_exec_async(
          `UPDATE CRMLite_structure crm SET crm.position = (crm.position - 1) WHERE crm.position > ${position}`,
          "Repo"
        );
        await loadFields(); // actualizo array y elementos
        await loadInformation();
        await loadTable();

        Swal.fire("Deleted!", "Field and data has been deleted", "success");
      } else {
        Swal.fire(
          `${fieldIdTEMP} field is still on database`,
          "this is a required field for CRMLite",
          "error"
        );
      }

      parent.loaderSetVisible(false);
    } else if (result.isDenied) {
      Swal.fire("Field not deleted", "", "info");
    }
  });
}

async function loadCampaigns(inputName = "", defaultOpt = "") {
  let campaigns = [];
  //telefonia
  let channelCall = JSON.parse(
    await UC_get_async(`SELECT name FROM ccdata.queues group by name`, "")
  );
  if (channelCall.length)
    channelCall.map((item) => campaigns.push(`${item.name}:telephony`));
  //email
  let channelEmail = JSON.parse(
    await UC_get_async(
      `SELECT name FROM ccdata.email_members group by name`,
      ""
    )
  );
  if (channelEmail.length)
    channelEmail.map((item) => campaigns.push(`${item.name}:email`));
  //messenger
  let channelMessenger = JSON.parse(
    await UC_get_async(
      `SELECT name FROM ccdata.messenger_members group by name`,
      ""
    )
  );
  if (channelMessenger.length)
    channelMessenger.map((item) => campaigns.push(`${item.name}:messenger`));
  //sms
  let channelSms = JSON.parse(
    await UC_get_async(`SELECT name FROM ccdata.sms_members group by name`, "")
  );
  if (channelSms.length)
    channelSms.map((item) => campaigns.push(`${item.name}:sms`));
  //Webchat
  let channelWeb = JSON.parse(
    await UC_get_async(
      `SELECT name FROM ccdata.webchat_members group by name`,
      ""
    )
  );
  if (channelWeb.length)
    channelWeb.map((item) => campaigns.push(`${item.name}:webchat`));

  //cargo los datos recogidos:
  $(`#${inputName}`).empty();
  $(`#${inputName}`).trigger("chosen:updated");
  $(`#${inputName}`).prepend(
    `<option disabled selected value>${defaultOpt}</option>`
  );
  campaigns.map((item) => $(`#${inputName}`).append(new Option(item, item)));
  $(`#${inputName}`).trigger("chosen:updated");
}

async function changeFieldInformation(fieldId) {
  let resp = JSON.parse(
    await UC_get_async(
      `SELECT * FROM CRMLite_structure WHERE fieldId = "${fieldId}"`
    )
  )[0];

  let fieldsAvailableHTMLtemp = "";

  fieldsAvailable.map((item) => {
    fieldsAvailableHTMLtemp += `<option value=${item} ${
      resp.fieldType === item ? "selected" : ""
    }>${item}</option>`;
  });

  const { value: formValues } = await Swal.fire({
    title: `Modify a field`,
    didRender: () => {
      loadCampaigns("cmbFieldOptCampaign", "Select a campaign");

      if (document.getElementById("chkFieldOptional").checked) document.getElementById("optionalfields").style.display = "";
      else document.getElementById("optionalfields").style.display = "none";

      document
        .getElementById("chkFieldOptional")
        .addEventListener("click", (e) => {
          if (e.target.checked)
            document.getElementById("optionalfields").style.display = "";
          else document.getElementById("optionalfields").style.display = "none";
        });

      document
        .getElementById("btnFieldAddCampaign")
        .addEventListener("click", (e) => {
          let campaignAndChannel = document.getElementById(
            "cmbFieldOptCampaign"
          ).value;

          if(!campaignAndChannel) return; //

          let campaignsDefined = document.getElementById(
            "cmbFieldSelectedCampaigns"
          ).children;
          let cmbFieldSelectedCampaigns = document.getElementById(
            "cmbFieldSelectedCampaigns"
          );

          let found = false;

          if(campaignsDefined.length){

            for (let i = 0; i < campaignsDefined.length; i++) {
              if (campaignAndChannel === campaignsDefined[i].value) found = true;
            }

          }

          if(found) return; // SI ya tengo una campaña y canal que está existente en los seleccionados, no agrego.
          else cmbFieldSelectedCampaigns.options[cmbFieldSelectedCampaigns.options.length] = new Option(campaignAndChannel, campaignAndChannel)

        });

        document.getElementById('btnFieldDropCampaign').addEventListener('click',e=>{
          //eliminamos elemento seleccionado
          let cmbFieldSelectedCampaigns = document.getElementById('cmbFieldSelectedCampaigns')
          cmbFieldSelectedCampaigns.remove(cmbFieldSelectedCampaigns.selectedIndex)
        });

        if((resp.optional == "true" || resp.optional == 1) && (resp.optCamps != "[]" && resp.optCamps)){
          
          let optCamps = JSON.parse(resp.optCamps);
          let optCampsHTML = '';
          optCamps.map(item=>{
            optCampsHTML += `<option value="${item}">${item}</option>`
          });

          document.getElementById("cmbFieldSelectedCampaigns").innerHTML = optCampsHTML;
  
        }
        

    },
    html: `
        <input type="text" id="inpFieldId" class="swal2-input" style="width:220px;" placeholder="* Field ID (unique name)" disabled value="${
          resp.fieldId
        }"/>
        <input type="text" id="inpFieldName" class="swal2-input" style="width:220px;" placeholder="* Name or description" value="${
          resp.name
        }"/>
        ${
          document.getElementById("chk_RingbaTransfer").checked
            ? `
        <input type="text" id="inpRingbatag" class="swal2-input" style="width:220px;" placeholder="Tag for ringba transfer" value="${resp.ringbatag}"/>
        `
            : ""
        }
      <select id="cmbFieldType" class="swal2-input" style="width:220px;">
            <option disabled value>Select a type</option>
            ${fieldsAvailableHTMLtemp}
      </select>
      
      </select>
      <input  type="number" id="inpMaxLenght" placeholder="Max lenght" class="swal2-input" style="width:220px;" value="${
        resp.maxLength
      }">
      
        <input type="text" id="inpFieldValue" class="swal2-input" style="width:220px;" placeholder="Default value (separate by comma if type is 'select')" value="${
          resp.fieldValue
        }"/>
      
<input type="checkbox" id="chkFieldRequired" ${
      resp.required == "true" || resp.required == 1 ? "checked" : ""
    }/>
      
     <label for="chkFieldRequired" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Required</span>
    </label>

    <input type="checkbox" id="chkFieldActive" ${
      resp.active == "true" || resp.active == 1 ? "checked" : ""
    }/>
      
     <label for="chkFieldActive" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Active</span>
    </label>
    <input type="checkbox" id="chkFieldOptional" ${resp.optional == "true" || resp.optional == 1 ? "checked" : ""}>
    <label for="chkFieldOptional" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Optional</span>
    </label>
    
    <div id="optionalfields" style="display:none;">
    <select id="cmbFieldOptCampaign" class="swal2-input" style="width:220px;">
            
      </select>
    <button type="button" id="btnFieldAddCampaign" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;width: 70%;background-color: green;">Add campaign</button>
     
     <select id="cmbFieldSelectedCampaigns" class="swal2-input" style="width:220px;" size="5">
            
     </select>

    <button type="button" id="btnFieldDropCampaign" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;width: 70%;background-color: goldenrod;">Drop campaign</button>
    </div>
      
      
      `,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: "Modify",
    preConfirm: async () => {

      
      let ArrFieldOptCampaign = () =>{
        let cmbFieldSelectedCampaigns = document.getElementById(
          "cmbFieldSelectedCampaigns"
        );
        
        if (cmbFieldSelectedCampaigns.options.length === 0) return '[]';
        else{
          let campaignsDefined = document.getElementById(
            "cmbFieldSelectedCampaigns"
          ).children;
          
          let values = [];
          for (let i = 0; i < campaignsDefined.length; i++) {
            values.push(campaignsDefined[i].value)
          }

          values = JSON.stringify(values);
          return values;

        }

          
      }

      let objField = {
        fieldId: document.getElementById("inpFieldId").value,
        fieldName: document.getElementById("inpFieldName").value,
        fieldValue: document.getElementById("inpFieldValue").value,
        fieldType: document.getElementById("cmbFieldType").value,
        fieldMaxLength: document.getElementById("inpMaxLenght").value,
        ringbatag: document.getElementById("chk_RingbaTransfer").checked ? document.getElementById("inpRingbatag").value : "",
        fieldRequired:
          document.getElementById("chkFieldRequired").checked == true ? 1 : 0,
        fieldActive:
          document.getElementById("chkFieldActive").checked == true ? 1 : 0,
        optional: document.getElementById('chkFieldOptional').checked == true ? 1 : 0,
        optCamps: ArrFieldOptCampaign()
      };
      //confirmo que todos los datos estén bien
      if (!objField.fieldType) objField.fieldType = "text"; // valor por default
      if (objField.fieldType === "select") objField.fieldMaxLength = 0; // control de property MaxLenght
      if (objField.fieldType === "select" && !objField.fieldValue)
        objField.fieldRequired = false; // si no tenes datos, no podes ser requerido, fallaria al intentar gestionar.
      if (!objField.fieldName || !objField.fieldId) {
        notification(
          "Error",
          'You most to fill fields "Name" and "Field ID"',
          "fa fa-warning",
          "warning"
        );
        return;
      }
      
      // si pasó todo OK:

      await updateFieldInformation(objField); // se modifica en la base
    },
  });
}

async function updateFieldInformation(objField) {
  let resp = JSON.parse(
    await UC_get_async(
      `SELECT count(*) as 'registrosEncontrados' FROM ccrepo.CRMLite_structure WHERE fieldId = "${objField.fieldId}"`,
      ""
    )
  )[0];
  if (resp.registrosEncontrados == 0) return;
  // Si se encuentra registros:
  let objUpdate = {};

  objUpdate.fieldId = objField.fieldId;
  objUpdate.name = objField.fieldName;
  objUpdate.fieldType = objField.fieldType;
  objUpdate.fieldValue = objField.fieldValue;
  objUpdate.maxLength = objField.fieldMaxLength;
  objUpdate.required = objField.fieldRequired;
  objUpdate.active = objField.fieldActive;
  objUpdate.ringbatag = objField.ringbatag;
  objUpdate.optional = objField.optional;
  objUpdate.optCamps = objField.optCamps;

  let exec = await UC_update_async(
    objUpdate,
    "CRMLite_structure",
    "fieldId",
    "Repo"
  );
  if (exec === "OK")
    notification(
      "Your field has been updated successfully",
      "",
      "fa fa-success",
      "success"
    );
  else
    notification(
      "Ups, error in the database",
      "try again later",
      "fa fa-warning",
      "warning"
    );

  await loadFields();
}

loadFields();
loadFeatures();
//-------------DINAMIC FIELDS
