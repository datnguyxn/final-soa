import express from 'express';
import morgan from 'morgan';
import ejs from 'ejs';
import {fileURLToPath} from 'url';
import * as path from 'path';

const config = (app) => {
    app.engine('ejs', ejs.renderFile);
    app.set('views engine', 'ejs');

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename).slice(0, -6)
    app.set('views', path.join(__dirname, 'views'))

    app.use(morgan('combined'));
}
export default config;