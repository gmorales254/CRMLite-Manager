//# sourceURL=Customers.js
import { paginate } from './Pagination.js';

//Variables ---------------


var arrHeaders = [];
var arrItems = [];


//--------------- Variables


// Customer table --------
export async function loadInformation() {
	let objInfo = new Object;
	let headers = [];
	let content = [];


	headers = JSON.parse(await UC_get_async("SELECT fieldId, fieldType FROM CRMLite_structure ORDER BY position", "Repo"));
	if (!headers) return { error: "nothing to load" }

	let jsonQuery = "";
	let headerIndexEnd = headers.length - 1; //para saber el numero del ultimo indice.

	headers.map((item, indx) => {
		jsonQuery += `information->>"$.${item.fieldId}" as "${item.fieldId}"`;
		jsonQuery += headerIndexEnd == indx ? '' : ','; //si no sos el ultimo, te pongo coma.
	});

	content = JSON.parse(await UC_get_async(`SELECT id, name, phone, email, ${jsonQuery}, files, active, agent, created, updated FROM CRMLite_customersV2`, "Repo"));
	if (!content) return { error: "nothing to load" };
	console.log(content);

	arrHeaders = headers;
	arrItems = content;

	objInfo.arrHeaders = headers;
	objInfo.arrItems = content;

	return objInfo;
}

export async function loadTable(page = 1) {

	// -- Headers -->
	let headersHTML = "";

	//seteo todos los fields dinamicos-->
	arrHeaders.map((item) => {
		headersHTML += `<th>${item.fieldId}</th>`;
	});
	//<-- seteo todos los fields dinamicos

	document.getElementById('customers_table_head').innerHTML = `
	<tr>
		<th>id</th>
		${headersHTML}
		<th>active</th>
		<th>agent</th>
		<th>created</th>
		<th>updated</th>
	</tr>
		`
	// <-- Headers --
	// --- Pagination -->

	let paginationResp = paginate(arrItems.length, page); //( cantidad de registros, pagina actual, cantidad maximo de paginas a mostrar, cantidad maximo de paginas en ul )

	// <--- Pagination --
	// -- Body -->
	let itemsHTML = "";

	for (let i = paginationResp.startIndex; i <= paginationResp.endIndex; i++) { //por row desde el startIndex hasta el endIndex de paginate

		let contentTemp = "";
		contentTemp += `<td>${arrItems[i]['id']}</td>`;
		arrHeaders.map((item) => {
			let itemName = arrItems[i][item.fieldId];
			contentTemp += `<td>${itemName ? itemName : ""}</td>`;
		});

		contentTemp += `
	<td>${arrItems[i]['active']}</td>
	<td>${arrItems[i]['agent']}</td>
	<td>${arrItems[i]['created']}</td>
	<td>${arrItems[i]['updated']}</td>
	`;

		itemsHTML += `
			<tr>
				${contentTemp}
			</tr>
			`
	}

	document.getElementById('customers_table_body').innerHTML = itemsHTML;


	let cellsCount = document.getElementById('customers_table_head');
	cellsCount = cellsCount.cells.length; // tomo las cantidad de celdas para darle un tamaño a mi tabla (160px x celda aprox)

	document.getElementById('customers_table').style.width = `${cellsCount * 160}` //cantindad de celdas x 160px
	// <-- Body --

	// --- Pagination -->

	let paginationHTML = "";

	if (paginationResp.pages.length > 10) paginationResp.pages.slice(10 - paginationResp.pages)

	paginationResp.pages.map((element) => {
		paginationHTML += `<li><a href="#">${element}</a></li>`
	})

	document.getElementById('customers_table_pagination').innerHTML = `
						<nav aria-label="Page navigation">
							<ul id="customers_table_pagination_ul" class="pagination">
								${paginationHTML}
							</ul>
						</nav>
`

	document.getElementById('customers_table_pagination_ul').addEventListener('click', (e) => {
		loadTable(e.target.innerText); // recargo la información de la siguiente página.
	});


	// <-- Pagination ---
}

// ----------- Upload base -->

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
	const dropZoneElement = inputElement.closest(".drop-zone");

	inputElement.addEventListener("change", (e) => {
		if (inputElement.files.length) {
			updateThumbnail(dropZoneElement, inputElement.files[0]);
		}
	});

	dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropZoneElement.classList.add("drop-zone--over");
	});

	["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
			dropZoneElement.classList.remove("drop-zone--over");
		});
	});

	dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();

		if (e.dataTransfer.files.length) {
			inputElement.files = e.dataTransfer.files;
			updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
		}

		dropZoneElement.classList.remove("drop-zone--over");
	});
});


