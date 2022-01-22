//# sourceURL=Customers.js
import { paginate, array_move } from './Pagination.js';
import fieldsAvailable from './env.js';

//Variables ---------------

var arrHeaders = [];
var arrItems = [];
var filters =
	{
		dinamicFields: [{ name: "phone", val: '' }, { name: "email", val: '' }, { name: "name", val: "" }],
		dbFields:
		{
			active: "" /*"true" / "false" / "both"*/
			//agent: ""
			//created: { value1: "", operator: "", value2: "" }, //investigacion
			//updated: { value1: "", operator: "", value2: "" }, //investigacion
			//id: { value1: "", operator: "", value2: "" }
		}
	};

//--------------- Variables

// Customer table --------
export async function loadInformation(filter = false) {
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

	content = JSON.parse(await UC_get_async(`SELECT id, ${jsonQuery}, files, active, agent, created, updated FROM CRMLite_customersV2 WHERE active = 1`, "Repo"));
	if (!content) return { error: "nothing to load" };
	console.log(content);

	arrHeaders = headers;
	arrItems = content;
	// FILTROS ----->

	if (filter) {

		filters.dinamicFields.map((item) => {
			if (item.val) {
				arrItems = arrItems.filter(element => element[item.name] == item.val);
			}
		});

		let status = filters.dbFields.active;
		let agent = filters.dbFields.agent;

		if (status && status != "both") arrItems = arrItems.filter(element => element['active'] == status);

	}

	// <----- FILTROS

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


let btn_upload = document.getElementById('btnUploadBase').addEventListener('click', async () => {

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
			"dialer": "Bulk a new dialer base"
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
			return; //cancelo subida por falta de marcador.
		} else {
			dialerSelected = dialeropt;
		}
	}


	Papa.parse(document.getElementById('inpUploadBase').files[0], {
		download: true,
		header: true,
		complete: async (results) => {
			if (bulkopt === "customer"){
                await uploadNewCustomers(results);
            } 
			else{
                await uploadNewCustomers(results);
                await uploadNewDialerBase(dialerSelected, results.data, results.errors);

            } 
		}
	});
});

async function uploadNewDialerBase(dialer, data, errors) {
	parent.loaderSetVisible(true);

	data = await validateNewCustomers(data, errors);

if (!data.length) {
	
parent.loaderSetVisible(false);
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
	
	ajaxUploadBase(dataFormated, dialer, 'CRMLITEBASE', data.length); //subo base;
	parent.loaderSetVisible(false);
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
		parent.loaderSetVisible(false);
		notification('Error in file structure', '', 'fa fa-warning', 'warning');
		return;
	}

	parent.loaderSetVisible(false);

	return data;

}

