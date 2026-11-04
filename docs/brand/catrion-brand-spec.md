# Especificação técnica da identidade Catrion

## Fonte visual e construção

O logo foi reconstruído sobre uma grade vetorial de `800 × 176` unidades a partir do recorte exato da referência aprovada. O lettering não usa fonte: todas as letras são paths. As pequenas irregularidades de antialiasing, compressão e gradiente da prancha raster foram consolidadas em contornos geométricos limpos, sem alteração criativa das formas, espaçamentos ou proporções observadas.

## Cores oficiais

| Uso | HEX | RGB | HSL |
|---|---:|---:|---:|
| Preto Catrion | `#151517` | `rgb(21, 21, 23)` | `hsl(240 4.5% 8.6%)` |
| Branco Catrion | `#F5F5F5` | `rgb(245, 245, 245)` | `hsl(0 0% 96.1%)` |
| Amarelo Catrion | `#F9B20B` | `rgb(249, 178, 11)` | `hsl(42.1 95.2% 51.0%)` |

Os valores sólidos representam as medianas/dominantes visualmente relevantes da arte. Variações introduzidas por gradiente, textura ou antialiasing no PNG de referência não foram transformadas em cores adicionais.

## Proporções do logo principal

- Grade master: `800 × 176` unidades.
- Relação largura/altura: `4,5455:1`.
- Moldura: aproximadamente `17` unidades, ou `9,66%` da altura total.
- Lettering: de `y=49` a `y=127`, altura geométrica de `78` unidades.
- Respiro interno vertical: `32` unidades acima e abaixo do lettering, medido a partir da borda interna da moldura.
- Respiro interno horizontal: aproximadamente `36` unidades à esquerda do `C` e `38` unidades à direita do `N`.
- Envelope do detalhe amarelo: `61 × 64` unidades, equivalente a `7,63%` da largura e `36,36%` da altura do logo.
- Geometria do detalhe amarelo no master: `(800,112) → (800,142) → (766,176) → (739,176)`.
- Corte preto inferior: ponto interno `(739,159)` e término externo `(724,176)`.
- Corte preto direito: término externo `(800,96)` e ponto interno `(783,113)`.

As coordenadas documentam a arte; não são autorização para editar ou recalcular o logo em aplicações.

## Ícone

- Grade master: `176 × 176` unidades (`1:1`).
- A espessura e a altura da moldura permanecem na mesma escala local do logo principal.
- O detalhe amarelo é a mesma geometria local do logo, transladada para o quadrado: `(176,112) → (176,142) → (142,176) → (115,176)`.
- O `C` usa exatamente o mesmo path do wordmark, com translação horizontal de `−11` unidades; não houve redesenho nem escala independente.
- Os raster pequenos são renderizados com supersampling e redução Lanczos. Não foi necessário alterar a geometria do SVG para hinting.

## Safe area

Defina `F = 17 unidades`, correspondente à espessura nominal da moldura.

- Área mínima de respiro: `1F` em todos os lados.
- Área recomendada: `2F` quando o layout permitir.
- A safe area é externa ao viewBox e deve ser adicionada somente pelo layout de aplicação; os arquivos master não contêm margem artificial.

## Uso das versões

- Light: fundo claro, lettering/moldura pretos e detalhe amarelo.
- Dark: fundo escuro, lettering/moldura brancos e detalhe amarelo.
- Black/white: apenas quando a reprodução de cor não for possível.
- Não aplique sombras, contornos, gradientes, distorção, recoloração ou alteração de proporção.

## Exportação raster

Os PNGs do logo têm fundo transparente e preservam a razão `800:176`. Como a altura proporcional nem sempre é inteira, ela é arredondada para o pixel mais próximo:

| Largura | Altura exportada |
|---:|---:|
| 512 | 113 |
| 1024 | 225 |
| 2048 | 451 |
| 4096 | 901 |

Os PNGs de ícone são quadrados nas dimensões indicadas pelo nome do diretório.

## Decisões técnicas e limitações

- A referência recebida é uma prancha raster, não o arquivo vetorial original. Portanto, a reconstrução consolida a borda antialiasada em uma linha vetorial matemática.
- O preto, o branco e o amarelo foram amostrados da referência e convertidos em cores sólidas oficiais.
- O SVG não depende de uma fonte externa e não incorpora a imagem de referência.
- A comparação de controle usa a mesma grade de `800 × 176`; consulte `qa-report.md` e os mapas PNG nesta pasta.
