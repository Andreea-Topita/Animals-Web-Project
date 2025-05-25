import socket
import os
import gzip 
import json
from concurrent.futures import ThreadPoolExecutor

#dictionar cu extensiile de fisiere si tipurile de continut
# pentru a raspunde corect la cererile clientului
# sunt trimise in header ul http pentru ca browserul sa stie cum sa interpreteze fisierul primit
CONTENT_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/js",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".json": "application/json",
    ".xml": "application/xml"
}

# Functie pentru a obtine tipul de continut al unui fisier pe baza extensiei
# daca extensia nu este in dictionar, se returneaza "application/octet-stream"
def get_file_type(resource):
    # os path split peentru a separa numele fisierului de extensie, lower pentru a face comparatia fara diferente de litere mari sau mici
    _, ext = os.path.splitext(resource.lower())
    # daca nu e gasita in dictionar content types, se returneaza application octet stream ( tip generic)
    return CONTENT_TYPES.get(ext, "application/octet-stream")


HOST = ''               
PORT = 5678             


#directorul de resurse: "continut" este in directorul parinte al "server_web"
BASE_DIR = os.path.join(os.getcwd(), "..", "continut")
#calea de baza unde se afla fisierele continut ( html, css, js , imagini, pe care serverul le raspunde)


def handle_client(clientsocket, address):
    print("S-a conectat un client:", address)
    
    try:
        request = ""

        # citire date primite de la client pana la separatorul dintre header si corp
        # citire 1024 octeti , date codificate si adaugate in request
        while True:
            data = clientsocket.recv(1024)
            if not data:
                break
            # decodare datele primite in format utf-8
            # se opreste citirea la separatorul dintre header si corp
            # \r\n\r\n este separatorul standard in protocolul http
            request += data.decode("utf-8")
            if "\r\n\r\n" in request:
                break

        # extragere linie de start: get /index.html http/1.1
        start_line = request.split("\r\n")[0]
        print("Linia de start:", start_line)
        # descompune star line : get /index.html http/1.1 in tokenuri
        tokens = start_line.split()
        if len(tokens) < 2:
            # cerere invalida, daca nu avem metoda si resursa, inchidere conexiune 
            clientsocket.close()
            return

        method = tokens[0].upper()  # transformare in maj GET, POST etc
        
        if len(tokens) >= 2:
            resource = tokens[1]
        else:
            resource = "/"
        #verifcam daca tokens are cel putin 2 elemente, daca da, atribuie al doilea element resource , sau /

        # daca resursa e / , o inlocuim cu /index.html
        if resource == "/":
            resource = "/index.html"

        # daca resursa are un slash la inceput, il eliminam
        # pentru a obtine calea corecta a fisierului
        resource = resource.lstrip("/")


        #1) POST /api/utilizatori lab 7 pt nou utilizator 
        if method == "POST" and resource == "api/utilizatori":
            print("Cerere POST către /api/utilizatori")

            #extragere corpul cererii (după \r\n\r\n)
            #request are deja headere + corp, separate de \r\n\r\n
            try:
                body = request.split("\r\n\r\n", 1)[1]
            except IndexError:
                body = ""

            # parseaza JSON-ul din corp, daca nu 400
            # incarcare datele in format JSON
            try:
                # incercam sa decodam datele primite in format JSON
                # folosim json.loads pentru a transforma stringul JSON intr-un obiect Python
                new_user = json.loads(body)
            except Exception as e:
                error_msg = "Eroare la parsarea datelor JSON."
                response = (
                    "HTTP/1.1 400 Bad Request\r\n"
                    f"Content-Length: {len(error_msg.encode('utf-8'))}\r\n"
                    "Content-Type: text/plain; charset=utf-8\r\n"
                    "Server: ServerWeb\r\n"
                    "Connection: close\r\n\r\n"
                    + error_msg
                )
                # trimitem mesaj de eroare inapoi clientului
                clientsocket.sendall(response.encode("utf-8"))
                clientsocket.close()
                return
            
            # actualizare fisierul utilizatori.json din folderul resurse
            # os path join pentru a construi calea completa a fisierului
            utilizatori_file = os.path.join(BASE_DIR, "resurse", "utilizatori.json")
            try:
                # incercam sa deschidem fisierul utilizatori.json pentru citire
                with open(utilizatori_file, "r", encoding="utf-8") as f:
                    # incercam sa citim datele din fisier
                    # folosim json.load pentru a transforma datele JSON intr-o lista Python
                    lista_utilizatori = json.load(f)
            except Exception:
                # daca fisierul nu exista sau nu poate fi citit, initializam o lista goala
                lista_utilizatori = []
            
            #adaugare nou utilizator la lista existenta
            lista_utilizatori.append(new_user)

            #lista actualizata in fisier
            try:
                #actualizare fis json cu lista actualizata
                #with - deschide fisierul pentru scriere, daca nu exista, il creeaza
                #dump - scrie lista in fisier in format JSON,  serializraza ob python in sir de caractere json
                #as f - atribuie fisierul deschis variabilei f pe care o folosesim pt operatii 
                with open(utilizatori_file, "w", encoding="utf-8") as f:
                    #lista - ob python ce e converstit json
                    #f - fisierul deschis 
                    #indent - nr de spatii pentru indentare
                    json.dump(lista_utilizatori, f, indent=4)
            except Exception as e:
                #daca apare o eroare la scrierea in fisier, trimitem un mesaj de eroare inapoi clientului
                
                error_msg = "Eroare la actualizarea fișierului JSON."
                response = (
                    "HTTP/1.1 500 Internal Server Error\r\n"
                    f"Content-Length: {len(error_msg.encode('utf-8'))}\r\n"
                    "Content-Type: text/plain; charset=utf-8\r\n"
                    "Server: ServerWeb\r\n"
                    "Connection: close\r\n\r\n"
                    + error_msg
                )
                clientsocket.sendall(response.encode("utf-8"))
                clientsocket.close()
                return

            #trimite mesaj de succes ( 200 ok)
            success_msg = "Utilizator înregistrat cu succes!"
            response = (
                "HTTP/1.1 200 OK\r\n"
                f"Content-Length: {len(success_msg.encode('utf-8'))}\r\n"
                "Content-Type: text/plain; charset=utf-8\r\n"
                "Server: ServerWeb\r\n"
                "Connection: close\r\n\r\n"
                + success_msg
            )
            clientsocket.sendall(response.encode("utf-8"))
            clientsocket.close()
            return
            #post si daca resursa ceruta e api/uti , extragem corpul cererii, care contine date json ce repr noul utilizator
            # se citeste fisier uti.json  pentru a obtine lista curenta de utilizatori, daca nu exista se porneste de la lista noua 

        
        # 2) Daca nu e POST la /api/utilizatori, executam logica existenta (GET)
    
        # reconstruim calea fisierului , base fir + resursa ceruta pt a construi calea fisierului 
        #base fir - direc radacina unde se afla toate resursele
        file_path = os.path.join(BASE_DIR, resource)
        print("Calea fisierului:", file_path)
        
        #verificare daca fisierul exista si e fisier nu director 
        if os.path.exists(file_path) and os.path.isfile(file_path):
            #determina tipul de continut din fisier si extensia 
            ext = os.path.splitext(file_path)[1].lower() # imparte calea fisierului in doua : part princ si extensia , si extrage a doua comp: .html

            #foloseste dictionarul pentru a determina tipul de continut corespunzator extensiei, daca nu se gaseste text plain
            content_type = CONTENT_TYPES.get(ext, "text/plain; charset=utf-8")

            #deschidem fisierul in mod binar pentru a citi continutul
            #open - pt a deschide fisierul , rb - read binary , cand se lucreaza cu fisiere care nu sunt text 
            # cand vrem bitii exacti 
            # f - fisierul inchis automat dupa ce blocul se executa 
            with open(file_path, "rb") as f:
                #citeste intregul continut al fisierului in bytes
                file_bytes = f.read()

            # verificam gzip, comprima fisierul , daca se accepta gzip in headerul cererii
            if "gzip" in request.lower():
                print("Se acceptă gzip în cerere.")
                #daca gzip e in cerere, comprima fisierul
                #gzip.compress - comprima datele binare in format gzip
                file_bytes = gzip.compress(file_bytes)
                #setam headerul de encoding gzip
                encoding_header = "Content-Encoding: gzip\r\n"
            else:
                encoding_header = ""

            #lungimea continutului in bytes dupa eventuala compresie
            content_length = len(file_bytes)
            header = (
                "HTTP/1.1 200 OK\r\n"
                f"Content-Length: {content_length}\r\n"
                f"Content-Type: {content_type}\r\n"
                + encoding_header +
                "Server: ServerWeb\r\n"
                "Connection: close\r\n\r\n"
            )
            #se trimit headerele si corpul fisierului catre client
            clientsocket.sendall(header.encode("utf-8"))
            clientsocket.sendall(file_bytes)
            print("Trimit fișierul (comprimat):", file_path)
        else:
            #daca nu a fost gasit, 404
            body = f"404 Not Found: Resursa {resource} nu a fost găsită!"
            header = (
                "HTTP/1.1 404 Not Found\r\n"
                f"Content-Length: {len(body.encode('utf-8'))}\r\n"
                "Content-Type: text/plain; charset=utf-8\r\n"
                "Server: ServerWeb\r\n"
                "Connection: close\r\n\r\n"
                + body
            )
            #trimitem headerul 404 catre client
            clientsocket.sendall(header.encode("utf-8"))
            print("Resursa nu a fost gasita:", file_path)

    except Exception as ex:
        print("Eroare la procesarea fisierului:", ex)
    finally:
        try:
            clientsocket.close()
        except Exception as e:
            print("Eroare la inchiderea conexiunii:", e)
        print("S-a terminat comunicarea cu clientul:", address, "\n")
        #daca nu e post, e get ; se construieste calea completa a fisierului si se verifica daca exita
        #se deschide fis in mod binar si se citeste continutul
        #daca in headere se gaseste referinta la gzip , se comprima fisierul 
        #se  construieste un header http care include lungimea cont, tipul de continut, eventual headerul de compresie, numele serverului si informatii despre conexiune
        #se trimite headerul si continutul catre client
        

