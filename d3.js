const width = 1200;
const height = 500;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

const svg = d3.select('.container')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g')
  .attr('class', 'tudo');

// zoom
svg.call(d3.zoom()
  .extent([[0, 0], [width, height]])
  .scaleExtent([0.5, 5])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  }));

// Desenhar o fundo como um campo de futebol
desenharCampo(g, width, height);
function desenharCampo(svg, width, height) {
  const field = svg.append('g')
    .attr('class', 'field');

  // campo
  field.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#3a8c3e'); // verde gramado

  const campoLarg = width * 0.9; // limitar o campo
  const campoAlt = height * 0.8; // limitar o campo
  const deslocX = (width - campoLarg) / 2;
  const deslocY = (height - campoAlt) / 2;

  // contorno
  field.append('rect')
    .attr('x', deslocX)
    .attr('y', deslocY)
    .attr('width', campoLarg)
    .attr('height', campoAlt)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  // linha central
  field.append('line')
    .attr('x1', deslocX + campoLarg / 2)
    .attr('y1', deslocY)
    .attr('x2', deslocX + campoLarg / 2)
    .attr('y2', deslocY + campoAlt)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  // circulo central
  field.append('circle')
    .attr('cx', deslocX + campoLarg / 2)
    .attr('cy', deslocY + campoAlt / 2)
    .attr('r', campoAlt * 0.1)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  // ponto central
  field.append('circle')
    .attr('cx', deslocX + campoLarg / 2)
    .attr('cy', deslocY + campoAlt / 2)
    .attr('r', 3)
    .attr('fill', '#fff');

  // Área esq
  field.append('rect')
    .attr('x', deslocX)
    .attr('y', deslocY + campoAlt * 0.3)
    .attr('width', campoLarg * 0.15)
    .attr('height', campoAlt * 0.4)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  // Área dir
  field.append('rect')
    .attr('x', deslocX + campoLarg * 0.85)
    .attr('y', deslocY + campoAlt * 0.3)
    .attr('width', campoLarg * 0.15)
    .attr('height', campoAlt * 0.4)
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);
}

const camadaDeNos = g.append('g')
  .attr('class', 'camadaNos');

// Adicionar legenda
const legenda = svg.append('g')
  .attr('class', 'legenda')
  .attr('transform', `translate(${width - 300}, 20)`);

legenda.append('rect')
  .attr('width', 280)
  .attr('height', 120)
  .attr('fill', 'white')
  .attr('opacity', 0.7)
  .attr('stroke', 'black');

legenda.append('text')
  .attr('x', 10)
  .attr('y', 20)
  .text('Gols de jogadores - Corinthians')
  .attr('font-weight', 'bold');

legenda.append('circle')
  .attr('cx', 20)
  .attr('cy', 45)
  .attr('r', 10)
  .attr('fill', 'steelblue');

legenda.append('text')
  .attr('x', 40)
  .attr('y', 50)
  .text('Jogador (tamanho = nº de gols)');

legenda.append('text')
  .attr('x', 10)
  .attr('y', 80)
  .text('O tamanho do círculo é proporcional ao número de gols do jogador.')
  .attr('font-size', '10px');

legenda.append('text')
  .attr('x', 10)
  .attr('y', 90)
  .text('Quanto maior o círculo, mais gols ele marcou.')
  .attr('font-size', '10px');

legenda.append('text')
  .attr('x', 10)
  .attr('y', 105)
  .text('Dica: clique no círculo para descobrir mais...')
  .attr('font-style', 'bold')
  .attr('font-size', '12px')


// carregar os dados e filtrar apenas o Corinthians
d3.csv('campeonato-brasileiro-gols.csv').then(data => {
  data = data.filter(d => d.clube === 'Corinthians');
  let jogadores = {};
  data.forEach(d => {
    if (!jogadores[d.atleta]) {
      jogadores[d.atleta] = {
        jogador: d.atleta,
        gols: 0,
        dados: [],
        // Posição aleatória no campo
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50
      };
    }
    jogadores[d.atleta].gols += 1;
    jogadores[d.atleta].dados.push(d);
  });

  // converter para array
  const jogadoresArray = Object.values(jogadores);

  // Configurar os grupos inicialmente fora do campo
  const groups = camadaDeNos.selectAll('.jogador-group')
    .data(jogadoresArray)
    .enter()
    .append('g')
    .attr('class', 'jogador-group')
    .attr('transform', d => `translate(${width / 2}, ${height})`)  // width / 2 -> centraliza no meio e height na base
    // Aplicar a transição para trazer para suas posições
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded));

  // Adicionar círculos representando cada jogador
  groups.append('circle')
    .attr('r', d => 5 + d.gols)
    .attr('fill', 'steelblue')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);

  // Adicionar texto com o nome do jogador 
  groups.append('text')
    .text(d => d.jogador)
    .attr('text-anchor', 'middle')
    .attr('dy', '8px')
    .attr('fill', '#fff')
    .attr('font-size', d => Math.max(10, d.gols * 2));

  // Adicionar a transição para mover os nós para suas posições finais
  groups.transition()
    .duration(800)
    .delay((d, i) => i * 100)  // isso faz com que vá um jogador por vez
    .attr('transform', d => `translate(${d.x}, ${d.y})`)  // Movem-se para suas posições
    .on('end', function () {
      // Adicionar click event após a animação estar completa
      d3.select(this).on('click', function (event, d) {
        let info = `Jogador: ${d.jogador}\n`;
        info += `Clube: ${d.dados[0].clube}\n`;
        info += `Total de Gols: ${d.gols}\n\n`;

        alert(info);
      });
    });

  // Funções de drag
  function dragStarted(event, d) {
    d3.select(this).raise();
  }

  function dragged(event, d) {
    d.x = event.x;
    d.y = event.y;
    d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`);
  }

  function dragEnded(event, d) {

  }


});