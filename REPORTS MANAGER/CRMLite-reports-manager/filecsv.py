#/usr/bin/python3
import json
import csv
 

prueba = [
    {
        "AGENCIA": "ORANGE",
        "PLAN DE PAGOS": "",
        "SUC SOCIO": "",
        "NOMBRE": "gaston",
        "QUITA CAPITAL": "",
        "DESCUENTO": "",
        "MONTO PROMESA": "2000",
        "GESTION": "",
        "FECHA PROMESA": "2022-04-29 19:11:00",
        "AGENTE": "Integra",
        "TELEFONO": "59894512502",
        "SALDOS": "s"
    },
    {
        "AGENCIA": "ORANGE",
        "PLAN DE PAGOS": "",
        "SUC SOCIO": "",
        "NOMBRE": "gaston",
        "QUITA CAPITAL": "",
        "DESCUENTO": "",
        "MONTO PROMESA": "$2000",
        "GESTION": "",
        "FECHA PROMESA": "2022-04-29 00:00:00",
        "AGENTE": "Integra",
        "TELEFONO": "59894512508",
        "SALDOS": "s"
    },
    {
        "AGENCIA": "ORANGE",
        "PLAN DE PAGOS": "",
        "SUC SOCIO": "",
        "NOMBRE": "gaston",
        "QUITA CAPITAL": "",
        "DESCUENTO": "",
        "MONTO PROMESA": "222222",
        "GESTION": "",
        "FECHA PROMESA": "2022-04-30 20:52:00",
        "AGENTE": "Integra",
        "TELEFONO": "94512508",
        "SALDOS": "s"
    }]
# now we will open a file for writing
data_file = open('data_filse.csv', 'w', newline="")
 
# create the csv writer object
csv_writer = csv.writer(data_file)
 
# Counter variable used for writing
# headers to the CSV file
count = 0
 
for val in prueba:
    if count == 0:
 
        # Writing headers of CSV file
        header = val.keys()
        csv_writer.writerow(header)
        count += 1
 
    # Writing data of CSV file
    csv_writer.writerow(val.values())
 
data_file.close()