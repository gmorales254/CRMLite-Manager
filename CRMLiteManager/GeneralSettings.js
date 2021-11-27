//# sourceURL=GeneralSettings.js
import { loadInformation, loadTable } from './Customers.js';
import fieldsAvailable from './env.js';

//VARIABLES -------------------------

var fieldArray = [];
//------------------------- VARIABLES

//FIELD TYPE Available----------------

let fieldsAvailableHTML = "";
fieldsAvailable.map((item) => { fieldsAvailableHTML += `<option value=${item}>${item}</option>` }) //PARSEO INFORMACION A HTML 

//----------------FIELD TYPE Available


//FEATURES SECTION --------------------


async function loadFeatures() {

  let qq = JSON.parse(await UC_get_async(`SELECT * FROM CRMLite_features`, 'Repo'));
  let featuresHTML = "";

  if (!qq) {
    featuresHTML = `
  <span>Don't features to show</span>
  `
  } else {

    qq.map((item) => {
      featuresHTML += `
              <div class="features__container_int">
									<div style="display: flex;align-items: center;flex-direction: row;">
										<div class="features__slide">
                    <input type="checkbox" id="chk_${item.name}" data-featurechk="${item.name}" ${item.active == true && "checked"}>
											<label for="chk_${item.name}"></label>
										</div>
                  <span class="features__slide_description">${item.description}</span>
									</div>
                  
									<div class="input-group" ${item.requiredVal == false && 'style="display:none;"'}>
                  <input type="text" id="feature${item.name}" class="form-control" placeholder="${item.placeholder}" 
                  aria-describedby="val_${item.name}" value="${item.featureVal}" >
										<span class="input-group-addon btn-success" id="val_${item.name}" data-featurespn="${item.name}" style="color: azure;">
								<i class="fa fa-check-circle-o" aria-hidden="true" ></i>
							</span>
									</div>
								</div>
                `
    });



  }

  document.getElementById('featuresToShow').innerHTML = featuresHTML; //renderizamos HTML y luego agregamos los eventos.
  let featuresCheck = document.querySelectorAll("[data-featurechk]");
  featuresCheck.forEach((item, indx) => {

    featuresCheck[indx].addEventListener("click", async (e) => {
      let featureID = featuresCheck[indx].dataset.featurechk;
      let featureInp = document.getElementById(`chk_${featureID}`);
      let respUpdate = await UC_exec_async(`UPDATE CRMLite_features SET active="${featureInp.checked ? 1 : 0}" WHERE name = "${featureID}"`, 'Repo');
      if (respUpdate === "OK") {

        notification(`The feature has been ${featureInp.checked ? "actived" : "disabled"}`, "", "fa fa-success", "success");
        await loadFeatures(); // recargamos el valor desde la base.

      }

    });
  });


  let featuresSpan = document.querySelectorAll("[data-featurespn]");

  featuresSpan.forEach((item, indx) => {

    featuresSpan[indx].addEventListener("click", async (e) => {
      let featureID = featuresSpan[indx].dataset.featurespn;
      let featureInp = document.getElementById(`feature${featureID}`);
      let required = JSON.parse(await UC_get_async(`SELECT requiredVal FROM CRMLite_features WHERE name = "${featureID}"`, "Repo"))[0].requiredVal;
      if (required == true) {
        let respUpdate = await UC_exec_async(`UPDATE CRMLite_features SET featureVal="${featureInp.value}" WHERE name = "${featureID}"`, 'Repo');
        if (respUpdate === "OK") {
          notification("The feature's value has been update", "", "fa fa-success", "success");
          await loadFeatures(); // recargamos el valor desde la base.
        }
      }
    });
  });

}

//------------------- FEATURES SECTION


//DINAMIC FIELDS-----------------------


