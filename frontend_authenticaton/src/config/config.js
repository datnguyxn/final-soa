import express from 'express';
import morgan from 'morgan';
import ejs from 'ejs';
import {fileURLToPath} from 'url';
import * as path from 'path';
import flash from 'express-flash';
import session from 'express-session';

const config = (app) => {
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
    app.use(
      session({
        resave: true,
        saveUninitialized: true,
        secret: "yash is a super star",
        cookie: { secure: false, maxAge: 14400000 },
      })
    );

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    const __filename = fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename).slice(0, -13)
    const __dirname = process.cwd() + "/src/";
    app.use(express.static(path.join(__dirname, 'public')))
    console.log(__dirname);
    app.set('views', path.join(__dirname, 'view'))
    app.use(flash());

    app.use('/favicon.ico', express.static('./src/public/favicon.ico'));
    app.use(morgan('combined'));
}

export default config;