var express = require('express');
var app = express();
var data = {};
var data_uri = {};
var id = 0;
var format;
var cors = require('cors'); //on rajoute les CORS

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = process.env.PORT || 3000;  //Si sur le serveur le port existe alors ça prend le port donné, sinon ça prend 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.static('html'));


// route pour ouvrir le fichier html du formulaire à l'entrée
app.get("/formulaire", function(req, res) {
    res.sendfile("index.html");
});

//problème des cors résolu ...?
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

//crée les annotations dans un objet dico json
app.post("/formulaire", function(req, res){
	var body = req.body; // body contient la réponse de la requete
	data[id] = body	 // on stocke le contenu de body dans le dico data
    if (body.URI in data_uri) { // si l'URI est déjà présent, ona jote son annotation 
        data_uri[body.URI].push(id)	;		
    }
    else {
        data_uri[body.URI] = [id]; // si l'URI est nouveau, on crée une nouvelle entrée
    }
	res.send("votre annotation a été sauvegardé à l'identifiant "+id+" !"); //on envoie la réponse au client
    id++;
    console.log("data",data)
    console.log("data uri",data_uri)
});


//-------------------------- récupérer 1 annotation
//Reçoit le formulaire et redirige vers une page  avec comme route l'identifiant
app.get("/annotation", function(req, res){
    const id = req.query.IdAnnot; // récupère l'identifiant de l'annotation demandée
    format = req.query.FormatIdAnnot; // récup le format souhaité pour voir l'annnoataion
    res.redirect(`/annotation/${id}`) // redirige vers une page avec l'annotation et l'identifiant dans la route
});

//lance la page de l'annotation correspondante avec son identifiant
app.get("/annotation/:IdAnnot", function(req, res){
    const id = req.params.IdAnnot // Récupérer l'identifiant de l'utilisateur depuis la requête POST    
    
    var Exist=Object.keys(data).includes(id); //bool qui vérifie si la variable id est une clé existante de l'objet data.
    var ChoixFormat=format;

	if (ChoixFormat=="html"){ //si on sélectionne html:
		res.set('Content-Type', 'text/html'); // indique que le contenu de la réponse est en HTML.
        if (Exist){ 
            let html = "<h2>Annotation correspondante à l'identifiant " + id + " :</h2><br>"; 
            // on crée la variable html qui contient id et URI et note et commentaire de l'annotation demandée
            html += "<p><strong>URI=</strong>" + data[id].URI + "<br><strong>Note=</strong>" + data[id].Note + "<br><strong>Commentaire=</strong>" + data[id].Commentaire + "</p>"
            res.send(html); // on envoie la réponse qui est la variable html
        }
        else {
            res.send("Aucune annotation n'est associée à cette clé"); 
        }
	}
	else {
		if (ChoixFormat=="Json"){
            res.set('Content-Type', 'application/json'); // indique que le contenu de la réponse est au format json.
            if (Exist){
                //on peut directent renvoyer data[id] car c'est déjà un objet au format json
                res.send(data[id]); //on renvoie data[id]
            }
            else {
                res.send("Aucune annotation n'est associée à cette clé");
            }
		}	
	}
	
});
//-----------------------------------



//----------------------------------- récupérer toutes les annotations de 1 URI
//Reçoit le formulaire et redirige vers une page  avec comme route l'uri
app.get("/URI", function(req, res){
    const uri = req.query.recupUri; //récupère la valeur de l'identifiant de l'URI demandée
    format = req.query.FormatIdAnnot; // récup le format souhaité pour voir l'annnoataion
    res.redirect(`/URI/${uri}`); // redirige vers une avec l'identifiant de l'URI dans la route
});

app.get("/URI/:recupUri", function(req, res){
    const uri = req.params.recupUri;

    var Exist=Object.keys(data_uri).includes(uri); //bool qui vérifie si la variable id est une clé existante de l'objet data.
    var ChoixFormat=format; //choix du format des données

    if (ChoixFormat=="html"){ // si le choix demandé est html
		res.set('Content-Type', 'text/html'); // indique que le contenu de la réponse est en HTML.
        if (Exist){
            let html = "<h2>Annotation correspondante à l'URI " + uri + " :</h2><br><ul>"; // on crée la variable réponse html qui va contenir la liste des annotations de l'URI
            for (key in data){ //on parcourt toute la data
                if (data[key]["URI"]==uri){ // si la clé de l'élement est le meme URI que demandé :
                    html += '<li><strong>Identifiant=</strong>' + key +'  <strong>Note=</strong>'+ data[key].Note +'  et <strong>Commentaire=</strong>'+ data[key].Commentaire +'</li>';
                }
            }
            res.send(html); // on envoie en réponse la variable html qui contient toutes les annotations de l'URI demandé
         }
         else {
            res.send("Aucune annotation n'est associée à cette clé");
         }
	}
	else {
		if (ChoixFormat=="Json"){ //cas où l'on choisit du json
            res.set('Content-Type', 'application/json');// indique que le contenu de la réponse est au format json

            tab_result = {}; //on crée un tableau réésultat
            let i = 0;
            if (Exist){
                for (key in data){
                    if (data[key]["URI"]==uri){//on ajoute dans le tableau si l'uri demandé == l'uri de l'élément de l'itération
                        tab_result[i] = {"IdAnnotation" : key, "Note" : data[key]["Note"], "Commentaire" : data[key]["Commentaire"]};
                        i++;
                    }
                }
                res.send(tab_result); // on renvoie le tableau json

             }
             else {
                res.send("Aucune annotation n'est associée à cette clé");
             }
		}	
	}
});



//Affiche toutes les annotations qui ont été crée
app.post('/recupAll', (req, res) => { // si on recoit une requete post avec la route /recupeALL, voilà ce qu'il se passe.
    var ChoixFormat = req.body.FormatIdAnnot; //on récupère dans la requete, le format d'annotation demandé
    if (ChoixFormat=="html"){ // si le format est html : 
        res.set('Content-Type', 'text/html'); // on met en paramètre que la reponse de la requete sera du html
        let html = '<h2>Toutes les annotations:</h2><br><ul>'; // on créer une variable html qui est la réponse de la requete

        for (let key in data) { // on va parcourir tout le dico data
            //on ajoute à html, tous les identifiants et notes et commentaires
            html += '<li>Identifiant=' + key +'  Note='+ data[key].Note +'  et Commentaire='+ data[key].Commentaire +'</li>';
        }
        html += '</ul>';
        res.send(html);// on envoie la réponse html
        }
	else {
		if (ChoixFormat=="Json"){ // si on veut du json : 
            res.set('Content-Type', 'application/json'); // on met en paramètre que la réponse envoyée va être du json
            res.send(data);//on peut directement renvoyer data car c'est un objet json déjà
		}	
	}
})



app.listen(port, function() { // démarre le serveur
    console.log('serveur listening on port : '+port)
});