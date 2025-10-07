# App Garçom Prestador

Este é o aplicativo para prestadores de serviço da plataforma Garçom. Ele permite que os profissionais se cadastrem, gerenciem seus perfis e encontrem oportunidades de trabalho.

## Tecnologias Utilizadas

- **React:** Biblioteca para construção da interface de usuário.
- **Vite:** Ferramenta de build e desenvolvimento rápido.
- **TypeScript:** Superset de JavaScript que adiciona tipagem estática.
- **Supabase:** Backend-as-a-Service para autenticação, banco de dados e APIs.
- **Tailwind CSS:** Framework de CSS utility-first para estilização.
- **React Router DOM:** Para gerenciamento de rotas na aplicação.

## Estrutura de Pastas

```
app-garcom-prestador/
├── public/             # Arquivos estáticos
├── src/
│   ├── assets/         # Imagens, fontes, etc.
│   ├── components/     # Componentes React reutilizáveis
│   ├── hooks/          # Hooks customizados (ex: useAuth)
│   ├── lib/            # Configuração de bibliotecas (ex: supabase)
│   ├── pages/          # Componentes de página (rotas)
│   ├── App.tsx         # Componente principal da aplicação
│   ├── main.tsx        # Ponto de entrada da aplicação
│   └── index.css       # Estilos globais
├── .env.example        # Exemplo de variáveis de ambiente
├── package.json        # Dependências e scripts do projeto
└── README.md           # Documentação do projeto
```

## Como Executar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone <url-do-repositorio>
    cd app-garcom-prestador
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`. Você precisará adicionar as chaves da sua instância do Supabase.

    ```
    VITE_SUPABASE_URL=https://seu-projeto.supabase.co
    VITE_SUPABASE_ANON_KEY=sua-chave-anon
    ```

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:5174` (ou outra porta, se a 5174 estiver em uso).

## Histórico de Desenvolvimento e Correções

Durante o desenvolvimento, foram identificados e corrigidos vários problemas críticos que afetavam a estabilidade e a compilação da aplicação. Abaixo está um resumo detalhado das principais intervenções:

### 1. Resolução do Loop de Login

-   **Problema:** Após o login, a aplicação entrava num loop infinito de redirecionamento, impedindo o acesso ao dashboard.
-   **Causa Raiz:** Foi identificada uma condição de corrida (`race condition`) no `AuthContext.tsx`. O estado de `loading` era manipulado em múltiplos locais (`signIn`, `signOut`, `onAuthStateChange`), causando inconsistências na deteção do estado de autenticação.
-   **Solução:**
    -   A gestão do estado de `loading` foi centralizada exclusivamente dentro do `onAuthStateChange`.
    -   As chamadas `setLoading(true)` e `setLoading(false)` foram removidas das funções `signIn` e `signOut`.
    -   Isso garantiu que o estado de autenticação e o perfil do utilizador fossem totalmente resolvidos antes de a aplicação tentar renderizar rotas protegidas, eliminando o loop.

### 2. Correção do Loop na Página da Agenda

-   **Problema:** Ao navegar para a página da agenda (`/agenda`), a página ficava em branco e entrava num loop de renderização.
-   **Causa Raiz:** O `useEffect` na `AgendaPage.tsx`, responsável por carregar os agendamentos, tinha uma dependência desnecessária do objeto `user`. Como o objeto `user` era recriado em cada renderização do `AuthContext`, o `useEffect` era acionado continuamente.
-   **Solução:** A dependência do `useEffect` foi alterada de `user` para `user.id`. Como o `id` do utilizador é um valor estável, o `useEffect` passou a ser executado apenas quando o `id` realmente muda (ou seja, no login), corrigindo o loop.

### 3. Correção dos Erros de Compilação (`npm run build`)

-   **Problema:** A execução do comando `npm run build` falhava devido a múltiplos erros de TypeScript, impedindo a criação de uma versão de produção.
-   **Soluções Aplicadas:**
    -   **Componente `Loading` em Falta:** Adicionada a importação do componente `Loading` que faltava no ficheiro `AgendaPage.tsx`.
    -   **Caminhos de Importação Incorretos:** Em `ProfileEditPage.tsx`, os caminhos de importação que usavam o atalho `(@/)` foram corrigidos para usar caminhos relativos (ex: `../../components/Loading`).
    -   **Importações Não Utilizadas:** Foram removidas várias importações de hooks e componentes que não estavam a ser utilizados em ficheiros como `LoginPage.tsx`, `AgendaPage.tsx`, `DashboardPage.tsx` e `ProfileEditPage.tsx`.
    -   **Módulos Inexistentes:** As importações de componentes como `Card` e `Button` de um diretório `ui` inexistente foram removidas, uma vez que esses componentes não estavam a ser usados e os ficheiros não existiam no projeto.

Após estas correções, o comando `npm run build` passou a ser executado com sucesso, gerando os ficheiros de produção no diretório `dist/`.
