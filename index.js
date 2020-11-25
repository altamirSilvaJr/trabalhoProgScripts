//carregand módulos
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

//criando instância do express
const app = express();

//importando controlers
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");


//importando os models
const Article = require("./articles/Articles");
const Category = require("./categories/Category");
const User = require("./users/User");

//carregando a view
app.set('view engine', 'ejs');

app.use(session({
    secret: 'blablabla', cookie: {maxAge: 60000}
}))

app.use(bodyParser.urlencoded({
    extended:false
}));

app.use(bodyParser.json());

connection
    .authenticate()
    .then(()=>{
        console.log("Conexão feita com sucesso");
    }).catch(()=>{
        console.log(error);
    });

app.use(express.static('public'));
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

//criando a rota principal
app.get("/",(req,res)=>{
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", { articles: articles, categories: categories });
        });
    });
});

app.listen(8080, () =>{
    console.log("RODANDO"); 
});


//craindo a rota para a página de leitura de arquivo
app.get("/:slug", (req, res) => {
    var slug = req.params.slug;

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", { article: article, categories: categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
});

//criando rota para filtrar artigos por categoria
app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }] //join
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                res.render("index", { articles: category.articles, categories: categories});
            });
        }
        else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
});
