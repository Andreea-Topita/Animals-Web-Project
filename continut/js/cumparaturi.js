//izolare cod intr un bloc IIFE - immediately invoked function expression
// variabilele declare in interiorul iife nu sunt accesibile in afara acestuia
// se foloseste pentru a nu afecta spatiul global si nu vor fi redeclarate la o noua incarcare
//toate variabilele si functiile sunt izolate , evita conflictele cu alte scripturi
//previne redeclararile accidentale , tot codul e local 

(function() {
    //1) creare worker global
    //creare worker daca nu exista deja
    //verificam daca worker-ul exista deja in fereastra curenta
     if (!window.myWorker) {
        //verficam daca exista my worker in window, daca nu exista, creeaza nou worker
        window.myWorker = new Worker("js/worker.js");
        //web worker - permite rularea unor scripturi in fundal, separat de firul principal de executie, astfel incat aplicatia nu se blocheaza in timpul efectuarii unor operatii
        //pt comportament asicron
    }

    //2) cand worker trimite mesaj inapoi 
    //de tip callback deoarece se apeleaza automat cand se primeste un mesaj de la worker
    //event contine datele trimite de worker 
    myWorker.onmessage = (event) => {
        //setare handler pentru mesaje de la worker
        console.log("Mesaj de la worker:", event.data);
        //recuperam lista din localStorage si actualizam tabelul , lista stocata la cheia listaCumparaturi
        //let listaProduse = localStorage.getItem("listaCumparaturi");
        // daca exista date le transf din json in obiect java script , daca nu se foloseste array gol
        //listaProduse = listaProduse ? JSON.parse(listaProduse) : [];
        //afiseazaListaProduse(listaProduse);
        //pt a reface si afisa tabelul de cumparaturi din interfata utilizator
        //recupereaza datele salvaate anterior in local storage pt a fi afisa te in ui , mentinnand sincronizarea

        //manager de stocare, obtine lista de produse prin metoda aleasa
        //dupa ce promisiunea e rezolvata se apeleaza afiseazaListaProduse pt actualizarea tabelului
        getStorageManager().getList()
            .then(listaProduse => afiseazaListaProduse(listaProduse))
            .catch(error => console.error("Eroare la actualizare, getList:", error));
    };

   //3) clasa produs 
    class Produs 
    {
        //model pentru obiectele de tip produs
        constructor(id, nume, cantitate) 
        {
            this.id = id;           
            this.nume = nume;      
            this.cantitate = cantitate; 
        }
    }

    //TEMA 3 LAB 8
    //clasa de baza pentru stocare
    class StorageManager {
        constructor() {}
        //sa ofere interfata si sa permita clasei derivate sa o extinda

        //defineste "contractul" pentru metodele getList() si saveProduct()
        //care vor fi implementate in clasele derivate
        getList() {
          throw new Error("Metoda getList() nu este implementată!");
        }
        saveProduct(produs) {
          throw new Error("Metoda saveProduct() nu este implementată!");
        }
      }

    //clasa local storage care extinde StorageManager
    class LocalStorageManager extends StorageManager {
        constructor() {
          super();
          this.key = "listaCumparaturi"; //cheia sub care salveaza datele in localStorage
        }
        getList() {
          //recupereaza listaasociata cheii din localStorage
          const lista = localStorage.getItem(this.key);
          //daca exsita date,ia lista si o face de tip json, le parseaza din json, altfel, returneaza un array gol
          //returneaza o promisiune care se rezolva cu lista de produse
          return Promise.resolve(lista ? JSON.parse(lista) : []);
      }
      //salveaza produsul in localStorage
      saveProduct(produs) {
          return this.getList().then(lista => {
            //daca produsul are id null, se genereaza un id nou
              if (!produs.id) {
                //daca e fals produs.id , daca nu are id setat , generam unul nou
                //lista lenght : daca lista e goala , daca e , noul produs va primit id ul 1
                // lista nu e goala : se extrage id ul ultimului produs, se adauga 1, si astfel noul produs are id incrementat
                  const newId = lista.length === 0 ? 1 : lista[lista.length - 1].id + 1;
                  produs.id = newId;
              }
              //se adauga produsul in lista
              lista.push(produs);
              //se salveaza lista actualizata in local storage sub forma unui sir json
              //transforma obiectul java s intr un sir de caractere json
              //this.key - cheia asociata valorii stocate, adica listaCumparaturi
              localStorage.setItem(this.key, JSON.stringify(lista));
              //returneaza lista actualizata pentru actualizarea interfetei
              console.log("Produs adăugat în localStorage:", produs);
              return lista;
          });
      }
    }
    //local storage pentru a salva si recupera lista , getList citeste datele si le returneaza ca promise, 
    //sava - resalvare intregii liste , datele raman chiar si dupa reincarcarea paginii
    
    //indexed db manager 
    class IndexedDBManager extends StorageManager {
      //
        constructor() {
          super();
          this.dbName = "CumparaturiDB"; //nume 
          this.storeName = "produse"; // nume obiect
          this.dbVersion = 1; //? versiune, utila pentru upgrade
          this.dbPromise = this.openDB(); // initializeaza conexiunea la db
        }
        openDB() {
          //deschide baza de date si se ocupa de upgrade (creare store ului)
          return new Promise((resolve, reject) => {
            //returneaza o promisiune care se rezolva cu baza de date deschisa
              const request = indexedDB.open(this.dbName, this.dbVersion);
              //creaza cerere pentru a deschisa baza de date cu versiunea buna
              request.onupgradeneeded = (e) => {
                //daca baza de date s a schimbat si trebuie sa se faca actualizari ale bazei de date
                  const db = e.target.result;
                  //instanta bazei care a fost deschisa
                  //verifica daca obiectul de stocare produse exista deja
                  if (!db.objectStoreNames.contains(this.storeName)) {
                    //creeaza un obiect de stocare cu numele dat , daca nu exista deja
                    //id generat automat, incrementandu se pt fiecare obiect
                      db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
                  }
              };
              //cand baza de date e deschisa cu succes, promise ul se rezolva cu instanta bazei de date ( e.taget.result)  
              request.onsuccess = (e) => resolve(e.target.result);
              //daca apare eroae, promise ul se respinge cu eroarea
              request.onerror = (e) => reject(e.target.error);
          });
      }
      //metoda care obtine lista de produse din baza de date
      //returneaza o promisiune care se rezolva cu lista de produse
      getList() {
          return this.dbPromise.then(db => {
            //asteapta ca baza de date sa fie deschisa si apoi executa operatiuni asupra acesteia
              return new Promise((resolve, reject) => {
                //creeaza o tranzactie pentru a accesa store ul produse in mod read-only
                  //transaction - permite sa se faca operatiuni asupra bazei de date
                  const transaction = db.transaction(this.storeName, "readonly");

                  //obtine referinta la obiectul de stocare produse
                  const store = transaction.objectStore(this.storeName);

                  //initiaza o cerere de a citi toate obiectele din store
                  const request = store.getAll();

                  //daca e ok, rezolva promise ul cu rezultatul ( o lista cu toate obiectele)
                  request.onsuccess = (e) => resolve(e.target.result);
                  request.onerror = (e) => reject(e.target.error);
              });
          });
      }
      //salveaza produs nou in store
      saveProduct(produs) {
        //deschide tranzactie pt produse in mod readwrite
          return this.dbPromise.then(db => {
              return new Promise((resolve, reject) => {
                  const transaction = db.transaction(this.storeName, "readwrite");

                  //pt a insera date noi in store, se obtine referinta la store ul produse
                  const store = transaction.objectStore(this.storeName);

                  //elimina id' daca e null/undefined, sa permita autoincrement
                  const produsPentruAdaugare = { ...produs };
                  //creeaza copie produs folosind operator de dispersie ... 
                  // ... -  creeaza o copie a obiectului produs
                  if (produsPentruAdaugare.id == null) {
                    //verifica daca proprietatea id e null sau undefined
                    //daca id nu e definit, se sterge pentru a permite autoincrementarea
                      delete produsPentruAdaugare.id;
                  }
                  //adaugam produsul in store , add foloseste autoincremenet, daca nu exista id in obiect, creaza unul nou
                  const request = store.add(produsPentruAdaugare);
                  request.onsuccess = () => {
                    //lista actualizata a produselor
                      this.getList()
                      .then(resolve)
                      .catch(reject);
                  };
                  request.onerror = (e) => reject(e.target.error);
              });
          });
      }
  }
  //open db deschide sau creeaza baza de date si se asigura ca exista un object store numit produse
  //get list - read only pentru a prelua toate inregistrarile din indexed db
  //save - read write pentru a adauga un produs nou in baza de date, elimina id daca e null pentru a permite autoincremenet , reia lista completa pentru a o returna


    //fct de get storage manager - returneaza un obiect StorageManager corespunzator alegerii utilizatorului
    function getStorageManager() {
      const storageChoice = document.getElementById("storageChoice").value;
      if (storageChoice === "localStorage") {
          return new LocalStorageManager();
      } else {
          return new IndexedDBManager();
      }
  }

    //4) functia care salveaza produsul in localstorage si intoarce un  promise cu lista actualizata
    function salvareProdus(numeProdus, cantitateProdus) {
        return new Promise((resolve, reject) => {
            try {
                //se obtine lista de produse din localStorage
                //daca nu exista, se initializeaza cu un array gol
                //let listaProduse = localStorage.getItem("listaCumparaturi");
                //listaProduse = listaProduse ? JSON.parse(listaProduse) : [];
                
                //cream un nou obiect Produs
                //daca produsul exista deja, il actualizam
                const storageChoice = document.getElementById("storageChoice").value;
                //undefined pentru indexed db pentru a permite autoincrement
                const initialId = (storageChoice === "indexedDB") ? undefined : null;

                //produs nou folosind clasa produs
                const produsNou = new Produs(initialId, numeProdus, cantitateProdus);
                //se obtine managerul de stocare corespunzator (local sau index)
                const storageManager = getStorageManager();

                //const produsNou = new Produs(null, numeProdus, cantitateProdus);
                // apelam storeManager pentru a salva produsul
                //in functie de alegerea facuta, se va salva in localStorage sau IndexedDB
                storageManager.saveProduct(produsNou)
                //salvare produs in mediul ales
                    .then(listaProduse => {
                      //ataseaza handler pentru rezolvare promise ului returnat 
                        console.log("Produsul a fost salvat cu succes:", produsNou);
                        //la succes, ofera ca rezultat lista actualizata de produse ( lista produse ) dupa adaugarea noului produs 
                        resolve(listaProduse);
                    })

                    .catch(error => reject(error));
                } catch (error) {
                reject(error);
                }
                //functie sageata care primeste lista produse ca argument si executa anumite actiuni
                //storagechoice - local storage sau indexedDB 



                //verificam daca produsul exista deja in lista
                //determinam id ul produsului bazat pe nr de produse deja existente 
                //const id = listaProduse.length + 1;

                
                //adaugam produsul in lista
                //daca produsul exista deja
                //listaProduse.push(produsNou);

                //daca produsul nu exista, il adaugam
                //salveaza lista actualizata in localS sub forma de string json
                //localStorage.setItem("listaCumparaturi", JSON.stringify(listaProduse));
                
                //rezolvam promisiunea cu lista actualizata
                //resolve(listaProduse);

                //} catch (error) {
                 //   reject(error);
                //}
            });
          }
    
        //5) functi apelata cand face click pe adauga
        //window - pt a avea siguranta  ca functia e disponibila global , functia devine globala
        //atribuite functie anonima proprietatii adaugaProdus din obiectul global window
        window.adaugaProdus = function() {
          //extragem valorile introduse in formular

            const numeProdus = document.getElementById("numeProdus").value.trim();
            const cantitateProdus = document.getElementById("cantitateProdus").value.trim();
        
            //validari ca ambele sunt completate
            if (!numeProdus || !cantitateProdus) {
              alert("Te rugam să completezi ambele câmpuri!");
              return;
            }
        
            //apeleaza functia salvareProdus , trecand ca parametru valorile extrase din formular
            salvareProdus(numeProdus, cantitateProdus)
            //then se executa dupa ce promise e rezolvat cu succes
            .then(listaProduse => {
              //returneaza promise care va contine lista actualizata de produse dupa salvare
              //handler pt momentul in care promise se rezolva cu succes

                console.log("Notific worker-ul: Adauga produs nou");
                //notificam worker-ul ca s a adaugat un produs nou
                myWorker.postMessage("Adauga produs nou");
                //afiseaza in consola pentru a indica ca produsul a fost salvat 
                //trimite mesaj catre worker pt a notifica 
        

                //actualizam  tabelul  cu lista de produse
                afiseazaListaProduse(listaProduse);
        
                //reset formular pt a permite introducerea unui nou produs
                //reseteaza golind campurile de input
                document.getElementById("formularCumparaturi").reset();
            })
            .catch(error => {
                console.error("Eroare la salvare:", error);
                alert("Eroare la salvarea produsului.");
            });
        };
        //extragem valorile introduse
        //apelam functia care returneaza o promisiune, odata rezolvata se : notifica workerul ca a fost adaugat un produs nou 
        //actualizma interfata si se reseteaza formularul pt o noua intrare
        //cand utilizatorul apasa adauga
        //dupa ce produsu e salvat, notifica workerul
        //gest erorile aparute in timpul salvarii
    
      //6) Funcția de afisare a listei in tabel
      function afiseazaListaProduse(listaProduse) {
        // pentru a selecta elementul tbody al tabelului cu id ul 
        const tbody = document.querySelector("#listaCumparaturi tbody");
        tbody.innerHTML = "";
        //seteaza probab la sir gol
        listaProduse.forEach(produs => {
          //parcurge fiecare element al array ului listaProduse. 
          //pt fiecare produs se apeleaza functia de aici, care adauga randuri
            const rand = `
            <tr>
              <td>${produs.id}</td>
              <td>${produs.nume}</td>
              <td>${produs.cantitate}</td>
            </tr>
          `;
          //sir de caractere ' ' care reprezinta un rand de tabel cu trei celule
          //$produs.is - valoarea proprietatii id a obiectului produs
          //$produs cantitate - insereaza cantitatea produsului
          tbody.innerHTML += rand;
          //adauga sirul de caractere la continutul existent al elementului tbody
            //in acest fel, se creeaza un rand de tabel pentru fiecare produs din lista 
            // fiecare rand contine id ul, numele si cantitatea produsului
        });
      }
    
      // 7)Initial la incarcarea paginii „cumparaturi.html”,
      //incarcam ce era in localStorage 
    // function initListaProduse() {
    //     //obtine din localStorage valorile stocate sub cheia "listaCumparaturi"
    //     //daca nu exista, se initializeaza cu un array gol
    //     let listaProduse = localStorage.getItem("listaCumparaturi");
    //     //daca exista, se parseaza din JSON in obiect JavaScript
    //     listaProduse = listaProduse ? JSON.parse(listaProduse) : [];
    //     //se asigura ca listaProduse este intotdeauna un array chiar daca nu exista date salvate inca
    //     //apeleaza functia si ii transmite array ul listaProduse 
    //     //se asigura ca tabelul e actualizat cu datele disponibile
    //     afiseazaListaProduse(listaProduse);
    //   }
    
    //incarca lista de produse deja salvate in stocare, localstorage sau idb, si le afiseaza
    function initListaProduse(){
    
      const storageManager = getStorageManager();
      //returneaa promise ce se rezolva cu lista de produse deja slavate
      storageManager.getList()
      //handler then la promise returnat, cand se rezolva, contine array ul de produse obtinut din stocare
      .then(listaProduse => afiseazaListaProduse(listaProduse))
      //dupa ce lista e recuperata, se afiseaza 

      .catch(error => console.error("Eroare la inițializare:", error));
      }
      
      
       //8) Apelam init ca sa fie totul setat
      //la momentul incarcarii paginii si a iife se initializeaza lista de produse , asigurand ca ddatele salvate in local storage sunt afisate imediat
      initListaProduse();
    })();
//IIFE se executa,worker e creat si initListaProduse e apelat
//se obtine managerul ales si se preia lista de produse care se afiseaza in tabel
//adauga produs preia inputurile, valideaza datele si apeleaza salvare produs
//salvare produs creeaza un nou obiect produs , apeleaza save product a menagerului
//dupa salvare, se notifica workerul , se actualizeaza tabela cu produse noi, iar formularul se reseteaza

//workerul : la primirea unui mesaj, trimite inapoi un mesaj
//get list pentru a reincwrca datele