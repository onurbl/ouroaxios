const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const cheerio = require('cheerio');
const fs = require('fs');

const alunoJar = new tough.CookieJar();
const professorJar = new tough.CookieJar();

const alunoClient = wrapper(axios.create({ jar: alunoJar, withCredentials: true }));
const professorClient = wrapper(axios.create({ jar: professorJar, withCredentials: true }));

async function liberarProvaComoProfessor(curso, aula) {
  // Login professor
  await professorClient.get('http://192.168.0.125/index.php?pag=login');
  await professorClient.post('http://192.168.0.125/logar.php?acao=logar', {
    aluno: 'PROFESSOR_LOGIN',
    senha: 'PROFESSOR_SENHA'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: [(data) => Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')]
  });

  // Libera prova (simula clique no botão)
  await professorClient.get(`http://192.168.0.125/index.php?pag=professor&secao=liberaaula&curso=${curso}&aula=${aula}`);
}

async function acessarProvaComoAluno(curso, aula) {
  // Login aluno
  await alunoClient.get('http://192.168.0.125/index.php?pag=login');
  await alunoClient.post('http://192.168.0.125/logar.php?acao=logar', {
    aluno: '0056290',
    senha: '2008'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: [(data) => Object.entries(data).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')]
  });

  // Acessa prova
  const resp = await alunoClient.get(`http://192.168.0.125/index.php?pag=aluno&secao=teste&curso=${curso}&aula=${aula}`);
  fs.writeFileSync('prova.html', resp.data, 'utf8');
  console.log('HTML da prova salvo em prova.html');
}

async function main() {
  const curso = '163';
  const aula = '1';
  await liberarProvaComoProfessor(curso, aula);
  await acessarProvaComoAluno(curso, aula);
}

main();