#/usr/bin/python3
import json
import csv

def create_file(report_result = [], filepath = "/tmp/archivo.csv"):
    # now we will open a file for writing
    data_file = open(filepath, 'w', newline="")
    
    # create the csv writer object
    csv_writer = csv.writer(data_file)
    
    # Counter variable used for writing
    # headers to the CSV file
    count = 0
    try:
        for val in report_result:
            if count == 0:
        
                # Writing headers of CSV file
                header = val.keys()
                csv_writer.writerow(header)
                count += 1
        
            # Writing data of CSV file
            csv_writer.writerow(val.values())
    except Exception as e:
        print('problem: ' + e)
        return 0 #an error   
    data_file.close()
    return 1