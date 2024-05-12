import express from 'express'
import path from 'path'
import handlebars from 'express-handlebars'
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access'
import i18n from 'i18n'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cors from 'cors'
import Handlebars from 'handlebars'
import morgan from "morgan";

const config = (app) => {
    app.engine('hbs', handlebars.engine({
        defaultLayout: 'main',
        extname: '.hbs',
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: {
            ifeq: function (a, b, options) {
                if (a == b) {
                    return options.fn(this)
                }
                return options.inverse(this)
            },
            incrementedIndex: function(index) {
                return index + 1;
            },
            i18n: function(){
                return i18n.__.apply(this,arguments);
            },
            __n: function(){
                return i18n.__n.apply(this, arguments);
            },
            ifRoleIsAdmin: function (role, options) {
                if (role === 'ADMIN') {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            },
            formatDate: function (date) {
                return new Date(date).toLocaleString('vi-VN');
            },
            formatCurrency: function (amount) {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
            },
            equal: function (a, b) {
                return a === b;
            },
            and: function (a, b) {
                return a && b;
            },
            ifor: function(v1, v2, v3, v4,options) {
                if(v1 == v2 || v1 == v3 || v1 == v4) {
                    return options.fn(this);
                }
                return options.inverse(this);
            }
        }
    }));

    app.set('view engine', 'hbs')
    app.set('views', path.join('./src', 'resources/views'))
    i18n.configure({
        locales:['en', 'vi'],
        directory: 'src/locales',
        defaultLocale: 'vi',
        objectNotation: true,
        cookie: 'lang',
    });
    // config static file
    app.use(express.static(path.join('./src', 'public')))
    app.use(bodyParser.urlencoded({
        extended: true
    }));//body parser
    app.use(bodyParser.json()); //bodyparser json
    app.use(cookieParser())
    app.use(express.urlencoded());
    app.use(express.json())
    app.use(cors());
    // app.use(express.static('/src/public/uploads'))
    app.use(session({
        secret: 'my-secret-key',
        resave: false,
        saveUninitialized: false,
    }));

    app.use((req, res, next) => {
        res.header('Cache-Control', 'no-store');
        next();
    });

    app.use((req, res, next) => {
        res.locals.message = req.session.message
        res.locals.orderMessage = req.session.orderMessage;
        res.locals.Posmessage = req.session.Posmessage;
        res.locals.SignUpMessage = req.session.SignUpMessage;

        delete req.session.message
        delete req.session.orderMessage;
        delete req.session.Posmessage;
        delete req.session.SignUpMessage
        next()
    })
    app.use(i18n.init);
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
    });
    app.use(morgan("combined"));
}

export default config;