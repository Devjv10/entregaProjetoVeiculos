# Instância local configurada

Frontend: http://localhost:5173

API: http://localhost:3333/api

Administrador: `admin@driveflow.local`. A senha gerada está em `ADMIN_PASSWORD` no arquivo local `backend/.env`. Esse arquivo é ignorado pelo Git. Também é possível criar uma conta de cliente pela tela de cadastro.

Foram criados seis veículos de demonstração no banco real. Os testes usam um banco separado, `driveflow_test`.

## Reiniciar neste computador

O MySQL foi instalado pelo Homebrew. Os dados desta aplicação estão em `.local/mysql`, e não no diretório padrão do Homebrew. Para reiniciar a mesma instância, use um terminal na raiz do projeto:

```bash
sh .local/start-mysql.sh
```

Em outro terminal:

```bash
npm run dev
```

Não inicie outra instância de MySQL na porta 3306 ao mesmo tempo. Os scripts e dados em `.local` são específicos deste computador e não são versionados. Em outro computador, siga a instalação geral do README.

A senha administrativa do MySQL está em `.local/mysql-root-password`; a aplicação usa seu próprio usuário limitado aos dois bancos do projeto. O servidor escuta apenas em 127.0.0.1. As credenciais de aplicação estão em `backend/.env`.