function updateThumbnail(dropZoneElement, file) {
	let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

	// First time - remove the prompt
	if (dropZoneElement.querySelector(".drop-zone__prompt")) {
		dropZoneElement.querySelector(".drop-zone__prompt").remove();
	}

	// First time - there is no thumbnail element, so lets create it
	if (!thumbnailElement) {
		thumbnailElement = document.createElement("div");
		thumbnailElement.classList.add("drop-zone__thumb");
		dropZoneElement.appendChild(thumbnailElement);
	}

	thumbnailElement.dataset.label = file.name;

	// Show thumbnail for image files
	if (file.type.startsWith("image/")) {
		const reader = new FileReader();

		reader.readAsDataURL(file);
		reader.onload = () => {
			thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
		};
	} else {
		thumbnailElement.style.backgroundImage = null;
	}
}


document.getElementById('btnUploadBase').addEventListener('click', async () => {


	let dialerSelected = "";
	let dialerList = await UC_get_async('SELECT campaign FROM ccdata.dialer', '');
	dialerList = JSON.parse(dialerList);
	let objDialers = {};
	dialerList.map(element => {
		objDialers[element.campaign] = element.campaign;
	});

	const {value: bulkopt } = await Swal.fire({
		title: 'Select an option',
		input: 'radio',
		inputOptions: {
			"customer": "Bulk a customers",
			"dialer": "New dialer base"
		},
		inputValidator: (value) => {
			if (!value) {
				return 'You need to choose something!'
			}
		}
	})

	if (bulkopt === "dialer") {

		const { value: dialeropt } = await Swal.fire({
			title: 'Dialers to insert a dialerbase',
			input: 'select',
			inputOptions: objDialers,
			inputPlaceholder: 'Select a dialer',
			showCancelButton: true,
			inputValidator: (value) => {
				return new Promise((resolve) => {
					if (!value) {
						resolve('You need to select something');
					} else {
						resolve();
					}
				})
			}
		})

		if (!dialeropt) {
			
			parent.loaderSetVisible(false);
			return; //cancelo subida por falta de marcador.
		} else {
			dialerSelected = dialeropt;
		}
	}


	Papa.parse(document.getElementById('inpUploadBase').files[0], {
		download: true,
		header: true,
		complete: async (results) => {
			if (bulkopt === "customer") {

				parent.loaderSetVisible(true);
				let upload = await uploadNewCustomers(results);

				parent.loaderSetVisible(false);
				if (upload === "ERROR") return;
			}
			else {

				document.getElementById('inpUploadBase').files[0]

				let validarNombre = /^([a-zA-Z0-9_-]*)$/g;
				let fileName = document.getElementById('inpUploadBase').files[0].name
				if (fileName.substr(fileName.length - 3) !== "csv") {
					parent.notificate("", "This is not a CSV file", "danger", ".");
					return;
				}
				fileName = fileName.split('.csv')[0];
				fileName = fileName.replace(/[.*+?^/ /${}()\-|[\]\\]/g, '');
				if (fileName.length > 54) { //tomo 54 ya que cuento el .csv, máximo son 50 caracteres
					parent.notificate("DIALERNAMELENGTHERROR", null, "danger");
				} else if (!(validarNombre.test(fileName)) == true) {
					parent.notificate("DIALERFILEBADCHARS", null, "danger");
				} else if (fileName.startsWith('R')) {
					parent.notificate("DIALERFILESTARTR", null, "danger");
				} else {

					parent.loaderSetVisible(true);
					let uploadresp = await uploadNewCustomers(results);
					if (uploadresp !== "ERROR") {
						await uploadNewDialerBase(dialerSelected, results.data, results.errors, fileName);
					}

					parent.loaderSetVisible(false);

				}

			}
		}
	});
});

async function uploadNewDialerBase(dialer, data, errors, fileName) {

	data = await validateNewCustomers(data, errors);

	if (!data.length) {

		return { error: "no data" }

	}

	let dataFormated = "";
	data.map((element) => {
		//campaign;destination;parandvals;alternatives;priority;agent
		dataFormated += `${dialer};`; //campaign
		dataFormated += `${element.phone};`; //destination

		/*dataFormated += Object.keys(element).map(function (key) {

		return key + "=" + element[key].replace(/#/g, '').replace(/:/g, '').replace(/=/g, '').replace(/'/g, ''); // reemplazo #:=' por caracter vacio

		}).join(":") + ";"; //parandvals  YA NO AGREGAMOS DATOS AL PAR AND VALUES, DIRECTAMENTE VAN EN CUSTOMERSV2 */

		dataFormated += ";;"; //alternatives 
		dataFormated += "9999;"; //priority
		dataFormated += `\n`; // agent

	});

	dataFormated = btoa(dataFormated); //pasamos la base a B64

	ajaxUploadBase(dataFormated, dialer, fileName ? fileName : "CRMLite", data.length); //subo base;
	notification('Success', "The process has been finalize", "fa fa-success", 'success');

}

