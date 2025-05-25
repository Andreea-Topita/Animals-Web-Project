//daca exista canvas , se apeleaza functia de desenare
drawInitialRectangle();

//date despre sistem
function section1(){
    let date= new Date();
    //interval de o secunde pt a actualiza ora
    setInterval(updateDate,1000);

    document.getElementById("date").innerHTML= date;

    //url complet
    document.getElementById("url").innerHTML = '<b> Adresă URL: </b>' + window.location.href;

    //hostname si pathname 
    document.getElementById("locationInfo").innerHTML ='<b> Locația curentă: </b>' + window.location.pathname;

    //browser si versiune
    document.getElementById("browser").innerHTML ='<b> Nume și versiunea browser: </b>' + window.navigator.userAgent;

    //sistemul de operare 
    document.getElementById("os").innerHTML ='<b>Sistem de operare folosit: </b>' + window.navigator.platform ;

}

//se apeleza la fiecare secunda pentru a actualiza elementul cu id "date"
function updateDate(){
    let date= new Date();


    const dateElem = document.getElementById("date");
    if (dateElem) {
        dateElem.innerHTML = date;
    } else {
        //daca elementul cu id "date" nu este gasit, afisam un mesaj de avertizare
        // si iesim din functie
        console.warn("Elementul cu id 'date' nu a fost găsit. Funcția updateDate() nu va continua.");
    }
}

//desenare pe canvas
//deseneaza o imagine cand see incarca pagina
function drawInitialRectangle() {

    const myCanvas = document.getElementById("myCanvas");
    if (!myCanvas) {
        //daca elementul canvas nu este gasit, afisam un mesaj de avertizare
        // si iesim din functie
        console.warn("Elementul canvas cu id 'myCanvas' nu a fost găsit. Se omite desenarea.");
        return;
    }
    const ctx = myCanvas.getContext("2d");

    ctx.fillStyle = "#403040"; 
    ctx.strokeStyle = "#ff00ee";
    
    //nou obiect imagine 
    let img= new Image();
    img.src = "imagini/pisica_incom.png"

    //desenam imaginea pe canvas
    img.onload = function () {
        ctx.drawImage(img, 0, 0, myCanvas.width, myCanvas.height);

    //dreptunghi
    //ctx.fillRect(50, 50, 100, 50); 
    //conturul dreptunghiului
    //ctx.strokeRect(50, 50, 100, 50); 
    };
}

//pt primul click si al doilea click
var cnt=0;
var x1,x2,y1,y2;

//se apleaza la click pe canvas si deseneaza o figura

function draw(event){
    cnt++; //incremenatare la fiecare click pe canvas

    const myCanvas = document.getElementById("myCanvas");
    const ctx = myCanvas.getContext("2d");

    //obtinem coordonatele canvas-ului
    const coord= document.getElementById("myCanvas").getBoundingClientRect();
    ctx.fillStyle = "blue";
    //culoare implicita pt umplere


    let x=event.clientX;
    let y=event.clientY;
    //valoarea selectate pentru forma de desen, drept sau cerc
    let shape = document.querySelector('input[name="shape"]:checked').value;

    //stocam coordonatele click-ului in variabilele x1, y1, x2, y2
    //x1,y1 sunt coordonatele primului click
    if ( cnt % 2 ==1)
    {
        x1= x-coord.x;
        y1= y-coord.y;
    }

    //la al doilea click, calculaam lat si inalt drept sau diametrul cercului
    if( cnt % 2 == 0)
    {
        x2 = x-coord.x;
        y2 = y-coord.y;

        let width= x2-x1;
        let height= y2-y1;

        let fillColor = document.getElementById("fillColor").value;
        let contColor = document.getElementById("favcolor").value;

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = contColor;

        //ctx.fillRect(x1,y1,width,height);
        //ctx.strokeRect(x1,y1,width,height);
        
        if (shape === "rectangle") {
            //drept cu umplere si contur
            ctx.fillRect(x1, y1, width, height);
            ctx.strokeRect(x1, y1, width, height);
            
        } else if (shape === "circle") {
            //cerc
            //raza cercului 
            let radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;
            let centerX = x1 + width / 2;
            let centerY = y1 + height / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); //desenare cerc
            ctx.fill();
            ctx.stroke();
        }

    }
}

