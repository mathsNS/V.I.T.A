# V.I.T.A. - Diagrama de Fluxo de Interação

Validação Inteligente de Triagem e Atendimento

## Introdução

Este documento apresenta o diagrama de fluxo de interação do V.I.T.A., mostrando como o paciente navega entre as telas e funcionalidades do sistema. Os diagramas indicam os principais caminhos de uso, pontos de decisão, entradas e saídas, alternativas e exceções da interação.

O fluxo foi construído a partir do [Mapa de Jornada do Usuário](Mapa-de-Jornada-do-Usuario.md) e reflete diretamente a navegação já implementada no protótipo de alta fidelidade (pasta `app/`).

## Legenda

| Símbolo | Significado |
|---|---|
| `(( ))` ou `[ ]` arredondado | Início ou fim de um fluxo |
| `[ ]` retângulo | Tela ou ação do sistema |
| `{ }` losango | Ponto de decisão |
| Seta contínua | Caminho principal |
| Seta tracejada | Caminho alternativo ou exceção |

## Visão Geral da Navegação

```mermaid
flowchart TD
    Start(["Abrir o app"]) --> Splash["Tela Inicial"]
    Splash -->|"Criar conta"| Cadastro["Cadastro"]
    Splash -->|"Login"| Login["Login"]
    Cadastro --> Home["Home"]
    Login --> Home
    Login -.->|"Esqueci minha senha"| Recuperar["Recuperar senha"]
    Recuperar --> Login

    Home --> Triagem["Pré-triagem no chat"]
    Home --> Agendamento["Agendar consulta"]
    Home --> Consultas["Minhas Consultas"]
    Home --> Historico["Histórico"]
    Home --> Perfil["Perfil"]
    Home --> Notificacoes["Notificações"]

    Triagem --> Resultado["Resultado da pré-triagem"]
    Resultado -->|"Agendar agora"| Agendamento
    Resultado -.->|"Aguardar contato"| Home

    Agendamento --> Confirmacao["Confirmação do agendamento"]
    Confirmacao --> Consultas
    Confirmacao -.-> Home

    Consultas --> DetalheConsulta["Detalhe da consulta"]
    DetalheConsulta -->|"Teleconsulta"| Teleconsulta["Teleconsulta"]
    Teleconsulta --> Historico

    Historico --> DetalheHistorico["Detalhe do registro"]

    Perfil -.->|"Logout"| Splash
```

## Fluxo de Autenticação

```mermaid
flowchart TD
    A["Tela Inicial"] -->|"Criar conta"| B["Cadastro: nome, email, senha"]
    B --> C{"Dados válidos?"}
    C -.->|"Não"| B
    C -->|"Sim"| D["Cadastro: telefone, nascimento, consentimento LGPD"]
    D --> E{"Aceitou os termos?"}
    E -.->|"Não"| D
    E -->|"Sim"| HomeA(["Home"])

    A -->|"Login"| H["Login: email e senha"]
    H --> I{"Formato válido?"}
    I -.->|"Não"| H
    I -->|"Sim"| HomeA
    H -.->|"Esqueci minha senha"| K["Informar email"]
    K --> L["Confirmar código de 4 dígitos"]
    L --> M["Definir nova senha"]
    M --> H
```

Entradas: nome, e-mail, senha, telefone, data de nascimento, código de verificação. Saídas: conta criada e usuário autenticado (Home) ou senha redefinida (volta ao Login). Exceções: e-mail em formato inválido, senha curta, consentimento LGPD não marcado, código de verificação incorreto.

## Fluxo de Pré-Triagem (Chat)

```mermaid
flowchart TD
    A["Home: Iniciar pré-triagem"] --> B["Chat: relatar sintoma principal"]
    B --> C{"Contém palavra-chave de emergência?"}
    C -->|"Sim"| D["Alerta de emergência"]
    D -->|"Ligar 192"| E(["Liga para emergência"])
    D -.->|"Continuar mesmo assim"| F["Perguntas dinâmicas"]
    C -->|"Não"| F["Perguntas dinâmicas"]
    F --> G["Duração, intensidade, histórico, anexos"]
    G --> H["Resumo da triagem"]
    H --> I{"Confirmar envio?"}
    I -.->|"Corrigir algo"| B
    I -->|"Confirmar"| J["Classifica prioridade e especialidade"]
    J --> K["Resultado da pré-triagem"]
    K -->|"Agendar agora"| L["Agendamento"]
    K -.->|"Aguardar contato"| M["Home"]
```

