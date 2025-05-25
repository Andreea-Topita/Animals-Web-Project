//pt a prelua date din xml  si generez tabel
function incarcaAnimale() 
{
    // fetch pentru XML , solicita fisierul din director , http get catre xml
    fetch('resurse/animale.xml')
    //dupa ce fetch e rezv, returneaza o promisiune, si primeste un ob response
    .then(response => 
        {
            //daca raspunsul nu e 200 ok, eroare
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
        }
        //daca e in regula, returneaza corpul rasp ca text , adica cont fisierului xml
        return response.text();
    })
    // .then - dupa ce am primit textul xml, se prelucreaza
    // textul xml e un string, deci trebuie convertit in DOM
    .then(xmlText => 
        {
        // textul XML in document DOM , care permite transformarea textului xml in document dom
        var parser = new DOMParser();
        // domParser - creaza un document DOM din textul XML
        // parseFromString - transforma textul xml in document DOM,  xmlDoc care e accesat cu api dom
        var xmlDoc = parser.parseFromString(xmlText, "application/xml");
        

        //extrage toate elementele <animal> din documentul XML
        var animale = xmlDoc.getElementsByTagName("animal");
        if (animale.length === 0) 
            {
            document.getElementById("continut").innerHTML = "<p>Nu s-au gasit animale.</p>";
            return;
        }

        //construire tabel, tr in thead ,th fiecare sectiune
        var html = "<table class='animal-table'>";
            html += "<tr>" + "<th>ID</th>" + "<th>Nume</th>" + "<th>Varsta</th>" + "<th>Tip</th>" + "<th>Greutate</th>" + "<th>Culoare</th>" +  "<th>Rasa</th>" + "<th>Proprietar</th>" + "<th>Telefon</th>" +  "<th>Email</th>" + "<th>Adresa</th>" + "</tr>";


        //parcurge fiecare element <animal> din documentul XML
        for (var i = 0; i < animale.length; i++) {
      // se parcurge fiecare element <animal>
            var animal = animale[i];
        // extrage datele din fiecare element <animal>
        // folosim getAttribute pentru a extrage id-ul animalului
        // || - daca nu exista id, se va folosi un string gol
            var id = animal.getAttribute("id") || "";
        // extrage datele din elementele <nume>, <varsta>, <tip>
        // folosim getElementsByTagName pentru a obtine elementele corespunzatoare
        // [0] - pentru a obtine primul element din lista de elemente

        var nume = animal.getElementsByTagName("nume")[0] ? animal.getElementsByTagName("nume")[0].textContent : "";
        var varsta = animal.getElementsByTagName("varsta")[0] ? animal.getElementsByTagName("varsta")[0].textContent : "";
        var tip = animal.getElementsByTagName("tip")[0] ? animal.getElementsByTagName("tip")[0].textContent : "";
        var greutate = animal.getElementsByTagName("greutate")[0] ? animal.getElementsByTagName("greutate")[0].textContent : "";
        var culoare = animal.getElementsByTagName("culoare")[0] ? animal.getElementsByTagName("culoare")[0].textContent : "";
        var rasa = animal.getElementsByTagName("rasa")[0] ? animal.getElementsByTagName("rasa")[0].textContent : "";
        var proprietar = animal.getElementsByTagName("proprietar")[0] ? animal.getElementsByTagName("proprietar")[0].textContent : "";
        
        // extrage datele din blocul <informatii>
        var informatii = animal.getElementsByTagName("informatii")[0];
        var telefon = informatii && informatii.getElementsByTagName("telefon")[0] ? informatii.getElementsByTagName("telefon")[0].textContent : "";
        var email = informatii && informatii.getElementsByTagName("email")[0] ? informatii.getElementsByTagName("email")[0].textContent : "";
        
        // extrage adresa si concateneaza câmpurile
        var adresaElem = animal.getElementsByTagName("adresa")[0];
        var adresa = "";
        if (adresaElem) {
            var strada = adresaElem.getElementsByTagName("strada")[0] ? adresaElem.getElementsByTagName("strada")[0].textContent : "";
            var numar = adresaElem.getElementsByTagName("numar")[0] ? adresaElem.getElementsByTagName("numar")[0].textContent : "";
            var localitate = adresaElem.getElementsByTagName("localitate")[0] ? adresaElem.getElementsByTagName("localitate")[0].textContent : "";
            var judet = adresaElem.getElementsByTagName("judet")[0] ? adresaElem.getElementsByTagName("judet")[0].textContent : "";
            var tara = adresaElem.getElementsByTagName("tara")[0] ? adresaElem.getElementsByTagName("tara")[0].textContent : "";
            adresa = strada + " " + numar + ", " + localitate + ", " + judet + ", " + tara;
        }

        //   var nume = animal.getElementsByTagName("nume")[0] ? animal.getElementsByTagName("nume")[0].textContent : ""; 
        // cauta in eleem animal toate subelementele cu nume, returneaza nodelist - colectie de noduri
        //[0] - se selecteaza primul element, index 0 
        // daca exista element <nume> se extrage cont text al acestuia folosind textcontent , returneaza textul dintre tag uri
        //daca nu exista, se returneaza un string gol
        
        // adauga o linie de tabel pentru animalul curent
        //pt fiecare animal se construieste un rand 
        html += "<tr>";
        html += "<td>" + id + "</td>";
        html += "<td>" + nume + "</td>";
        html += "<td>" + varsta + "</td>";
        html += "<td>" + tip + "</td>";
        html += "<td>" + greutate + "</td>";
        html += "<td>" + culoare + "</td>";
        html += "<td>" + rasa + "</td>";
        html += "<td>" + proprietar + "</td>";
        html += "<td>" + telefon + "</td>";
        html += "<td>" + email + "</td>";
        html += "<td>" + adresa + "</td>";
        html += "</tr>";
    }
        
        html += "</table>";
        // se inchide tagu ul de tabel

        // in locul mesajului se incarca
        document.getElementById("continut").innerHTML = html;
    })
    .catch(error => 
        {
        console.error("Eroare: " + error.message);
        document.getElementById("continut").innerHTML = "<p>Eroare la încărcarea datelor.</p>";
    });
}



