# Carlota Azenha da Rocha — Portfólio de Arquitetura

Site-portfólio de **Carlota Azenha da Rocha**, estudante do Mestrado Integrado em Arquitetura da Universidade de Évora, com períodos de estudo na Universidade do Porto e na ETSA de Sevilha. A dissertação de mestrado, sobre a salvaguarda do Convento da Tomina, foi desenvolvida na Universidade de Évora.

🔗 **https://carlotaazenharocha.github.io**

O site apresenta projetos académicos (desenhos, maquetes e processo), o percurso e o CV, e as participações em workshops, seminários, intercâmbios e voluntariados. Está disponível em **português, inglês e espanhol**.

> O site está em desenvolvimento.

---

## Páginas

| Página | Conteúdo |
|---|---|
| `index.html` | Projetos numa faixa que desliza para o lado, com os outros trabalhos por baixo |
| `project.html?id=…` | Projeto: título, texto, imagens organizadas por blocos (Lugar, Desenhos, Maquetes, Processo) e ficha técnica |
| `about.html` | Apresentação, formação, competências, tese, CV para descarregar e contactos |
| `research.html` | Investigação (em curso) sobre o Convento da Tomina, iniciada com a dissertação de mestrado: resumo, linha do tempo, levantamento, estratégia de salvaguarda, candidatura a património e publicações |
| `participation.html?id=…` | Detalhe de cada participação (workshop, seminário, intercâmbio…) |
| `portfolio.html` | Ferramenta interna para gerar o portfólio em PDF: escolher projetos, formato (A4/A3, horizontal/vertical) e língua |

---

## Como funciona

Site estático, sem dependências nem passo de build: **HTML, CSS e JavaScript**, com o conteúdo em ficheiros **JSON**. O JavaScript lê os JSON e monta as páginas na língua escolhida, que fica guardada no browser.

```
├── index.html, project.html, about.html, participation.html, 404.html
├── portfolio.html          # Gerador do portfólio em PDF
├── projects.json           # Projetos
├── participations.json     # Participações
├── about.json              # Conteúdo da página About
├── research.json           # Conteúdo da página Investigação
├── translations.json       # Textos da interface (menus, etiquetas, rodapé)
├── css/
│   ├── style.css           # Estilos do site
│   ├── caderno.css         # Cadernos (leporello)
│   └── portfolio.css       # Estilos do gerador de PDF
├── js/
│   ├── main.js             # Línguas, carregamento dos JSON e páginas
│   ├── caderno.js          # Cadernos (leporello)
│   └── portfolio.js        # Gerador de PDF
├── projects/NN-nome/       # Imagens de cada projeto
├── participations/<id>/    # Imagens de cada participação
├── assets/                 # CV, documentos e imagens gerais
└── research/images/        # Imagens da página Investigação
```

---

## Ver localmente

Os JSON só carregam através de um servidor (abrir o `index.html` diretamente não funciona):

```bash
python3 -m http.server 8000
```

Depois abrir http://localhost:8000. Em alternativa, pode usar-se a extensão **Live Server** do VS Code.

---

## Adicionar ou editar um projeto

1. Criar a pasta `projects/NN-nome-do-projeto/` com as imagens.
2. Acrescentar uma entrada ao `projects.json`. Os textos têm uma versão por língua:

```json
{
  "id": "NN-nome-do-projeto",
  "title": { "en": "…", "pt": "…", "es": "…" },
  "year": "2025",
  "location": { "en": "…", "pt": "…", "es": "…" },
  "typology": { "en": "…", "pt": "…", "es": "…" },
  "context": { "en": "Academic", "pt": "Académico", "es": "Académico" },
  "institution": { "en": "…", "pt": "…", "es": "…" },
  "teachers": "Nome | Nome",
  "thumbnail": "projects/NN-nome-do-projeto/capa.jpg",
  "concept": { "en": "Parágrafo 1\n\nParágrafo 2", "pt": "…", "es": "…" },
  "images": [
    {
      "section": { "en": "Models", "pt": "Maquetes", "es": "Maquetas" },
      "src": "projects/NN-nome-do-projeto/foto.jpg",
      "caption": { "en": "…", "pt": "…", "es": "…" },
      "layout": "full"
    }
  ]
}
```

- **`context`, `institution` e `teachers`** são opcionais e só aparecem na ficha técnica se existirem.
- **`concept`**: uma linha em branco (`\n\n`) separa parágrafos.
- **`section`** (opcional): mostra um subtítulo de bloco antes dessa imagem.
- **`layout`**: `full` (largura total), `inset` (mais estreita e centrada) ou `half` (duas imagens `half` seguidas ficam lado a lado).
- **Imagens**: no máximo 2400 px no lado maior; nomes em minúsculas, sem espaços nem acentos, numerados pela ordem (`03-planta-geral-1-200.jpg`).

---

## Publicação

O site é publicado pelo **GitHub Pages** a partir da branch `main`. Cada `push` para a `main` atualiza o site público em 1 a 2 minutos.

---

## Direitos de autor

© 2026 Carlota Azenha da Rocha. **Todos os direitos reservados.**

Os desenhos, imagens, fotografias e textos deste repositório e do site não podem ser reproduzidos nem utilizados sem autorização da autora. Ver [LICENSE](LICENSE).
