# Validação da entrega

## Ambiente

Verificação local em 03/11/2026, com Node.js 26.6.0 e npm 11.18.0. Na primeira verificação não havia MySQL disponível. Após a solicitação para executar o projeto, foi instalado MySQL 8.4.13 e configurada uma instância local isolada em `.local/mysql`, com bancos de desenvolvimento e teste e credenciais geradas em arquivos ignorados pelo Git.

## Verificações realizadas

| Verificação | Resultado |
| --- | --- |
| Instalação das dependências | Concluída; lockfile gerado |
| Geração do Prisma Client | Concluída |
| Validação do schema Prisma | Aprovada com URL ilustrativa, sem conexão ao banco |
| Migration MySQL | Aplicada com sucesso nos bancos driveflow e driveflow_test |
| Seed | Administrador inicial e seis veículos criados |
| TypeScript backend e frontend | Aprovado |
| ESLint | Aprovado |
| Build backend e frontend | Aprovado |
| Testes unitários | 15 aprovados |
| Resposta HTTP da página `/login` no Vite | Aprovada |
| Auditoria das dependências de execução | Zero vulnerabilidades conhecidas no momento da consulta |
| Auditoria completa | 11 alertas moderados na cadeia de desenvolvimento do ESLint/minimatch; nenhum alto ou crítico |
| Suíte de integração MySQL | 19 cenários aprovados com banco real |
| Login e dashboard via proxy do frontend | HTTP 200, com seis veículos retornados |
| Inspeção visual por navegador automatizado | Não realizada; ferramenta de navegação não disponível |

As migrations foram aplicadas em MySQL real, e o login e o dashboard foram verificados por HTTP através do proxy do frontend. A inspeção visual das telas no navegador continua pendente. O build pode emitir avisos de anotações internas da dependência Zod; a compilação é concluída.

## Como reproduzir a validação com MySQL

1. Criar bancos de desenvolvimento e teste conforme README.
2. Configurar as variáveis em `backend/.env`.
3. Executar `npm run db:migrate` e `npm run db:seed`.
4. Executar `npm run db:test:migrate` e `npm run test:integration`.
5. Iniciar o sistema com `npm run dev` e percorrer o roteiro de apresentação no navegador.

A suíte de integração contém 19 cenários com banco real, incluindo os 12 fluxos exigidos, duas requisições simultâneas de locação, devolução concorrente e preservação da diária. Ela não usa mocks do Prisma. Os 19 cenários foram executados e aprovados na instância local configurada. A primeira execução identificou um acesso incorreto ao envelope JSON dentro do teste de indicadores; o teste foi corrigido e a suíte completa passou na repetição.

## Dependências

Os avisos altos/críticos encontrados na primeira instalação foram corrigidos com versões atualizadas de Zod e Vitest e overrides de `deepmerge-ts` e `effect` usados pela configuração do Prisma. O schema e o cliente permaneceram em Prisma 6.19.0, com versões iguais de CLI e Client.

Os alertas moderados remanescentes vêm do uso de minimatch nas ferramentas de lint. A sugestão automática do npm envolvia substituir ferramentas por versões antigas incompatíveis, por isso não foi aplicado `audit fix --force`. Esses pacotes não participam da API ou do bundle do aplicativo. Reavalie as atualizações antes de publicar, preservando as verificações de compatibilidade.
