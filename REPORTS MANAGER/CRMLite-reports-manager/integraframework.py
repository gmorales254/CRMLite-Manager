#/usr/bin/python3
from logging import exception
import requests
import json
import constants as c

def getusertoken():
    url = "{}/Integra/resources/auth/getUserToken".format(c._uc_env)
    payload='user={}&password={}'.format(c._uc_user, c._uc_pass)
    headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
    }

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
    except Exception as e:
        response = ""
        print("Error in the request, return []. Exception: {}".format(e))
        
    finally:
        return response

def form_get(query = "", dsn = "Repo"):
    #token = getusertoken()
    url = "{}/Integra/resources/forms/FormGet".format(c._uc_env)
    payload='query={}&dsn={}'.format(query, dsn)
    headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' #,'Authorization': 'Basic {}'.format(token)   
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response = json.loads(response.text)
    except Exception as e:
        print(e) 
        response = []
        print("Error in the query, return [].")
        
    finally:
        return response