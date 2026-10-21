// Cada pergunta: faixas de pontos -> respostas separadas por vírgula.
// Quanto mais obscura (menos gente responderia), mais pontos.
export const QUESTIONS = [
  { q: "Cite um país da África", a: {
    10: "Egito,África do Sul,Nigéria,Angola,Moçambique",
    25: "Quênia,Marrocos,Etiópia,Gana,Argélia,Tanzânia,Senegal,Cabo Verde",
    50: "Camarões,Costa do Marfim,Zimbábue,Uganda,Namíbia,Botsuana,Tunísia,Madagascar",
    75: "Mali,Níger,Chade,Gabão,Zâmbia,Malaui,Ruanda,Serra Leoa,Guiné-Bissau",
    100: "Eswatini,Djibuti,Comores,Lesoto,Burundi,Eritreia,São Tomé e Príncipe,Seicheles" } },
  { q: "Cite uma infração de trânsito", a: {
    10: "Avançar o sinal vermelho,Excesso de velocidade,Dirigir embriagado,Estacionar em local proibido",
    25: "Não usar cinto de segurança,Usar celular ao volante,Ultrapassagem proibida,Dirigir sem habilitação",
    50: "Transitar na contramão,Não usar capacete,Parar sobre a faixa de pedestres,Fazer conversão proibida",
    75: "Dirigir sem farol aceso,Transportar criança sem cadeirinha,Buzinar sem necessidade,Estacionar em fila dupla",
    100: "Dirigir com o pisca-alerta ligado,Rodar com som alto,Transportar carga excedente,Dirigir com chinelo?" } },
  { q: "Cite um animal da fauna brasileira", a: {
    10: "Onça-pintada,Arara,Tucano,Capivara,Jacaré",
    25: "Tamanduá-bandeira,Boto-cor-de-rosa,Preguiça,Lobo-guará,Tatu,Anta",
    50: "Mico-leão-dourado,Ariranha,Harpia,Seriema,Quati,Cachorro-do-mato,Jaburu",
    75: "Peixe-boi,Uirapuru,Cuíca,Tamanduaí,Gambá,Cutia,Muriqui,Jacutinga",
    100: "Pirarucu,Tapiti,Soldadinho-do-araripe,Tucuxi,Cuxiú,Sauim-de-coleira,Jupará" } },
  { q: "Cite uma fruta", a: {
    10: "Banana,Maçã,Laranja,Uva,Manga",
    25: "Abacaxi,Melancia,Morango,Mamão,Limão,Pera",
    50: "Jabuticaba,Caju,Goiaba,Acerola,Maracujá,Kiwi,Romã",
    75: "Pitanga,Cupuaçu,Graviola,Jaca,Carambola,Umbu,Fruta-do-conde",
    100: "Bacuri,Cambuci,Sapoti,Camu-camu,Pequi,Cajá,Jenipapo,Araçá" } },
  { q: "Cite uma capital do mundo", a: {
    10: "Paris,Londres,Washington,Brasília,Tóquio,Roma",
    25: "Berlim,Madri,Buenos Aires,Moscou,Pequim,Lisboa,Cairo",
    50: "Ottawa,Camberra,Nova Délhi,Bangkok,Lima,Santiago,Atenas,Hanói",
    75: "Ulan Bator,Katmandu,Montevidéu,Reykjavik,Nairóbi,Tallinn,Quito,Asunção",
    100: "Vanuatu?,Ouagadougou,Tegucigalpa,Nuku'alofa,Valeta,Podgorica,Vaduz,Paramaribo,Funafuti" } },
  { q: "Cite um ritmo ou gênero musical", a: {
    10: "Samba,Rock,Sertanejo,Funk,Pop",
    25: "Forró,Pagode,MPB,Rap,Jazz,Reggae,Axé,Bossa Nova",
    50: "Frevo,Maracatu,Choro,Blues,Tecnobrega,Baião,Country,Ska,Lambada",
    75: "Carimbó,Xote,Coco,Jongo,Samba-reggae,Polca,Vaneirão,Tango,Fado,Mangue beat",
    100: "Lundu,Siriri,Cururu,Catira,Congada,Bumba meu boi,Modinha,Maxixe,Toada,Embolada" } },
  { q: "Cite um esporte olímpico", a: {
    10: "Futebol,Natação,Vôlei,Atletismo,Basquete",
    25: "Judô,Ginástica artística,Tênis,Remo,Boxe,Handebol,Ciclismo",
    50: "Esgrima,Hipismo,Tiro com arco,Surfe,Skate,Levantamento de peso,Badminton,Taekwondo",
    75: "Pentatlo moderno,Saltos ornamentais,Nado artístico,Polo aquático,Luta greco-romana,Hóquei sobre grama,Canoagem slalom",
    100: "Tiro esportivo,Triatlo,Marcha atlética,Arremesso de martelo,Bicicross,Trampolim,Break,Escalada esportiva,Rúgbi de sete" } },
];

export const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export const buildIndex = (q) =>
  Object.entries(q.a).flatMap(([pts, list]) =>
    list.split(",").map((n) => ({ name: n.replace("?", "").trim(), key: norm(n.replace("?", "")), pts: +pts })));

export function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// Sugestões: começa com / contém / parecido (erro de digitação)
export function suggest(index, text) {
  const t = norm(text);
  if (t.length < 2) return [];
  return index
    .map((e) => {
      let s = 99;
      if (e.key.startsWith(t)) s = 0;
      else if (e.key.includes(t)) s = 1;
      else {
        const w = e.key.slice(0, t.length + 1);
        const dist = Math.min(lev(t, e.key), lev(t, w));
        if (dist <= Math.max(1, Math.floor(t.length / 4))) s = 2 + dist;
      }
      return { ...e, s };
    })
    .filter((e) => e.s < 99)
    .sort((a, b) => a.s - b.s)
    .slice(0, 5);
}
