# VeloceBikes

Projeto acadêmico de interface web para uma loja fictícia especializada em bicicletas de alta performance e mobilidade urbana. O site apresenta categorias Mountain Bike, Speed/Estrada e Urbana/E-Bike.

## Objetivo

Construir uma experiência de navegação para explorar um catálogo de bicicletas, consultar características dos produtos e simular interações comuns de uma loja virtual, aplicando princípios de UI/UX e acessibilidade.

## Tecnologias

- **HTML5** para a estrutura e organização semântica do conteúdo.
- **CSS3** para layout responsivo, identidade visual, temas e estados de interface.
- **JavaScript** para interações, filtros, carrossel, carrinho e modais.
- **Google Fonts (Inter)** para tipografia.

## Estrutura do projeto

```text
velocybikes/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Como executar

1. Baixe ou clone este repositório.
2. Mantenha `index.html`, `style.css` e `script.js` na mesma pasta.
3. Abra `index.html` em um navegador moderno.

Não é necessário instalar dependências ou executar um servidor para visualizar a interface estática.

## Recursos implementados

- Carrossel de destaques com controles de navegação, indicadores e troca automática.
- Catálogo de bicicletas organizado em cartões.
- Abas para filtrar por categoria.
- Campo de pesquisa em tempo real.
- Ordenação de produtos por preço.
- Exibição de ficha técnica em janela modal.
- Carrinho demonstrativo com inclusão, remoção e cálculo do total.
- Modal de acesso/conta demonstrativo.
- Formulário de contato com validação básica no navegador.
- Alternância entre tema claro e escuro.
- Controles para aumentar, diminuir e restaurar o tamanho da fonte.
- Opção de alto contraste.
- Link para pular diretamente ao conteúdo principal.
- Estrutura adaptável a telas menores e navegação com foco visível.

## Acessibilidade

A interface foi construída considerando práticas associadas às Diretrizes de Acessibilidade para Conteúdo Web (WCAG), incluindo:

- Uso de elementos semânticos e rótulos acessíveis.
- Textos alternativos nas imagens.
- Estados ARIA em controles interativos.
- Indicador de foco visível.
- Link para pular ao conteúdo principal.
- Controles de tamanho de fonte, contraste e tema.
- Cores definidas por variáveis CSS para facilitar manutenção.

A conformidade deve ser confirmada com testes manuais e ferramentas de avaliação; a presença desses recursos, isoladamente, não representa certificação WCAG.

## Identidade visual e paleta de cores

A folha de estilos define como cores principais:

| Cor | Código | Intenção visual |
|---|---|---|
| Azul petróleo | `#0F4C5C` | Confiança, estabilidade e tecnologia |
| Laranja queimado | `#C84B11` | Energia, ação e destaque |
| Verde esmeralda | `#1B6B50` | Sustentabilidade e segurança |

Também são utilizadas cores neutras para fundos, textos e bordas. O CSS possui variáveis específicas para o tema escuro e para o modo de alto contraste.

## Observações sobre o funcionamento

Este repositório contém uma demonstração de interface no lado do navegador. O login apenas apresenta uma confirmação visual, o carrinho não realiza pagamento e o formulário de contato não envia mensagens para um serviço externo. Para uso em produção, seria necessário integrar autenticação, persistência de pedidos, pagamentos e envio de formulários a serviços apropriados.

## Requisitos acadêmicos e documentação

O projeto foi organizado para apoiar a apresentação dos elementos solicitados na atividade de Desenvolvimento de Interfaces: cartões, abas de pesquisa, formulário de contato, carrossel, imagens, cartões explicativos, modo claro/escuro, rodapé e recursos de acessibilidade.

O relatório acadêmico deve complementar este README com capturas de tela e uma análise própria sobre WCAG, heurísticas de Nielsen, UI/UX, branding, psicologia das cores, contraste e processo de desenvolvimento, conforme as orientações da atividade. A atividade também solicita que a redação sobre esses conceitos seja desenvolvida sem uso de IA.

## Créditos e referências

- [W3C – Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [MDN Web Docs – HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
- [MDN Web Docs – CSS](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
- [MDN Web Docs – JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- [Google Fonts – Inter](https://fonts.google.com/specimen/Inter)
- Imagens ilustrativas carregadas por URLs do [Unsplash](https://unsplash.com/).

---

**Projeto acadêmico — Desenvolvimento de Interfaces 2/2026.**
