const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const readline = require('readline');
const cheerio = require('cheerio');

const alunoJar = new tough.CookieJar();
const alunoClient = wrapper(axios.create({ jar: alunoJar, withCredentials: true }));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function enviaRespostas() {
  const curso = await ask('Digite o código do curso: ');
  const aula = await ask('Digite o número da aula: ');
  rl.close();

  // Login do aluno
  await alunoClient.get('http://192.168.0.125/index.php?pag=login');
  await alunoClient.post('http://192.168.0.125/logar.php?acao=logar', {
    aluno: '0056290',
    senha: '2008'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: [(data) => Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')]
  });

  // Baixa o HTML da prova
  const respHtml = await alunoClient.get(`http://192.168.0.125/index.php?pag=aluno&secao=teste&curso=${curso}&aula=${aula}`);
  const html = respHtml.data;

  // Extrai perguntas e alternativas do HTML
  const $ = cheerio.load(html);
  const respostas = {};
  let perguntasCount = 0;
  $('#formTeste .pergunta').each((i, el) => {
    const id = $(el).find('input[type="hidden"]').attr('value');
    const alt = $(el).find('input[type="radio"]').first().attr('value'); // Marca sempre a primeira alternativa
    respostas[`id[${i}]`] = id;
    respostas[`p[${i}]`] = alt;
    perguntasCount++;
  });
  respostas['perguntas'] = perguntasCount.toString();
  respostas['enviado'] = 'sim';

  // Envia as respostas
  const resp = await alunoClient.post(
    `http://192.168.0.125/index.php?pag=aluno&secao=teste&curso=${curso}&aula=${aula}&acao=avalia`,
    respostas,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: [(data) => Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')]
    }
  );

  console.log('Respostas enviadas!');
  console.log(resp.data); // Mostra o retorno do servidor
}

enviaRespostas();