Entradas: texto livre do sintoma, respostas rápidas ou digitadas, anexo simulado de exame. Saídas: resultado com prioridade e especialidade recomendada. Alternativa: responder por botão de resposta rápida em vez de digitar. Exceção: detecção de emergência interrompe o fluxo normal antes das perguntas de aprofundamento.

## Fluxo de Agendamento

```mermaid
flowchart TD
    A["Início do agendamento"] --> B["Escolher especialidade"]
    B --> C["Escolher profissional"]
    C --> D["Escolher modalidade"]
    D --> E["Escolher data e horário"]
    E --> F["Revisar dados"]
    F --> G{"Confirmar?"}
    G -.->|"Voltar"| E
    G -->|"Confirmar"| H["Consulta agendada"]
    H --> I["Notificação de confirmação"]
    H --> J["Minhas Consultas"]
```

Entradas: especialidade, profissional, modalidade (teleconsulta ou presencial), data e horário. Saída: consulta agendada e visível em Minhas Consultas. Alternativa: chegar nesta tela já com a especialidade pré-selecionada, vindo do resultado da pré-triagem. Exceção: nenhum horário disponível bloqueia o avanço até uma data ser escolhida.

## Fluxo de Gestão de Consultas

```mermaid
flowchart TD
    A["Minhas Consultas"] --> B["Detalhe da consulta"]
    B --> C{"Modalidade?"}
    C -->|"Teleconsulta"| D["Entrar na teleconsulta"]
    D --> E["Chamada em andamento"]
    E -->|"Encerrar chamada"| F["Gera registro no histórico"]
    F --> A
    C -->|"Presencial"| G["Ver endereço e confirmar presença"]
    B -.->|"Cancelar"| H{"Confirma cancelamento?"}
    H -->|"Sim"| I["Consulta cancelada"]
    I --> A
    H -.->|"Não"| B
    B -.->|"Reagendar"| J["Escolher novo horário"]
    J --> A
```

Entradas: escolha de novo horário, confirmação de presença. Saídas: consulta concluída (gera registro no histórico), cancelada ou reagendada. Exceção: cancelamento sempre passa por uma confirmação antes de ser efetivado, para evitar perda acidental do agendamento.

## Exceções e Casos Transversais

| Situação | Comportamento do sistema |
|---|---|
| Acessar uma rota protegida sem estar logado | Redireciona automaticamente para o Login |
| Acessar uma rota que não existe | Mostra a tela "Página não encontrada" com botão de volta para o Home |
| Login ou cadastro com dados em formato inválido | Mensagem de erro inline, sem sair da tela |
| Cadastro sem marcar o consentimento LGPD | Bloqueia o avanço e explica o motivo |
| Sintoma com palavra-chave de emergência no chat | Interrompe o fluxo normal e abre o alerta de emergência |
| Cancelar uma consulta | Exige confirmação antes de efetivar |
| Sem consultas, notificações ou histórico | Mostra estado vazio com texto orientativo, sem quebrar a tela |

## Mapeamento de Telas e Rotas

| Tela | Rota | Componente |
|---|---|---|
| Tela Inicial | `/` | `Splash.tsx` |
| Cadastro | `/cadastro` | `Signup.tsx` |
| Login | `/login` | `Login.tsx` |
| Recuperar senha | `/recuperar-senha` | `ForgotPassword.tsx` |
| Home | `/home` | `Home.tsx` |
| Chat de pré-triagem | `/triagem` | `TriageChat.tsx` |
| Resultado da pré-triagem | `/triagem/resultado` | `TriageResult.tsx` |
| Agendamento | `/agendamento` | `Scheduling.tsx` |
| Confirmação do agendamento | `/agendamento/confirmacao` | `ScheduleConfirmation.tsx` |
| Minhas Consultas | `/consultas` | `AppointmentsList.tsx` |
| Detalhe da consulta | `/consultas/:id` | `AppointmentDetail.tsx` |
| Teleconsulta | `/consultas/:id/teleconsulta` | `Teleconsult.tsx` |
| Perfil | `/perfil` | `Profile.tsx` |
| Histórico | `/historico` | `HistoryList.tsx` |
| Detalhe do histórico | `/historico/:id` | `HistoryDetail.tsx` |
| Notificações | `/notificacoes` | `Notifications.tsx` |
| Página não encontrada | `*` | `NotFound.tsx` |

## Fontes

- Mapa de Jornada do Usuário;
- Requisitos Funcionais em User Stories e Requisitos Não Funcionais;
- Protótipo de Alta Fidelidade (pasta `app/`).
