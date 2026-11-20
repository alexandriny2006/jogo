# Arqueiro da Arquitetura

Jogo em primeira pessoa, no estilo Minecraft, para treinar os termos de Arquitetura Computacional.
Feito com HTML, CSS e JavaScript puros.

**Site publicado:**  https://alexandriny2006.github.io/jogo/

## Como jogar

### Fase 1: caçada aos termos
1. Leia a pista na placa de madeira, no topo da tela.
2. Mova o mouse (ou o dedo) para olhar ao redor. A mira fica no centro.
3. Três monstros avançam em sua direção, cada um com o nome de um termo. Segure o clique para puxar a corda e solte para atirar. A linha pontilhada mostra a trajetória.
4. Acerte o monstro com o termo correto antes que ele chegue. Acertar um monstro errado, ou deixar o certo chegar, custa um coração.
5. Você tem 5 corações. O contador mostra quantos termos você já acertou, por exemplo "8 de 16 termos".

### Fase 2: mesa de trabalho
Se sobreviver às 16 pistas, você monta o computador numa mesa de trabalho 3x3. Escolha um item do inventário, clique no espaço certo (guiado pelas pistas numeradas) e aperte **Craftar**. Os espaços certos ficam verdes e os errados, vermelhos. O inventário tem 4 itens a mais do que a mesa.

## Palavras e pistas

| Nº | Termo | Pista |
|----|-------|-------|
| 1 | CPU | Cérebro do computador: busca, decodifica e executa as instruções dos programas. |
| 2 | ULA | Parte da CPU que faz as contas e as operações lógicas. |
| 3 | UC | Parte da CPU que comanda e coordena o que os outros componentes fazem. |
| 4 | Registradores | Minúsculas e ultrarrápidas, ficam dentro da CPU guardando o que ela usa agora. |
| 5 | RAM | Memória volátil e rápida que guarda programas e dados em uso; apaga sem energia. |
| 6 | ROM | Memória só de leitura, guarda dados fixos e os mantém mesmo sem energia. |
| 7 | EEPROM | Memória não volátil que se apaga e regrava eletricamente, sem tirar o chip. |
| 8 | Flash | Memória não volátil apagada em blocos, comum em pen drives e cartões SD. |
| 9 | Cache | Memória pequena e veloz entre CPU e RAM, guarda o que é muito acessado. |
| 10 | Memória de massa | Guarda arquivos e programas em grande quantidade, mesmo com o computador desligado. |
| 11 | DMA | Deixa periféricos trocarem dados com a memória sem ocupar a CPU na transferência. |
| 12 | Address bus | Caminho por onde a CPU informa qual posição da memória quer acessar. |
| 13 | Data bus | Via que transporta o conteúdo lido ou escrito entre CPU, memória e periféricos. |
| 14 | Microcontrolador | Chip único com processador, memória e periféricos, usado em sistemas embarcados. |
| 15 | Dual core | Processador com dois núcleos que executam tarefas em paralelo. |
| 16 | Quad core | Processador com quatro núcleos de execução. |

## Estrutura

- `index.html`: página do jogo
- `style.css`: visual da página e da mesa de trabalho
- `script.js`: lógica do jogo (câmera em primeira pessoa, monstros, flecha, pistas, corações e mesa de trabalho)
