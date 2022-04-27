#/usr/bin/python3
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
    except:
        response = ""
        print("Error in the request, return [].")
        
    finally:
        return response

def form_get(query = "", dsn = "Repo"):
    token = getusertoken()
    print(token)
    print(token.text)
    url = "{}/Integra/resources/forms/FormGet".format(c._uc_env)
    payload='query={}&dsn={}'.format(query, dsn)
    headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Authorization': 'Basic YXBpdXNlcjpiY2MyNGIxZC03NTQ1LTQ1MDYtYTgzNS05ODZkN2NjYmNjNGQ='
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response = json.loads(response.text)
    except:
        print(response)
        print(response.text)
        response = []
        print("Error in the query, return [].")
        
    finally:
        print("Query executed")
        return response