async function validateNewCustomers(data, errors) {
	let errorFound = false;

	try {

		let arrErrors = [["Error detail", "Row", "Data parsed"]];

		if (errors.length) {
			errors.map((item) => {
				errorFound = true;
				data[item.row].errors = true;
				arrErrors.push([`${item.message}`, `${item.row + 2 /*+2 para tomar en cuenta el header */}`, `${JSON.stringify(data[item.row])}`]);

			});
		}


		data.map((item, indx) => {

			if (!item['phone']) {
				errorFound = true;
				data[indx].errors = true;
				arrErrors.push(["Important data in row is missing", `${indx + 1 /*+1 para tomar en cuenta el header */}`, 'Empty phone']);
			}

		});

		data = data.filter(function (item) {
			return item.errors !== true;
		});


		if (errorFound) {

			let csvContent = "data:text/csv;charset=utf-8," + arrErrors.map((e, i, a) => a[i].join(",")).join("\n");

			let encodedUri = encodeURI(csvContent);
			let link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", "upload_customers_base_errors.csv");
			document.body.appendChild(link); // Required for FF
			link.click(); // Va a descargar el archivo que contiene errores llamado "upload_customers_base_errors.csv". 

		}

	} catch (e) {
		notification('Error in file structure', '', 'fa fa-warning', 'warning');
		return "ERROR";
	}

	return data;

}

async function uploadNewCustomers(result) {

	let {data, errors = [], meta} = result;

	data = await validateNewCustomers(data, errors);
	if (data === "ERROR") {
		return "ERROR";
	}
	//empezar subida si tengo datos buenos:
	let dataTemp = [];
	let fecha = moment().format('YYYY-MM-DD HH:mm:ss');
	if (data.length) {
		//formateo el archivo para la subida.

		data.forEach((element) => {
			let objTemp = {};

			arrHeaders.map((item) => {
				if (item.fieldId !== "phone" && item.fieldId !== "name" && item.fieldId !== "email" && element[item.fieldId]) {

					let elementVal = element[item.fieldId].replace(/[*+?^{}\-|[\]\\]/g, '');
					objTemp[item.fieldId.trim()] = elementVal ? elementVal : "";

				}
			});
			let phone = element.phone.replace(/[.*+?^/ /${}()\-|[\]\\]/g, '');
			let name = element.name.replace(/[.*+?^${}()\-|[\]\\]/g, '');
			let email = element.email.replace(/[*+?^/ /${}()\|[\]\\]/g, '');
			email = email == undefined ? '' : email;
			name = name == undefined ? '' : name; 

			dataTemp.push({
				name: `'${name}'`, phone: `'${phone}'`, email: `'${email}'`,
				information: `'${JSON.stringify(objTemp)}'`, active: '1', agent: `'${parent.agent.accountcode}'`,
				created: `'${fecha}'`
			}) //objeto con  fields para la base

		});


		let respBulk = await UC_BulkUploadFromArrObj(dataTemp, 'CRMLite_customersV2', 'ccrepo');
		if (respBulk === "OK") {
			notification('Success', 'Your new base has been saved', 'fa fa-success', 'success');
			await loadInformation();
			await loadTable();
		} else {
			notification('Error in action performed', 'check your base please', 'fa fa-error', 'warning');
		}

	}

}

async function UC_BulkUploadFromArrObj(arrObj = [{}], table = "", dsn = "ccrepo") {

	let headers = '';
	let Values = '';
	let queryExec = `INSERT INTO ${dsn}.${table} `;

	headers += "(" + Object.keys(arrObj[0]).map((key) => { return key }).join(",") + ")"; //recorro para tomar headers

	for (let i = 0; i < arrObj.length; i++) {

		Values += "(" + Object.keys(arrObj[i]).map(function (key) {
			return arrObj[i][key];
		}).join(",") + `),`;

	}

	//QUITAR ULTIMA COMA


	queryExec += `${headers} VALUES ${Values}` //EJEMPLO: (exp1, exp2, exp3) VALUES ('1', '2', '3'), ('1', '2', '3')
	queryExec = queryExec.replace(/.$/, ' as a ON DUPLICATE KEY UPDATE information = a.information;'); // Reemplazo el último caracter por "ON DUPLICATE KEY UPDATE;"

	let resp = await UC_exec_async(queryExec, '');
	return resp;
}



document.getElementById('btnDownloadExample').addEventListener('click', async () => {
	await downloadExample();

})