async function uploadNewCustomers(result) {
	parent.loaderSetVisible(true); // loader visible activado;

	let {data, errors = [], meta} = result;

	data = await validateNewCustomers(data, errors);

	//empezar subida si tengo datos buenos:
	let dataTemp = [];
	let fecha = moment().format('YYYY-MM-DD HH:mm:ss');
	if (data.length) {
		//formateo el archivo para la subida.

		data.forEach((element) => {
			let objTemp = {};

			arrHeaders.map((item) => {
				let elementVal = element[item.fieldId];
				objTemp[item.fieldId] = elementVal ? elementVal : "";
			});


			dataTemp.push({ information: `'${JSON.stringify(objTemp)}'`, active: '1', agent: `'${parent.agent.accountcode}'`, created: `'${fecha}'` }) //bbjeto con  fields para la base

		});


		let respBulk = await UC_BulkUploadFromArrObj(dataTemp, 'CRMLite_customersV2', 'ccrepo');
		if (respBulk === "OK") {
			notification('Success', 'Your new base has been saved', 'fa fa-success', 'success');
			await loadInformation();
			await loadTable();
		} else {
            parent.loaderSetVisible(false);
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
	queryExec = queryExec.replace(/.$/, ';'); // Reemplazo el último caracter por un ;

	let resp = await UC_exec_async(queryExec, '');
	return resp;
}

function validarResultados(archivo) {
	Papa.parse(archivo, {
		complete: function (results, file) {
			let csv = results.data;
			archivo = arrayObjToCsv(csv);
			let sentencia = "IGNORE 1 LINES (information, active, agent, created)";
			UC_subirArchivoCSV(archivo, "CRMLite_customersV2", sentencia, console.log);
		},
		delimiter: ";"
	});

	parent.loaderSetVisible(false); // loader visible activado;

}


function arrayObjToCsv(ar) {
	//comprobamos compatibilidad
	if (window.Blob && (window.URL || window.webkitURL)) {
		let contenido = "", blob;
		//creamos contenido del archivo
		for (let i = 0; i < ar.length; i++) {
			//resto del contenido
			contenido += Object.keys(ar[i]).map(function (key) {
				return ar[i][key];
			}).join(";") + "\n";
		}
		//creamos el blob
		blob = new Blob(["\ufeff", contenido], { type: 'text/csv' });
		let csv_file = new File([blob], "basecsv", { type: 'text/csv' });
		return csv_file;
	} else {
		//el navegador no admite esta opción
		alert("Su navegador no permite esta acción.");
	}
};


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

// --------- Download report --------->
document.getElementById('btnDownloadReport').addEventListener('click', async () => {
	await downloadReport();
});

async function downloadReport() {
	let arrReport = [];

	//-- HEADERS -->
	let arrReportHead = []

	arrReportHead.push('id');
	arrHeaders.map((header) => {
		arrReportHead.push(header.fieldId);
	});

	arrReportHead.push('active', 'agent', 'created', 'updated');
	arrReport.push(arrReportHead); //seteo el header

	//<-- HEADERS --

	arrItems.map((item) => { //genero el array que contiene todo el contenido del reporte

		let contentTemp = [];
		contentTemp.push(item['id']);

		arrHeaders.map((header) => {
			let itemName = item[header.fieldId];
			contentTemp.push(itemName ? itemName.replace(/#/g, '') : "-");
		});

		contentTemp.push(item['active']);
		contentTemp.push(item['agent']);
		contentTemp.push(moment(item['created']).format('YYYY-MM-DD HH:mm:ss'));
		contentTemp.push(moment(item['updated']).format('YYYY-MM-DD HH:mm:ss'));

		arrReport.push(contentTemp);

	});

	let csvContent = "data:text/csv;charset=utf-8," + arrReport.map((e, i, a) => a[i].join(",")).join("\n");

	let encodedUri = encodeURI(csvContent);
	let link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "customers_report.csv");
	document.body.appendChild(link); // Required for FF
	link.click(); // Va a descargar el archivo que contiene los ejemplos de los campos "customers_report.csv". 


}

// <-------- Download report ----------


// --------- table options ------------

document.getElementById('btnRefreshTableCustomers').addEventListener('click', async () => {

	parent.loaderSetVisible(true);
	await loadInformation();
	await loadTable();
	parent.loaderSetVisible(false);
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


// -------- Filtering ---------------->

document.getElementById('btnApplyFilter').addEventListener('click', async () => {

	/*	
		let arrAgents = [];
		let arrAgentsHTML = "";
	
		arrItems.map((item) => {
				let agent = filters.dbFields.agent;
				arrAgents.push(agent);
		
		});
	
	arrAgents = new Set(arrayAgents);
	arrAgents.map(element=> arrAgentsHTML += `<option ${agentfiltered === item ? "selected" : ""} value="${item.agent}">${item.agent}</option>`)*/

	let phoneFilter = filters.dinamicFields.filter((element) => element.name === "phone");
	let emailFilter = filters.dinamicFields.filter((element) => element.name === "email");
	let nameFilter = filters.dinamicFields.filter((element) => element.name === "name");

	let statusHTML = "";
	["both", "true", "false"].map((status) => statusHTML += `<option  value="${status}" ${status === filters.dbFields.active ? "selected" : ""}>${status}</option>`)

	const { value: formValues } = await Swal.fire({
		title: `Apply a filter`,
		html:
		`
	  <input type="text" id="inpFilterPhone" class="swal2-input" style="width:220px;" placeholder="Filter by Phone" value="${phoneFilter.val}"/>
      <input type="text" id="inpFilterEmail" class="swal2-input" style="width:220px;" placeholder="Filter by Email" value="${emailFilter.val}"/>
      <input type="text" id="inpFilterName" class="swal2-input" style="width:220px;" placeholder="Filter by Name" value="${nameFilter.val}"/>

      <select id="cmbFilterStatus" class="swal2-input" style="width:220px;">
            <option disabled value>Filter by status</option>
			${statusHTML}
      </select>

	<!--  <select id="cmbFilterAgent" class="swal2-input" style="width:220px;">
            <option value="all">All</option>
            
      </select> -->
      
      `,
		showCloseButton: true,
		showCancelButton: true,
		focusConfirm: true,
		confirmButtonText:
		'Apply',
		preConfirm: async () => {
			let statusSelected = document.getElementById('cmbFilterStatus').value;
			//let agentSelected = document.getElementById('cmbFilterAgent').value;
			let phone = document.getElementById('inpFilterPhone').value;
			let email = document.getElementById('inpFilterEmail').value;
			let name = document.getElementById('inpFilterName').value;

			let dinamicFields = [{ name: "phone", val: phone }, { name: "email", val: email }, { name: "name", val: name }];

			filters = {
				dinamicFields: dinamicFields,
				dbFields:
				{
					active: statusSelected,
					//agent: agentSelected ? agentSelected : "all"
				}

			};


			await loadInformation(true);
		}

	});
});

// <------ Filtering ------------------



// <---------- Customer table ---------


/* INIT FUNCTIONS */

$(async () => {
	let initialInfo = await loadInformation();
	if (initialInfo.error) return;
	await loadTable();
})
