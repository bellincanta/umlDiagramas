// Ponto de entrada usado pela Vercel para rodar a API como uma Serverless
// Function. A Vercel detecta qualquer arquivo dentro de `api/` e o expõe
// como uma função; aqui simplesmente reaproveitamos o app Express já
// existente (ver src/app.ts). O roteamento de todas as URLs para cá é feito
// pelo rewrite configurado em vercel.json.
import "dotenv/config";
import { createApp } from "../src/app.js";

export default createApp();