async function downloadExample() {
	let arrExamples = [];
	let fields
	try {
		fields = await UC_get_async('SELECT * FROM CRMLite_structure', 'Repo');
		fields = JSON.parse(fields);

	} catch (e) {
		notification('Sorry', 'We dont found fields or we have some issues', 'fa fa-warning', 'info');
		return;
	}

	//preparo cabezera >>>
	let arrExamplesHead = [];
	let arrExamplesContent = [];

	fields.map((field) => {
		arrExamplesHead.push(field.fieldId); //Cabecera del archivo de ejemplos

		let returnEx;
		switch (field.fieldType) { //ejemplos para cada tipo de dato // TODO > Agregar ejemplos con  valores en caso SELECT 
			case "name": returnEx = "John Doe"; break;
			case "phone": returnEx = 7863036228; break;
			case "timestamp": returnEx = moment().format('YYYY-MM-DDTHH:mm'); break;
			case "email": returnEx = "support@cleverideas.com.mx"; break;
			case "checkbox": returnEx = "true"; break;
			case "boolean": returnEx = 1; break;
			case "select": returnEx = "()"; break;
			case "number": returnEx = 123; break;
			case "text": returnEx = "Just text"; break;
			default: returnEx = ""; break;
		}

		arrExamplesContent.push(returnEx); // Ejemplo respectivo al tipo de cabecera retornado

	}); //Todos los campos se van a un solo array
	arrExamples.push(arrExamplesHead); //agrego array de campos como cabezera
	arrExamples.push(arrExamplesContent); //agrego array de campos como contenido
	// <<< preparo cabezera y conteniod


	let csvContent = "data:text/csv;charset=utf-8," + arrExamples.map((e, i, a) => a[i].join(",")).join("\n");

	let encodedUri = encodeURI(csvContent);
	let link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "bulk_customers_example.csv");
	document.body.appendChild(link); // Required for FF
	link.click(); // Va a descargar el archivo que contiene los ejemplos de los campos "bulk_customers_example.csv". 

}

// <------- upload base ---------------


// --------- table options ------------

document.getElementById('btnRefreshTableCustomers').addEventListener('click', async () => {

	await loadInformation();
	await loadTable();
});

document.getElementById('btnDeleteCustomers').addEventListener('click', async () => {
	// importante: funcion que eliminara todos los datos del cliente.
	Swal.fire({
		title: `Do you want to delete all the customers`,
		showDenyButton: true,
		showCancelButton: true,
		confirmButtonText: 'Just do it!',
		denyButtonText: `Don't delete`,
	}).then(async (result) => {
		if (result.isConfirmed) {
			parent.loaderSetVisible(true);


			let respExc = await UC_exec_async('call CRMLiteManager_deleteAllCustomers()', 'Repo');

			if (respExc === "OK") {

				await loadInformation();
				await loadTable();

				Swal.fire('Deleted!', 'Data has been deleted', 'success');
			} else {

				Swal.fire(`Something went wrong`, 'Please, try again later', 'error');
			}

			parent.loaderSetVisible(false);

		} else if (result.isDenied) {
			Swal.fire('Data not deleted', '', 'info');
			parent.loaderSetVisible(false);
		}
	});

});

// <-------- table options -----------

// <---------- Customer table ---------



// ---------- Report Section -------->
var columnStructure = [];
var columnHTMLstructure = `
<label for="cmbTypeOfColumn" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
		   <span class="swal2-label">Alias *</span>
</label>
<input type="text" id="inpAlias" placeholder="Alias" class="swal2-input" style="width:220px;" >

<label for="cmbTypeOfColumn" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
  <span class="swal2-label">Column type</span>
</label>
<select id="cmbTypeOfColumn" class="swal2-input" style="width:220px;">
	<option value="" disabled selected>Select a column type</option>
	<option value="column" >Column</option>
	<option value="constant">Constant</option>
	<option value="jsonfields">Dynamic fields</option>
</select>

<select id="cmbFrom" class="swal2-input" style="width:220px;display:none;">
	<option selected value="" disabled>Which table?</option>
	<option value="CRMLite_customersV2">Customer information</option>
	<option value="CRMLite_management">Managements</option>
</select>
<select id="cmbColumn" class="swal2-input" style="width:220px;display:none;"></select>
<!-- IF IS JSON -->
<select id="cmbJSONColumn" class="swal2-input" style="width:220px;display:none;"></select>
<select id="cmbJSONField" class="swal2-input" style="width:220px;display:none;"></select>
<input type="text" id="inpConstantValue" placeholder="Constant text" class="swal2-input" style="width:220px;display:none;" >

<label for="chkIsDate" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
  <span class="swal2-label">Is datetime?</span>
</label>
<input type="checkbox" id="chkIsDate" class="swal2-checkbox">
`



$("#sorteableColumns").sortable({
    helper: "clone",
    items: "> li[data-columnid]",
    start: function (event, ui) {

	},
    stop: function (event, ui) {

	},
  });