//inserare de randuri si coloane in tabel
function insertRow() {

    let position = document.getElementById("position").value;
    let bgColor = document.getElementById("bgColor").value;
    let table = document.getElementById("myTable");
    
    //poz
    if (position < 1) {
        alert("Poziția nu poate fi mai mică de 0!");
        return;
    }

    //rand nou la pozotoa specificata
    let newRow = table.insertRow(position);

    //adaugam celule in rand
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        let newCell = newRow.insertCell(i);
        
        //culoarea de fundal
        newCell.style.backgroundColor = bgColor; 
        newCell.style.padding = "6px";
    }
}

function insertColumn() {
    let position = document.getElementById("position").value;
    let bgColor = document.getElementById("bgColor").value;
    let table = document.getElementById("myTable");

    //poz
    if (position < 1) {
        alert("Poziția nu poate fi mai mică de 0!");
        return;
    }

    //adaugam celule in coloana
    for (let i = 0; i < table.rows.length; i++) {
        let newCell = table.rows[i].insertCell(position);

        //culoarea de fundal
        newCell.style.backgroundColor = bgColor; 
        newCell.style.padding = "6px";
    }
}

//lab 7 tema 3 ultimul punct
//functie ascrincrona pt a inregistrarii utilizatorului
//se va apela la click pe butonul de inregistrare
async function trimiteInregistrare() 
{
    //colectează valorile din formular 
    //trim elimina spatiile in exces de la inceput si sfarsit
    const nume = document.getElementById("nume").value;
    const prenume = document.getElementById("prenume").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const telefon = document.getElementById("telefon").value;
    const sex = document.getElementById("sex").value;
    const animal_pref = document.getElementById("animal_pref").value;
    const culoare = document.getElementById("color").value;
    const data_nasterii = document.getElementById("data_nasterii").value;
    const ora_nasterii = document.getElementById("ora_nasterii").value;
    const varsta = document.getElementById("varsta").value;
    const pagina_pers = document.getElementById("pagina_pers").value;
    const descriere = document.getElementById("descriere").value.trim();

    //campurile sunt accesate corect si formularul are datele dorite
    console.log(nume, prenume, username, password, email, telefon, sex, animal_pref, culoare, data_nasterii, ora_nasterii, varsta, pagina_pers, descriere);
    
    //verificare pt campurile esentiale
    if (!username || !password) {
        document.getElementById("rezultatInregistrare").innerHTML = "<p style='color:red;'>Completează câmpurile obligatorii!</p>";
        return;
    }
    
    try {
        //pregateste obiectul care contne toate datele de inregistrare
        // va fi convertita ulterior in json

        //post folosind fetch la api utilizatori catre server 

        // post, headers content type application json 
        // body e convertit intr un string json
        //await pt a astepta finalizarea cererii in mod asicron
        const response = await fetch('/api/utilizatori', 
            {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                //indicam serverului ca datele trimise sunt in format json
            },
            //conv obiect js  cu datele din formular intr un string json
            body: JSON.stringify({
                nume: nume,
                prenume: prenume,
                username: username,
                parola: password,
                email: email,
                telefon: telefon,
                sex: sex,
                animal_pref: animal_pref,
                culoare: culoare,
                data_nasterii: data_nasterii,
                ora_nasterii: ora_nasterii,
                varsta: varsta,
                pagina_pers: pagina_pers,
                descriere: descriere
            })
        });
        
        //verificam daca raspunsul este ok
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
    
        //asteptam convertirea raspunsului serverului in text
        const text = await response.text();
        //afisam mesaj de succes 
        document.getElementById("rezultatInregistrare").innerHTML = "<p style='color:green;'>" + text + "</p>";
    } catch (error) 
    {
        //daca apare eroare in timpul cererii, afisam in consola eroarea
        console.error("Eroare la înregistrare:", error.message);
        document.getElementById("rezultatInregistrare").innerHTML = "<p style='color:red;'>Eroare la înregistrare.</p>";
    }
}
