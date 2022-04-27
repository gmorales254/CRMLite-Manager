#/usr/bin/python3
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import constants as c

def sendEmail(dst = ['test@test.com'], subject = "Test subject", body = "Test body", attachment_path = "itshere.csv", attachment_name = "itshere.csv"):
    #Variables de configuracion
    rem_server = c._emailserver
    rem_port = c._emailport
    rem = c._emailrem
    rem_pass = c._emalpass


    # Creamos el objeto mensaje
    mensaje = MIMEMultipart()
    
    # Establecemos los atributos del mensaje
    mensaje['From'] = rem
    mensaje['To'] = ", ".join(dst)
    mensaje['Subject'] = subject
    
    # Agregamos el body del mensaje como objeto MIME de tipo texto
    mensaje.attach(MIMEText(body, 'plain'))
    
    # Abrimos el archivo que vamos a adjuntar
    archivo_adjunto = open(attachment_path, 'rb')
    
    # Creamos un objeto MIME base
    adjunto_MIME = MIMEBase('application', 'octet-stream')
    # Y le cargamos el archivo adjunto
    adjunto_MIME.set_payload((archivo_adjunto).read())
    # Codificamos el objeto en BASE64
    encoders.encode_base64(adjunto_MIME)
    # Agregamos una cabecera al objeto
    adjunto_MIME.add_header('Content-Disposition', "attachment; filename= %s" % attachment_name)
    # Y finalmente lo agregamos al mensaje
    mensaje.attach(adjunto_MIME)
    
    # Creamos la conexión con el servidor
    sesion_smtp = smtplib.SMTP(rem_server, rem_port)
    
    # Ciframos la conexión
    sesion_smtp.starttls()

    # Iniciamos sesión en el servidor
    sesion_smtp.login(rem,rem_pass)

    # Convertimos el objeto mensaje a texto
    texto = mensaje.as_string()

    # Enviamos el mensaje
    sesion_smtp.sendmail(rem, dst, texto)

    # Cerramos la conexión
    sesion_smtp.quit()