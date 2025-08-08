const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('prova.html', 'utf8');
const $ = cheerio.load(html);

const perguntas = [];
$('#formTeste .pergunta').each((i, el) => {
  const enunciado = $(el).find('h3').text().trim();
  const id = $(el).find('input[type="hidden"]').attr('value');
  const alternativas = [];
  $(el).find('input[type="radio"]').each((j, radio) => {
    const valor = $(radio).attr('value');
    const texto = $(radio).next('label').find('.resposta').text().trim();
    alternativas.push({ valor, texto });
  });
  perguntas.push({ enunciado, id, alternativas });
});

console.log(JSON.stringify(perguntas, null, 2));