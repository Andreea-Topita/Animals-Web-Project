//self - reprezinta contextul workerului, adica un thread separat care ruleaza in fundal
// se refera la ob global al workerului , in web worker nu ai acces la window, dar ai acces la obiectul self 
self.onmessage = function(event) {
    //worker asculta mesaje de la scriptul principal
    //cand primeste un mesaj, workerul afiseaza un mesaj in consola sa si apoi trimite inapoi un mesaj catre scriptul principal
    //confrimand ca produsul a fost adaugat

    
    //afiseaza in consola mesajul primit
    console.log("Worker: Am primit mesaj: " + event.data);

    //trimite inapoi un mesaj catre scriptul principal
    //confirmand ca produsul a fost adaugat
    self.postMessage("Worker: Produs adăugat!");

    //mecanismul prin care workerul comunica cu scriptul principal din aplicatie
};

//cand apas adauga : se apeleaza adaugaProdus
//preia valorile din inputuri si salveaza produsul in localStorage , notifica workerul si actualizeaza tabelul
//worker: primeste mesaj adauga produs nou, afiseaza un mesaj in consola si trimite mesaj inapoi produs adaugat
//script: la primirea mesajului de la worker, se actualizeaza din nou tabelul, asigurand ca orice modificare in localStorage e reflectata in UI

//localStorage - stocare perechi cheie valoare pe dispozitiv 
//persistent datelor in browser - datele raman in browser chiar si dupa inchiderea acestuia
//sessionStorage - datele sunt stocate doar pentru sesiunea curenta a browserului
//in lS raman disponibile pana cand sunt sterse manual catre utilizator sau de catre aplicatie

//utilizat pentru a salva lista de produse a utilizatorului , daca utilizatorul reincarca pagina, poate fi reincarcata fara a pierde date 
//sau pentru a salva preferinte 