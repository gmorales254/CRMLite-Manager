//# sourceURL=ScriptDesigner.js

async function loadCampaigns(inputName = "", defaultOpt = "") {

    let campaigns = [];
    //telefonia
    let channelCall = JSON.parse(await UC_get_async(`SELECT name FROM ccdata.queues group by name`, ''));
    if (channelCall.length) channelCall.map((item) => campaigns.push(`${item.name} (telephony)`));
    //email
    let channelEmail = JSON.parse(
        await UC_get_async(`SELECT name FROM ccdata.email_members group by name`, '')
    );
    if (channelEmail.length) channelEmail.map((item) => campaigns.push(`${item.name} (email)`));
    //messenger
    let channelMessenger = JSON.parse(
        await UC_get_async(`SELECT name FROM ccdata.messenger_members group by name`, '')
    );
    if (channelMessenger.length) channelMessenger.map((item) => campaigns.push(`${item.name} (messenger)`));
    //sms
    let channelSms = JSON.parse(
        await UC_get_async(`SELECT name FROM ccdata.sms_members group by name`, '')
    );
    if (channelSms.length) channelSms.map((item) => campaigns.push(`${item.name} (sms)`));
    //Webchat
    let channelWeb = JSON.parse(
        await UC_get_async(`SELECT name FROM ccdata.webchat_members group by name`, '')
    );
    if (channelWeb.length) channelWeb.map((item) => campaigns.push(`${item.name} (webchat)`));

    //cargo los datos recogidos:
    $(`#${inputName}`).empty();
    $(`#${inputName}`).trigger("chosen:updated");
    $(`#${inputName}`).prepend(
        `<option disabled selected value>${defaultOpt}</option>`
    );
    campaigns.map((item) => $(`#${inputName}`).append(new Option(item, item)));
    $(`#${inputName}`).trigger("chosen:updated");

    //agrego event listener
    document.getElementById(`${inputName}`).addEventListener("change", async (e) => {
        let queue = e.target.value.split(" ")[0];
        let channel = e.target.value.split(" ")[1];
        channel = channel.substring(1, channel.length - 1);
        await getAndInsertScriptByCampaign(queue, channel);
    });
}

async function getAndInsertScriptByCampaign(queue = "", channel = "telephony") {

    let resp = JSON.parse(await UC_get_async(`SELECT script FROM CRMLite_scripts WHERE campaign = '${queue}' AND channel = '${channel}'`, 'Repo'));
    if (resp.length) {
        document.getElementById('txtScript').value = resp[0].script;
    } else {
        document.getElementById('txtScript').value = "";
    }

}

async function saveScript(campaign = "", channel = "", script = "") {   
    let existScript = JSON.parse(await UC_get_async(`SELECT * FROM CRMLite_scripts WHERE campaign = "${campaign}" AND channel = "${channel}"`, 'Repo'));
    let objScript = {
        campaign: campaign,
        channel: channel,
        script: script
    }

    if (existScript.length) {
        objScript.id = existScript[0].id;

        let resp = await UC_update_async(objScript, 'CRMLite_scripts', 'id', 'Repo');
        notification('Script updated successfully', '', 'fa fa-success', 'success');
    } else {

        let resp = await UC_Save_async(objScript, 'CRMLite_scripts', 'Repo');
        notification('Script saved successfully', '', 'fa fa-success', 'success');
    }

    
    await loadCampaigns('cmbScriptQueues', 'Select a campaign');
}

document.getElementById('btnSaveScript').addEventListener('click', async ()=> {
    let camp = document.getElementById('cmbScriptQueues').value
    let channel = camp.split(' ')[1];
    camp = camp.split(' ')[0];
    
    channel = channel.substring(1, channel.length - 1);

    let script = document.getElementById('txtScript').value;
    await saveScript(camp, channel, script);
})

loadCampaigns('cmbScriptQueues', 'Select a campaign');
