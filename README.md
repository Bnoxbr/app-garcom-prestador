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
