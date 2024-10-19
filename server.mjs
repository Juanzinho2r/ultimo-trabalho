// Renomeie o arquivo para server.mjs ou adicione "type": "module" no seu package.json

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv'; // Importar dotenv para variáveis de ambiente

dotenv.config(); // Carregar variáveis de ambiente do .env

const app = express();
const PORT = 3000;

// Middleware para analisar o corpo da requisição
app.use(express.json());
app.use(express.static('public')); // Para servir arquivos estáticos da pasta 'public'

// Rota raiz
app.get('/', (req, res) => {
    res.send('Bem-vindo ao meu servidor! Use a rota /ask para fazer perguntas.');
});

// Rota para lidar com perguntas
app.post('/ask', async (req, res) => {
    const question = req.body.question;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Usar variável de ambiente para a chave API
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: question }]
            })
        });

        // Verifica se a resposta é bem-sucedida
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na resposta da API: ${errorText}`);
        }

        const data = await response.json();

        // Verifica se a estrutura esperada está presente na resposta
        if (data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content;
            res.json({ answer });
        } else {
            res.status(500).send('Resposta inesperada da API');
        }
    } catch (error) {
        console.error('Erro ao chamar a API:', error);
        res.status(500).send('Erro ao buscar resposta');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