// ------------------------------------
async function updateFields(){

function enableDragSort(listClass) {
  const sortableLists = document.getElementsByClassName(listClass);
  Array.prototype.map.call(sortableLists, (list) => {enableDragList(list)});
}

function enableDragList(list) {
  Array.prototype.map.call(list.children, (item) => {enableDragItem(item)});
}

function enableDragItem(item) {
  item.setAttribute('draggable', true)
  item.ondrag = handleDrag;
  item.ondragend = handleDrop;
}

function handleDrag(item) {
  const selectedItem = item.target,
        list = selectedItem.parentNode,
        x = event.clientX,
        y = event.clientY;
  
  selectedItem.classList.add('drag-sort-active');
  let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);
  
  if (list === swapItem.parentNode) {
    swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
    list.insertBefore(selectedItem, swapItem);
  }
}

function handleDrop(item) {
  item.target.classList.remove('drag-sort-active');
}

(()=> {enableDragSort('drag-sort-enable')})();

}

//----------------- drag and drop --------------

document.getElementById("bdgNewfile").addEventListener("click", async () => { //AÑADIR UN NUEVO FIELD

  const { value: formValues } = await Swal.fire({
    title: `Add a new field`,
    html:
    `
        <input type="text" id="inpFieldId" class="swal2-input" style="width:220px;" placeholder="* Field ID (unique name)" />
        <input type="text" id="inpFieldName" class="swal2-input" style="width:220px;" placeholder="* Name or description" />
        
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
      `,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText:
    'Save now',
    preConfirm: async () => {
      let objField = {
        fieldId: document.getElementById('inpFieldId').value,
        fieldName: document.getElementById('inpFieldName').value,
        fieldValue: document.getElementById('inpFieldValue').value,
        fieldType: document.getElementById('cmbFieldType').value,
        fieldMaxLength: document.getElementById('inpMaxLenght').value,
        fieldRequired: document.getElementById('chkFieldRequired').checked == true ? 1 : 0,
        fieldActive: document.getElementById('chkFieldActive').checked == true ? 1 : 0
      }
      //confirmo que todos los datos estén bien
      if (!objField.fieldType) objField.fieldType = 'text'; // valor por default
      if (!objField.fieldMaxLength) objField.fieldMaxLength = 0;
      if (objField.fieldType === "select") objField.fieldMaxLength = 0; // control de property MaxLenght
      if (objField.fieldType === "select" && !objField.fieldValue) objField.fieldRequired = false; // si no tenes datos, no podes ser requerido, fallaria al intentar gestionar.
      if (!objField.fieldName || !objField.fieldId) {
        notification('Error', 'You most to fill fields "Name" and "Field ID"', 'fa fa-warning', 'warning');
        return;
      }
      // si pasó todo OK, valido en la base:

      const {fieldId, fieldName, fieldValue, fieldType, fieldMaxLength, fieldRequired, fieldActive} = objField;

      let resp = JSON.parse(await UC_get_async(`SELECT count(*) as 'registrosEncontrados' FROM ccrepo.CRMLite_structure WHERE fieldId = "${fieldId}"`, ''))[0];
      if (resp.registrosEncontrados != 0) {
        notification('Error', 'This Field ID is current in the database', 'fa fa-warning', 'error');
        return;
      } else {

        let qq = await UC_exec_async(`INSERT INTO ccrepo.CRMLite_structure VALUES ("${fieldId}", "${fieldName}", "${fieldType}", 
        "${fieldValue}", ${fieldMaxLength}, ${fieldRequired}, ${fieldActive}, 0)`, "");

        if (qq == "OK") {
          notification('Your field has been save successfully', "", 'fa fa-success', 'success');
        } else {
          notification('Error', 'Problems in the database', 'fa fa-warning', 'error');
          return;
        }

      }

      // Agregamos en el front:
      await loadFields();
      await loadInformation();
      await loadTable();

    }
  });



});