async function initReportAdvancedSection(){
	document.getElementById('btnNewTemplate').disabled = true;
	document.getElementById('report_editor_section').style.display = "none";
	document.getElementById('report_editor_select_section').style.display = "";
	document.getElementById('cmbReportTemplate').disabled = false;
	document.getElementById('cmbReportTemplate').value = "";

	columnStructure = [];
	cleanReportTemplate();
	let cmbReportTemplate = document.getElementById("cmbReportTemplate");

	let resp = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.CRMLite_reports`));
	if(resp.length){
		 cmbReportTemplate.style.display = "";
		 //cargo los datos recogidos:
		 $(`#cmbReportTemplate`).empty();
		 $(`#cmbReportTemplate`).trigger("chosen:updated");
		 $(`#cmbReportTemplate`).prepend(
			 `<option disabled selected value>Select a template</option>`
		 );
		 resp.map((item) => $(`#cmbReportTemplate`).append(new Option(item.title, item.title)));
		 $(`#cmbReportTemplate`).trigger("chosen:updated");	 
	}else{
		cmbReportTemplate.style.display = "none";
		$('#cmbReportTemplate').empty();
	}

}

document.getElementById('cmbReportTemplate').addEventListener('change', async (e)=>{
	e.target.disabled = true;
	if(e.target.value){
		let resp = JSON.parse(await UC_get_async(`SELECT * FROM ccrepo.CRMLite_reports WHERE title="${e.target.value}"`));
		if(resp.length){
			
			await loadReportTemplate(resp[0]);
		
		}else{
		notification('An error has been appear', "We can't load de information in this moment, try later.", "fa fa-error", "warning");
		e.target.disabled = false;
		return;
		}
	}else{
		notification("Please select a correct option", "", "fa fa-info", "warning");
		e.target.disabled = false;
	}

});

document.getElementById('txtNewTemplate').addEventListener('input', (e)=>{
	if(e.target.value) document.getElementById('btnNewTemplate').disabled = false;
	else document.getElementById('btnNewTemplate').disabled = true;
});

document.getElementById('btnNewTemplate').addEventListener('click', async ()=>{
	document.getElementById('report_editor_section').style.display = ""; //aparece el menu de edicion
	document.getElementById('report_editor_select_section').style.display = "none"; //Oculto el main menu
	document.getElementById('lblReportName').innerText = document.getElementById('txtNewTemplate').value; //Se le da el valor del txtNewTemplate
	document.getElementById('cmbReportChannel').value = ""; //elimino el channel seleccionado por default
	document.getElementById('cmbReportCampaigns').innerHTML = ""; //quito las campañas
	columnStructure = []; //reinicio variable
	document.getElementById('txtUntilDays').value = "1"; // Un dia por default
	document.getElementById('txtDestinationEmail').value = ""; // primer posicion hardcodeada por ahora
	document.getElementById('sorteableColumns').innerHTML=""; //elimino todos los registros anteriores
	
});

document.getElementById('cmbReportChannel').addEventListener('change', async (e)=>{
	let resp;
	if(!e.target.value){
		return;
	}else if(e.target.value == "telephony") {
		resp = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.queues group by name`, ''));
	}else{
		resp = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.${e.target.value}_members group by name`, ''));
		}
	 //cargo los datos recogidos:
	 $(`#cmbReportCampaigns`).empty();
	 $(`#cmbReportCampaigns`).trigger("chosen:updated");
	 $(`#cmbReportCampaigns`).prepend(
		 `<option disabled selected value>Select a campaign</option>`
	 );
	 resp.map((item) => $(`#cmbReportCampaigns`).append(new Option(item.name, `'${item["name"]}'`)));
	 $(`#cmbReportCampaigns`).trigger("chosen:updated");	 
})

function cleanReportTemplate(){
	//defino primero los elementos....d
}


