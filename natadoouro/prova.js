const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const prompt = require('prompt-sync')();

const alunoJar = new tough.CookieJar();
const alunoClient = wrapper(axios.create({ jar: alunoJar, withCredentials: true }));

async function enviaRespostas() {
  const curso = prompt('Digite o código do curso: ');
  const aula = prompt('Digite o número da aula: ');

  // Login do aluno
  await alunoClient.get('http://192.168.0.125/index.php?pag=login');
  await alunoClient.post('http://192.168.0.125/logar.php?acao=logar', {
    aluno: '0056290',
    senha: '2008'
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: [(data) => Object.entries(data)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')]
  });

  const respostas = {
    'id[0]': '31287', 'p[0]': '1',
    'id[1]': '31290', 'p[1]': '1',
    'id[2]': '31288', 'p[2]': '1',
    'id[3]': '31289', 'p[3]': '1',
    'id[4]': '31286', 'p[4]': '1',
    'id[5]': '31291', 'p[5]': '1',
    'perguntas': '6',
    'enviado': 'sim'
  };

  const resp = await alunoClient.post(
    `http://192.168.0.125/index.php?pag=aluno&secao=teste&curso=${curso}&aula=${aula}&acao=avalia`,
    respostas,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: [(data) => Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')]
    }
  );

  console.log('Respostas enviadas!');
  console.log(resp.data);
}

enviaRespostas();