async function loadFields(fields) {

  let fieldStr = "";
  let fieldStrDragSort = "";
  let qq = JSON.parse(await UC_get_async(`SELECT * FROM CRMLite_structure ORDER BY position`, 'Repo'));

  if (qq) {
    fieldArray = [];
    qq.map((item) => {
      fieldArray.push(`${item.fieldId}>${item.name}>${item.fieldValue}>${item.fieldType}>${item.maxLength}>${item.required}>${item.active}`);
    });
  }

  if (fields) { // si pase parametros, parsealos y pushealos, sino, actualizame el array.
    let fieldsParse = fields.split("|");
    fieldsParse.map((item) => { fieldArray.push(item); });//actualizo mi array con elementos nuevos 
  }

  
  fieldArray.map((item, position) => {
    let reparse = item.split(">");
    fieldStr += `<div class="badge-file badge-file-primary">
								<spam>
                  <i data-posicion="${position}" class="closebadge fa fa-window-close"></i>
                  <spam data-fieldsdetail="${position}">${reparse[1]}</a>
								</spam>
							</div>`;
    
  fieldStrDragSort += `<li class="li_drag_sort_fields" data-fieldid="${reparse[0]}">ID: ${reparse[0]} - ${reparse[1]}</li>`
    
  });

  document.getElementById("filediv").innerHTML = fieldStr;
  document.getElementById("drag-sort-fields").innerHTML = fieldStrDragSort;

  await updateBadges(); //actualizo los elementos
  await updateFields(); //Actualizo los elementos.
}

//eliminar un archivo de tipo link y actualizacion de elementos pills
async function updateBadges() {
  let closebadge = document.querySelectorAll(".closebadge");
  let fieldDetails = document.querySelectorAll('spam[data-fieldsdetail]');

  closebadge.forEach(async (val, indx) => {
    closebadge[indx].addEventListener("click", async (e) => {
      let fieldIdTEMP = fieldArray[e.path[0].dataset.posicion].split(">")[0]; //tomo item de array en la posicion X, hago split por ">" y tomo el primer item que es el fieldId 
      await deleteFieldInformation(fieldIdTEMP);
    });

  });

  fieldDetails.forEach(async (val, indx) => {
    fieldDetails[indx].addEventListener("click", async (e) => {
      await changeFieldInformation(Number(e.path[0].dataset.fieldsdetail)) //Convierto y envío index que contiene el dataset ;
    });
  });


}

async function deleteFieldInformation(fieldIdTEMP = "") {

  Swal.fire({
    title: `Do you want to delete ${fieldIdTEMP}?`,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Do it',
    denyButtonText: `Don't delete`,
  }).then(async (result) => {
    if (result.isConfirmed) {
      parent.loaderSetVisible(true);
      let respExc = await UC_exec_async(`DELETE FROM ccrepo.CRMLite_structure WHERE fieldId = "${fieldIdTEMP}"`, ""); // elimino campo 

      if (respExc === "OK") {

        loadFields(); // actualizo array y elementos

        await loadInformation();
        await loadTable();
        
      Swal.fire('Deleted!', 'Field and data has been deleted', 'success');
      } else {

      Swal.fire(`${fieldIdTEMP} field is still on database`, 'this is a required field for CRMLite', 'error');
      }
      
        parent.loaderSetVisible(false);

    } else if (result.isDenied) {
      Swal.fire('Field not deleted', '', 'info');
    }
  })

}