//lab 7 tema 3 a b c  verificare autentificare cu test json
function verificaUtilizator() 
{
    //preluare valori din input-uri
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value.trim();
    //trim - elimina spatiile inutile de la inceput si sfarsit 

    if (!username || !password) 
    {
        //verificare daca sunt completate toate campurile
        //daca nu sunt completate, se va afisa un mesaj de eroare
        document.getElementById("rezultatVerificare").innerHTML = "<p>Completează toate câmpurile!</p>";
        return;
    }

    //se face fetch pentru fis JSON cu utilizatori
    fetch('resurse/utilizatori.json')
        //se face o cerere GET catre fisierul JSON
        .then(response => 
            {
                if (!response.ok) 
                {
                    throw new Error("HTTP error " + response.status);
                }
            //daca raspunsul e ok, se returneaza corpul raspunsului ca text
            //adica continutul fisierului JSON    
            return response.text();
        })
        .then(text => 
            {
                // Convertim textul JSON la un obiect JavaScript
                // JSON.parse - transforma textul JSON in ob js
            var utilizatori = JSON.parse(text);
            //in lista de utilizatori se va salva ob js
            var gasit = false;
            //var ce va fi utilizata pentru a indica daca un utilizator cu numele introdus a fost gasit in lista obtinuta din json

            //parcurge lista de utilizatori

            for (var i = 0; i < utilizatori.length; i++) 
                {
                    //verifica daca utilizatorul introdus exista in lista de utilizatori
                    //daca utilizatorul exista, se verifica parola
                if (utilizatori[i].username === username) {
                    //utilizator - numele de utilizator
                    gasit = true;
                    if (utilizatori[i].parola === password) {
                        //parola - parola utilizatorului
                        //daca parola este corecta, se afiseaza un mesaj de succes
                        document.getElementById("rezultatVerificare").innerHTML = "<p style='color: green;'>Autentificare reușită!</p>";
                    } else {
                        document.getElementById("rezultatVerificare").innerHTML = "<p style='color: red;'>Parolă incorectă!</p>";
                    }
                    break;
                }
            }
            if (!gasit) {
                document.getElementById("rezultatVerificare").innerHTML = "<p style='color: red;'>Utilizatorul nu există!</p>";
            }
        })
        .catch(error => {
            console.error("Eroare: " + error.message);
            document.getElementById("rezultatVerificare").innerHTML = "<p>Eroare la verificarea autentificării.</p>";
        });
}

//preia datele introduse in campurile username si parola, verifica daca sunt completate
//face cerere prin fetch pentru a obtine fisier json 
//conv json la obiect js
//cauta in lista un utilizator al carui nume se potriveste cu cel introdus
//daca gaseste utilizatorul, verifica parola
//afiseaza mesaje in id ul rezutatVerificare