# V.I.T.A.

**V.I.T.A. (Validação Inteligente de Triagem e Atendimento)** é uma plataforma voltada à pré-triagem inteligente e ao gerenciamento do atendimento em saúde. O projeto foi desenvolvido como atividade prática das disciplinas de **Interação Humano-Computador (IHC)** e **Engenharia de Requisitos (ER)** da **Universidade Federal do Cariri (UFCA)**.

## Protótipo de Alta Fidelidade

O protótipo foi desenvolvido utilizando **React**, **Vite** e **TypeScript**, com **Tailwind CSS**, **shadcn/ui**, **Lucide Icons** e **Framer Motion** para construção da interface.

Toda a aplicação está localizada na pasta [`app/`](app). Trata-se de um protótipo navegável de alta fidelidade, desenvolvido para representar os fluxos e interações definidos nos artefatos de Engenharia de Requisitos e IHC. Não há integração com backend; todas as informações são simuladas por meio de dados mockados.

## Execução

Acesse a pasta da aplicação e execute os seguintes comandos:

```bash
cd app
npm install
npm run dev
```

Após iniciar o servidor de desenvolvimento, acesse:

```
http://localhost:5173
```

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos da build serão gerados em `app/dist`.