document.getElementById('btnReportNewColumn').addEventListener('click', async ()=>{


	const { value: reportValues } = await Swal.fire({
		title: `Add a new column`,
		didRender: async () => {
			//Aqui agrego funciones que necesito tomar en 
			//cuenta al momento de cargar el modal
			let cmbTypeOfColumn = document.getElementById('cmbTypeOfColumn');
			let cmbFrom = document.getElementById('cmbFrom')	
			let cmbColumn = document.getElementById('cmbColumn')
			let cmbJSONColumn = document.getElementById('cmbJSONColumn');
			let cmbJSONField = document.getElementById('cmbJSONField');
			let inpConstantValue = document.getElementById('inpConstantValue');

			cmbTypeOfColumn.addEventListener('change', async (e)=>{
				
				cmbColumn.innerHTML = ""; 
				
				inpConstantValue.value = "";
				inpConstantValue.style.display = "none";

				cmbJSONColumn.style.display = "none";
				cmbJSONField.style.display = "none";
				cmbJSONColumn.innerHTML = "";
				cmbJSONField.innerHTML = "";

				cmbFrom.style.display = "none";	
			

				if(e.target.value === "column"){
					cmbFrom.style.display = "";	
					cmbColumn.style.display = "";

				}else if(e.target.value === "jsonfields"){
					cmbFrom.style.display = "";	
					cmbColumn.style.display = "none";
					cmbJSONColumn.style.display = "";
					cmbJSONColumn.innerHTML = "<option selected value='information'>Customer Information column</option>"
					cmbJSONField.style.display = "";
					
					let resp = JSON.parse(await UC_get_async(`SELECT fieldId, name FROM ccrepo.CRMLite_structure`,''));
					let opts = '';
					if(resp.length){
						resp.map(element=>{
							if(element.fieldId != "phone" && element.fieldId != "name" && element.fieldId != "email"){ //estos campos no son 
								opts+=`<option value="${element.fieldId}">${element.name}</option>`
							}
						});	
					}
					cmbJSONField.innerHTML = opts;

					inpConstantValue.value = ""; //limpio constante
				}else if(e.target.value === "constant"){
					cmbFrom.style.display = "none";
					cmbFrom.value = ""; //selecciono valor vacio puesto que no sale de ningun lado	
					cmbColumn.style.display = "none"; 
					cmbColumn.innerHTML = ""; //limpiamos cmb
					cmbJSONColumn.style.display = "none"; 
					cmbJSONField.style.display = "none";
					inpConstantValue.style.display = "";
				}

			});
			
			cmbFrom.addEventListener('change', async (e)=>{
				
				if(e.target.value === "CRMLite_customersV2" && cmbTypeOfColumn.value === "column"){
					cmbColumn.innerHTML = `
					<option value="" selected disabled>Select a field</option>
					<option value="id">ID</option>
					<option value="name">Name</option>
					<option value="phone">Phone</option>
					<option value="email">E-mail</option>
					<option value="agent">Agent</option>
					<option value="created">Creation date</option>
					<option value="updated">Update date</option>
					<option value="promise">Due</option>
					<option value="schedule_promise">Due date</option>
					`
				}else if(e.target.value === "CRMLite_customersV2" && cmbTypeOfColumn.value === "jsonfields"){
					let resp = JSON.parse(await UC_get_async(`SELECT fieldId, name FROM ccrepo.CRMLite_structure`,''));
					let opts = '<option selected disabled value="">Select a field</option>';
					resp.map(element=>{
						if(element.fieldId != "phone" && element.fieldId != "name" && element.fieldId != "email"){ //estos campos no son 
							opts+=`<option value="${element.fieldId}">${element.name}</option>`
						}
					});
					cmbJSONField.innerHTML = opts;
					inpConstantValue.value = ""; //limpio constante
					cmbColumn.innerHTML = ""; //limpio columnas
					cmbColumn.value = ""; //deselecciono columnas
				}else if(e.target.value === "CRMLite_management" && cmbTypeOfColumn.value === "column"){
					cmbJSONField.innerHTML = "";
					cmbJSONField.value = "";
					inpConstantValue.value = ""; //limpio constante
					cmbColumn.innerHTML = ""; //limpio columnas
					cmbColumn.value = ""; //deselecciono columnas
					cmbColumn.innerHTML = `
					<option selected value="" disabled>Select a field</option>
					<option value="id">Row ID</option>
					<option value="id_customer">Customer ID</option>
					<option value="date">Date</date>
					<option value="agent">Agent</option>
					<option value="lvl1">Level 1</option>
					<option value="lvl2">Level 2</option>
					<option value="lvl3">Level 3</option>
					<option value="note">Notes</option>
					<option value="queuename">Campaign name</option>
					<option value="channel">Channel (Telephony, SMS ...)</option>
					<option value="guid">GUID</option>
					<option value="callid">CallID</option>
					`
				}else{
					cmbJSONField.innerHTML = "";
					cmbJSONField.value = "";
					inpConstantValue.value = ""; //limpio constante
					cmbColumn.innerHTML = ""; //limpio columnas
					cmbColumn.value = ""; //deselecciono columnas
					cmbFrom.value = "";
				}
			})


		},
		html: columnHTMLstructure,
		showCloseButton: true,
		showCancelButton: true,
		focusConfirm: false,
		inputValidator: (value) => {
			if (!value) {
				return 'You most to field all the required fields!'
			}
		},
		confirmButtonText: "Save now",
		preConfirm: async () => {
		 //Aqui agrego funciones para que pueda capturar los datos.


		 
	
		 	let obj = {};
		 	obj.id = columnStructure.length ? columnStructure.sort(function(a, b){return b.id - a.id})[0].id + 1 : 1;
			obj.alias = document.getElementById('inpAlias').value;
			obj.isJSON = document.getElementById('cmbTypeOfColumn').value == "jsonfields" ? "true" : "false";
			obj.isConst = document.getElementById('cmbTypeOfColumn').value == "constant" ? "true" : "false";
			if (obj.isConst == "false") {
				obj.from = document.getElementById('cmbFrom').value ? document.getElementById('cmbFrom').value : "CRMLite_customersV2";
			}else{
				obj.from = "";
			}
			obj.column = obj.isJSON == "true" ? document.getElementById('cmbJSONField').value : document.getElementById('cmbColumn').value;
			obj.constValue = document.getElementById('inpConstantValue').value;
			obj.JSONColumn = obj.isJSON == "true" ? "information" : "";
			obj.isSQLstatement = "false" // hasta que no se pruebe del todo, lo dejaremos false.
			obj.isDateTime = document.getElementById('chkIsDate').checked ? "true" : "false";

			if(obj.alias) return obj 
			else return null;

		},
	  });
	
	if(!reportValues){
		notification("Some fields aren't completed properly", "", "fa fa-warning", "warning");
	}else{
		columnStructure.push(reportValues);
	
		let fieldHTMLTemp = `
		<li class="li_drag_sort_fields" data-columnid="${reportValues.id}">
			<i data-columnid="${reportValues.id}" class="closebadge fa fa-window-close" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">
			</i>ID:${reportValues.id} - ${reportValues.alias}
		</li>`;
	
		let sorteableColumns  = document.getElementById('sorteableColumns');
		sorteableColumns.insertAdjacentHTML('beforeend', fieldHTMLTemp);
	}


});