#pornire server si gestionare conexiuni multiple( thread pool)
if __name__ == "__main__":
    #ipv4, tcp
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serversocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    serversocket.bind((HOST, PORT))
    serversocket.listen(5)
    #bind - asociaza socketul cu o adresa si un port
    #listen - serverul incepe sa asculte cererile de conexiune de la clienti

    print("Serverul asculta pe portul", PORT)

    #creare thread pool
    max_workers = 10
    #clasa din modulul concurrent.futures care permite creare unui pool de threaduri
    #pool ul va avea maxim 10 threaduri
    #with = cand se iese din bloc , e oprit corespunzator si toate threadurile sunt eliberate
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        while True:
            #bucla inifinita pentru ca serverul sa raman activ mereu
            #socket accept - asteapta o conexiune de la un client , blocheaza executia pana un client se conecteaza
            # odata ce se realizeaza conexiunea, aceasta metoda returneaza un nou socket  dedicat comunicarii cu clientului si adresa acestuia 

            print("#########################################################################")
            print("Serverul ascultă potențiali clienți.")
            try:
                clientsocket, address = serversocket.accept()
                #nu se creeaza un nou thread pentru fiecare client manual 
                #folosim submit pentru a trimite functia handle client impreuna cu socket si address la pool ul de thread uri 
                #adica unul dintre cele 10 threaduri disponibile va prelua executia functiei si va procesa cererea clientului 
                executor.submit(handle_client, clientsocket, address)
            except Exception as e:
                print("Eroare la acceptarea conexiunii:", e)
#thead pool - nr fix de thrad uri pentru a efectua multiple sarcini
#reduce cosuturile de creare a thread urilor
#procesarea in paralel a cererilor
#simplifica gestionarea resurselor 

#executor- gestioneaza un grup de threaduri care pot fi folosite pentru a executa sarcini in paralel
#sarcina e punsa intr o coada interna , thread urile din pool preiua sarcini din coada si le executa 