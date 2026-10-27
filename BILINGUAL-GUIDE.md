# Guia de Implementação: Sistema Bilíngue EN/PT

## 📋 O que foi adicionado

### 1. **Novo arquivo: `translations.json`**
- Contém todas as traduções da interface (navegação, labels, botões)
- Textos em Inglês e Português

### 2. **Atualizado: `projects.json`**
- Agora cada projeto tem conteúdo bilíngue
- Estrutura: `{"en": "texto em inglês", "pt": "texto em português"}`

### 3. **Atualizado: `main.js`**
- Sistema de tradução automática
- Salva preferência de idioma no navegador (localStorage)
- Alterna conteúdo sem recarregar a página

### 4. **Atualizado: todos os arquivos HTML**
- Botão EN/PT adicionado no header
- Minimalista e discreto

### 5. **Atualizado: `style.css`**
- Estilos para o botão de idioma
- Mantém o design minimalista

---

## 🚀 Como Implementar

### **Passo 1: Substituir os arquivos**

Copie estes arquivos da pasta `portfolio-updates` para o template principal:

```
portfolio-updates/
├── translations.json          → copiar para raiz do portfolio
├── projects-bilingual.json    → renomear para projects.json (substituir)
├── main-bilingual.js         → renomear para js/main.js (substituir)
├── index-bilingual.html      → renomear para index.html (substituir)
├── project-bilingual.html    → renomear para project.html (substituir)
└── about-bilingual.html      → renomear para about.html (substituir)
```

### **Passo 2: Atualizar o CSS**

O CSS já foi atualizado com os estilos do botão de idioma. Se precisar reverter, o arquivo original está em `css/style.css`.

---

## ✏️ Como Adicionar Suas Traduções

### **Para Projetos:**

Edite `projects.json`. Cada campo de texto agora é um objeto com `en` e `pt`:

```json
{
  "id": "01",
  "title": {
    "en": "Urban Housing Complex",
    "pt": "Complexo Habitacional Urbano"
  },
  "year": "2024",
  "location": {
    "en": "Barcelona, Spain",
    "pt": "Barcelona, Espanha"
  },
  "typology": {
    "en": "Residential",
    "pt": "Residencial"
  },
  "concept": {
    "en": "Project description in English...",
    "pt": "Descrição do projeto em Português..."
  },
  "images": [
    {
      "src": "projects/01-project/plan.jpg",
      "caption": {
        "en": "Ground floor plan, 1:200",
        "pt": "Planta piso térreo, 1:200"
      },
      "layout": "full"
    }
  ]
}
```

### **Para a Página About:**

Edite `translations.json`, na seção `about`:

```json
"about": {
  "intro": "Texto introdutório em inglês...",
  "intro2": "Segundo parágrafo em inglês...",
  "education_items": [
    {
      "date": "2019 — 2024",
      "title": "Master of Architecture",
      "institution": "University Name"
    }
  ]
}
```

E na versão portuguesa:

```json
"pt": {
  "about": {
    "intro": "Texto introdutório em português...",
    "intro2": "Segundo parágrafo em português...",
    "education_items": [
      {
        "date": "2019 — 2024",
        "title": "Mestrado em Arquitetura",
        "institution": "Nome da Universidade"
      }
    ]
  }
}
```

---

## 🎨 Como Funciona

### **Botão de Idioma**

O botão aparece no header, ao lado do menu:

```
[Your Name]        [Projects] [About]  EN / PT
```

- Clique em **EN** → Todo o conteúdo muda para Inglês
- Clique em **PT** → Todo o conteúdo muda para Português
- A preferência é salva no navegador

### **Persistência**

O idioma escolhido fica guardado. Quando o usuário volta ao site, o idioma permanece o mesmo.

---

## 📱 Responsivo

O botão de idioma adapta-se em dispositivos móveis:

- **Desktop**: Visível ao lado do menu
- **Mobile**: Permanece visível, com espaçamento ajustado

---

## 🔧 Personalização

### **Mudar idioma padrão**

Edite `js/main.js`, linha:

```javascript
let currentLanguage = 'en'; // Mude para 'pt' se quiser português como padrão
```

### **Adicionar mais idiomas**

1. Adicione o idioma em `translations.json`:
   ```json
   "es": {
     "nav": {
       "projects": "Proyectos",
       "about": "Acerca de"
     }
   }
   ```

2. Adicione traduções em `projects.json`

3. Adicione botão no HTML:
   ```html
   <button class="lang-btn" data-lang="es">ES</button>
   ```

---

## ✅ Checklist de Implementação

- [ ] Copiar `translations.json` para raiz
- [ ] Substituir `projects.json` pela versão bilíngue
- [ ] Substituir `js/main.js` pela versão bilíngue
- [ ] Substituir `index.html`
- [ ] Substituir `project.html`
- [ ] Substituir `about.html`
- [ ] Testar no navegador (abrir com Live Server)
- [ ] Clicar em EN/PT e verificar mudança de idioma
- [ ] Verificar se o idioma persiste ao recarregar

---

## 🐛 Resolução de Problemas

### **Botão não aparece?**
- Verifique se o HTML foi atualizado
- Verifique se o CSS foi atualizado

### **Idioma não muda?**
- Abra o Console do navegador (F12)
- Verifique se há erros
- Confirme que `translations.json` está na raiz

### **Conteúdo não traduz?**
- Verifique a estrutura do `projects.json`
- Confirme que todos os campos têm `{"en": "...", "pt": "..."}`

---

## 📚 Estrutura Final

```
portfolio/
├── index.html              (atualizado com botão EN/PT)
├── project.html            (atualizado com botão EN/PT)
├── about.html              (atualizado com botão EN/PT)
├── projects.json           (versão bilíngue)
├── translations.json       (NOVO - traduções da UI)
├── css/
│   └── style.css          (atualizado com estilos do botão)
└── js/
    └── main.js            (atualizado com sistema de tradução)
```

---

## 🎯 Resultado

- ✅ Botão minimalista EN/PT no header
- ✅ Todo o conteúdo traduz instantaneamente
- ✅ Preferência de idioma salva
- ✅ Design mantém-se limpo e profissional
- ✅ Sem reload da página ao trocar idioma

---

**Pronto!** Seu portfolio agora é totalmente bilíngue 🇬🇧🇵🇹