document.getElementById('btnSaveReport').addEventListener('click', async(e)=>{
	e.target.style.disabled = true;
	console.info('Column structure below:')
	console.info(columnStructure);
	let newStructure = [];
	// metodo de ordenamiento del obj estructura:
	let arrElementsLi = document.querySelectorAll('#sorteableColumns>li>[data-columnid]');
	if(arrElementsLi.length){
		for (let i = 0; i < arrElementsLi.length; i ++){
			let id = arrElementsLi[i].dataset.columnid;
			let objTemp = columnStructure.filter(item=> item.id == id);
			if (objTemp.length){
				newStructure.push(objTemp[0]);
			} 
		}
	}else{
		notification("You don't have any field yet", "Add a new column for your report to save it", "fa fa-warning","warning");
		e.target.style.disabled = false;
		return;
	}
	
	console.info('New column structure below:')
	console.log(newStructure);
	

	let selectedCampaigns = [];
	let cmbReportCampaignsChildren = document.getElementById('cmbReportCampaigns').children
	for(let i = 0; i < cmbReportCampaignsChildren.length; i ++){
		cmbReportCampaignsChildren[i].value && selectedCampaigns.push(cmbReportCampaignsChildren[i].value);
	}

	if(selectedCampaigns.length == 0){
		notification("You don't select any campaign yet", "", "fa fa-warning","warning");
		return;
	}

	let emails = document.getElementById('txtDestinationEmail').value
	emails = emails ? emails.replace(/ /g, "") : emails;
	emails = emails.split(',');

	if(emails.length == 0){
		notification("You don't have any email yet", "Add a new destination for your report to save it", "fa fa-warning","warning");
		e.target.style.disabled = false;
		return;
	}

	let cmbReportChannel = document.getElementById('cmbReportChannel').value;
	if (!cmbReportChannel){
		notification("You don't have any channel selected yet", "", "fa fa-warning","warning");
		e.target.style.disabled = false;
		return;
	}

	let untilDays = document.getElementById('txtUntilDays').value;
	untilDays = !untilDays ? 1 : untilDays;


	let objSave = {};
	let title = document.getElementById('lblReportName').innerText;
	objSave.title = title;
	objSave.columns  = JSON.stringify(newStructure);
	objSave.campaigns = JSON.stringify(selectedCampaigns);
	objSave.channel = cmbReportChannel;
	objSave.destination = JSON.stringify(emails);
	objSave.days = untilDays;

	let resp = JSON.parse(await UC_get_async(`SELECT id FROM ccrepo.CRMLite_reports WHERE title = "${title}"`, ""));
	if(resp.length == 0){
		// es un reporte nuevo;
		console.log('Reporte nuevo a generarse.')
		objSave.id = null;
		let respSave = await UC_Save_async(objSave, 'CRMLite_reports', 'Repo');
		if(respSave == "OK"){
			
			const { value: reportSchedule } = await Swal.fire({
				didRender:()=>{
					let cmbHour = document.getElementById('cmbHour')
					for(let i = 0; i <= 23; i ++){
						cmbHour.insertAdjacentHTML('beforeend', `<option value="${i}">${i}</option>`)
					} 

					let cmbMinutes = document.getElementById('cmbMinutes')
					for(let i = 0; i <= 59; i ++){
						cmbMinutes.insertAdjacentHTML('beforeend', `<option value="${i}">${i}</option>`)
					} 
				},
				title: `Add a new column`,
				html: `
				<label for="cmbDay" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
					<span class="swal2-label">Day of the week</span>
				</label>
				<select id="cmbDay" class="swal2-input" size="8" style="width:220px;">
					<option selected value="*">ALL</option>
					<option value="0">Sunday</option>
					<option value="1">Monday</option>
					<option value="2">Tuesday</option>
					<option value="3">Wednesday</option>
					<option value="4">Thursday</option>
					<option value="5">Friday</option>
					<option value="6">Saturday</option>
				</select>

				<label for="cmbHour" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
					<span class="swal2-label">Hour</span>
				</label>
				<select id="cmbHour" class="swal2-input" style="width:220px;">
				<option value="*" selected>ALL</option>
				</select>

				<label for="cmbMinutes" class="swal2-checkbox" style="margin: 0; margin-top: 20px;">
					<span class="swal2-label">Minutes</span>
				</label>
				<select id="cmbMinutes" class="swal2-input" style="width:220px;">
				<option value="*" selected>ALL</option>
				</select>
				`,
				showCloseButton: true,
				showCancelButton: true,
				focusConfirm: false,
				confirmButtonText: "Schedule it",
				preConfirm: async () => {
				//Aqui agrego funciones para que pueda capturar los datos.
					return {	
						day: document.getElementById('cmbDay').value,
						minutes: document.getElementById('cmbMinutes').value,
						hour: document.getElementById('cmbHour').value
					}
				},
			});
			
			await scheduleReport(reportSchedule.hour, reportSchedule.minutes, reportSchedule.day, objSave.title);
			notification('The report has been saved', '', 'fa fa-success', 'success');
			await initReportAdvancedSection(); // punto de inicio nuevamente.
		}else{
			notification('We have a problem in the data or database', 'Please, try later', 'fa fa-warning', 'warning');
		}
		e.target.style.disabled = false;
	}else{
		resp = resp[0];

		console.log('Reporte ya existente.')
		// primer posicion del array tomada como default
		// es un reporte existente, actualizamos.
		objSave.id = resp.id;
		let respUpdate = await UC_update_async(objSave, 'CRMLite_reports', 'id', 'Repo');
		if(respUpdate == "OK"){
			notification('The report has been updated', '', 'fa fa-success', 'success');
			await initReportAdvancedSection(); // punto de inicio nuevamente.
		}else{
			notification('We have a problem in the data or database', 'Please, try later', 'fa fa-warning', 'warning');
		}
		e.target.style.disabled = false;
	}

})