async function changeFieldInformation(fieldPosition) {
  //Tomar los datos de la tabla CRMLite_structure y cargarlos en el front.
  //Hacer un trigger que cuando detecte que se borra un campo, se elimine todo del CRMLite_customersV2


  let fieldToModify = fieldArray[fieldPosition];
  let fieldsParse = fieldToModify.split(">");
  //${fieldId}>${fieldName}>${fieldValue}>${fieldType}>${fieldMaxLength}>${fieldRequired}>${fieldActive}
  let fieldsAvailableHTMLtemp = "";

  fieldsAvailable.map((item) => {
    fieldsAvailableHTMLtemp += `<option value=${item} ${fieldsParse[3] === item ? "selected" : ""}>${item}</option>`
  })

  const { value: formValues } = await Swal.fire({
    title: `Modify a field`,
    html:
    `
        <input type="text" id="inpFieldId" class="swal2-input" style="width:220px;" placeholder="* Field ID (unique name)" value="${fieldsParse[0]}"/>
        <input type="text" id="inpFieldName" class="swal2-input" style="width:220px;" placeholder="* Name or description" value="${fieldsParse[1]}"/>
        
      <select id="cmbFieldType" class="swal2-input" style="width:220px;">
            <option disabled value>Select a type</option>
            ${fieldsAvailableHTMLtemp}
      </select>
      
      </select>
      <input  type="number" id="inpMaxLenght" placeholder="Max lenght" class="swal2-input" style="width:220px;" value="${fieldsParse[4]}">
      
        <input type="text" id="inpFieldValue" class="swal2-input" style="width:220px;" placeholder="Default value (separate by comma if type is 'select')" value="${fieldsParse[2]}"/>
      
<input type="checkbox" id="chkFieldRequired" ${fieldsParse[5] == "true" ? "checked" : ""}/>
      
     <label for="chkFieldRequired" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Required</span>
    </label>

    <input type="checkbox" id="chkFieldActive" ${fieldsParse[6] == "true" ? "checked" : ""}/>
      
     <label for="chkFieldActive" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
        <span class="swal2-label">Active</span>
    </label>
      `,
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText:
    'Modify',
    preConfirm: async () => {
      let objField = {
        fieldId: document.getElementById('inpFieldId').value,
        fieldName: document.getElementById('inpFieldName').value,
        fieldValue: document.getElementById('inpFieldValue').value,
        fieldType: document.getElementById('cmbFieldType').value,
        fieldMaxLength: document.getElementById('inpMaxLenght').value,
        fieldRequired: document.getElementById('chkFieldRequired').checked == true ? 1 : 0,
        fieldActive: document.getElementById('chkFieldActive').checked == true ? 1 : 0
      }
      //confirmo que todos los datos estén bien
      if (!objField.fieldType) objField.fieldType = 'text'; // valor por default
      if (objField.fieldType === "select") objField.fieldMaxLength = 0; // control de property MaxLenght
      if (objField.fieldType === "select" && !objField.fieldValue) objField.fieldRequired = false; // si no tenes datos, no podes ser requerido, fallaria al intentar gestionar.
      if (!objField.fieldName || !objField.fieldId) {
        notification('Error', 'You most to fill fields "Name" and "Field ID"', 'fa fa-warning', 'warning');
        return;
      }
      // si pasó todo OK:
      const {fieldId, fieldName, fieldValue, fieldType, fieldMaxLength, fieldRequired, fieldActive} = objField;
      fieldArray[fieldPosition] = `${fieldId}>${fieldName}>${fieldValue}>${fieldType}>${fieldMaxLength}>${fieldRequired}>${fieldActive}`; //modificado
      await updateFieldInformation(objField);// se modifica en la base
    }
  });


}


async function updateFieldInformation(objField) {
  let resp = JSON.parse(await UC_get_async(`SELECT count(*) as 'registrosEncontrados' FROM ccrepo.CRMLite_structure WHERE fieldId = "${objField.fieldId}"`, ''))[0];
  if (resp.registrosEncontrados == 0) return;
  // Si se encuentra registros:
  let objUpdate = {}

  objUpdate.fieldId = objField.fieldId;
  objUpdate.name = objField.fieldName;
  objUpdate.fieldType = objField.fieldType;
  objUpdate.fieldValue = objField.fieldValue;
  objUpdate.maxLength = objField.fieldMaxLength;
  objUpdate.required = objField.fieldRequired;
  objUpdate.active = objField.fieldActive;

  let exec = await UC_update_async(objUpdate, 'CRMLite_structure', 'fieldId', 'Repo');
  if (exec === "OK") notification("Your field has been updated successfully", "", "fa fa-success", "success");
  else notification("Ups, error in the database", "try again later", "fa fa-warning", "warning");


  await loadFields();

}

loadFields();
loadFeatures();
//-------------DINAMIC FIELDS
