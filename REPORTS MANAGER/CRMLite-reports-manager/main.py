#/usr/bin/python3
# Main script for Report Manager.
import datetime
import json
import constants as c
import integraframework as integra
import formatcsv as fcsv
import mail as m
import sys

reportname = ""
if sys.argv[0]:
    reportname = sys.argv[1]
else:
    reportname = c._default_report

reportinfo = integra.form_get('SELECT * FROM ccrepo.CRMLite_reports WHERE title="{}"'.format(reportname), "Repo")
reportinfo = reportinfo[0]
mysqlquery = [] #This var will contain all the mysql statement

columns = json.loads(reportinfo["columns"])
for val in columns:
    if val["from"] == "CRMLite_customersV2" : val["from"] = "crm"
    if val["from"] == "CRMLite_management" : val["from"] = "mng"

    tempstr = ""
    if val["isSQLstatement"] == "true":
        tempstr += 'IFNULL(({}), "")'.format(val["constValue"], val["alias"])
    elif val["isConst"] == "true":
        tempstr += '"{}"'.format(val["constValue"], val["alias"])
    elif val["isJSON"] == "true":
        tempstr += 'IFNULL({}.{}->"$.{}", "")'.format(val["from"], val["JSONColumn"], val["column"], val["alias"])
    else:
        tempstr += 'IFNULL(({}.{}), "")'.format(val["from"], val["column"])
    
    if val["isDateTime"] == "true":
        tempstr = "REPLACE({}, ',','.')".format(tempstr)
    
    tempstr += ' as "{}"'.format(val["alias"])
    mysqlquery.append(tempstr)

campaigns = json.loads(reportinfo["campaigns"])
days = reportinfo["days"]

mysqlquerystr = """SELECT {} FROM CRMLite_customersV2 as crm LEFT JOIN CRMLite_management mng ON crm.id = mng.id_customer WHERE mng.queuename IN ({}) AND mng.date >= DATE_ADD(CURDATE(), INTERVAL -{} DAY) AND mng.date <= CURDATE() ORDER BY mng.date DESC """.format(", ".join(mysqlquery), ", ".join(campaigns), reportinfo["days"])
report_result = integra.form_get(mysqlquerystr, "Repo")

x = datetime.datetime.today()
reportnamecsv = '{}-{}.csv'.format(reportname, x.strftime("%Y%m%dT%H%M%S"))
if len(report_result) > 0:
    print('tiene un report correcto')
    response_fcsv = fcsv.create_file(report_result, "/tmp/{}".format(reportnamecsv))
    if(response_fcsv == 1):
        # Si el archivo está, pasamos a enviar a sus destinos correspondientes
        m.sendEmail(json.loads(reportinfo["destination"]), "Report {} has been generated".format(reportname), "Hey there, have you seen your report? Is here for you in the attachments!", "/tmp/{}".format(reportnamecsv), reportnamecsv)
        print('Archivo creado y enviado')
    else:
        print("hubo un problema")
else:
    print('No hubo resultados para esta query, no genero reporte.')