async function scheduleReport(hour = "23", minutes = "59", dow = "*", title=""){
	$.post(
		RESTurl + "schedule/addsched",
		{
			sched: JSON.stringify({"jobname": title,"alert":"notificate user","send":parent.user,"cron":`${minutes} ${hour} * * ${dow}`,"classname":"ExecScript","status":1,"jparameters":"Script","pvalues":`sudo python3 /etc/IntegraServer/scripts/CRMLite-reports-manager/main.py "${title}"`,"tipo":"task"})
		},
		function (data) {
			
			parent.notificate("NOTIFSUCCESS", null, "success");
			parent.loaderSetVisible(false);
			console.log(data)
		}
	).fail(function() {
		parent.loaderSetVisible(false);
		parent.notificate("NOTIFDANGER", null, "error");
	});
}
async function loadReportTemplate(data){

	document.getElementById('report_editor_section').style.display = "";
	document.getElementById('report_editor_select_section').style.display = "none";
	document.getElementById('lblReportName').innerText = data.title;
	document.getElementById('cmbReportChannel').value = data.channel;

	columnStructure = JSON.parse(data.columns);
	
	let resp;
	if(data.channel == "telephony") {
		resp = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.queues group by name`, ''));
	}else{
		resp = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.${data.channel}_members group by name`, ''));
		}
	 //cargo los datos recogidos:
	 $(`#cmbReportCampaigns`).empty();
	 $(`#cmbReportCampaigns`).trigger("chosen:updated");
	 $(`#cmbReportCampaigns`).prepend(
		 `<option disabled selected value>Select a campaign</option>`
	 );
	 
	 resp.map((item) => $(`#cmbReportCampaigns`).append(new Option(item.name, `'${item["name"]}'`)));
	 $(`#cmbReportCampaigns`).trigger("chosen:updated");
	
	let opts = document.querySelectorAll('#cmbReportCampaigns > option');
	data.campaigns = JSON.parse(data.campaigns);
	for(let item of opts){
		if(data.campaigns.some(arr => arr === item.value)){
			item.selected = true;
		}
	}


	document.getElementById('txtUntilDays').value = data.days;
	document.getElementById('txtDestinationEmail').value = JSON.parse(data.destination).join(', '); // primer posicion hardcodeada por ahora
	let sorteableColumns  = document.getElementById('sorteableColumns');
	sorteableColumns.innerHTML="";
	columnStructure.map(item=>{
		sorteableColumns.insertAdjacentHTML('beforeend', `
		<li class="li_drag_sort_fields" data-columnid="${item.id}" >
			<i data-columnid="${item.id}" class="closebadge fa fa-window-close" onclick="this.parentNode.parentNode.removeChild(this.parentNode)" ></i>
			ID:${item.id} - ${item.alias}
		</li>
		`)
	})
}
// <---------- Report Section ---------

/* INIT FUNCTIONS */

$(async () => {
	let initialInfo = await loadInformation();
	if (initialInfo.error) return;
	await loadTable();
	await initReportAdvancedSection()
})

