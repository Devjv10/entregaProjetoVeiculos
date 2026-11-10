DriveFlow — Sistema de Locação de Veículos
Aplicação acadêmica da disciplina Programação com Frameworks Web. Integra uma interface React a uma API Express, com autenticação JWT e persistência real em MySQL via Prisma. O objetivo é demonstrar CRUD, autorização, relacionamentos, transações e integração entre frontend e backend de forma compreensível para estudantes.

Funcionalidades
Cadastro público de clientes, login, consulta da sessão e logout.
Perfis CLIENTE e ADMIN com permissões verificadas na API.
Catálogo com pesquisa, categorias, disponibilidade, detalhes e paginação.
Cadastro, edição e exclusão segura de veículos pelo administrador.
Locação com retirada imediata, preço contratado preservado e cálculo decimal.
Devolução pelo proprietário ou administrador, com cálculo do valor final.
Bloqueio de dupla locação e dupla devolução por atualização condicional transacional.
Dashboard com dados reais, indicadores, locações recentes e veículos disponíveis.
Interface responsiva, estados de carregamento, vazio, erro e página 404.
Seed opcional de veículos de demonstração gravados no MySQL. Não há API simulada nem dados de fallback na interface.
Tecnologias
Camada	Tecnologias
Frontend	React 19, TypeScript 5, Vite 7, Tailwind CSS 4, React Router 7, Axios, Lucide React, React Hook Form, Zod 4, Sonner
Backend	Node.js, Express 5, TypeScript, Prisma ORM 6.19, MySQL, JWT, bcryptjs, Zod, CORS, dotenv, Helmet, express-rate-limit
Qualidade	ESLint, Vitest, Supertest, TypeScript strict
As versões exatas estão no package-lock.json. Use npm ci para reproduzir a instalação. A interface usa Tailwind CSS 4 integrado ao Vite e CSS próprio para os componentes visuais. Prisma CLI e Client usam a mesma versão.

Referências de compatibilidade: Prisma 6 e Vite. Use Node 22 LTS, versão 22.18 ou superior, com npm 10 ou superior. As verificações locais desta entrega foram realizadas com Node 26.6.0; a versão recomendada está em .nvmrc.

Estrutura
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/
├── frontend/src/
│   ├── components/
│   ├── contexts/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── styles.css
├── docs/
├── eslint.config.mjs
├── package.json
└── package-lock.json
Os handlers HTTP ficam em routes/; a lógica transacional fica em services/rentals.ts. Isso mantém a separação de responsabilidades sem criar camadas que apenas repassam chamadas.

Instalação local
Pré-requisitos: Node.js compatível, npm e servidor MySQL 8.0 ou 8.4 acessível. MySQL deve usar InnoDB. Docker é uma alternativa opcional para fornecer o servidor, não uma substituição do banco.

Na raiz do projeto:

npm ci
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
Copie o segredo gerado para JWT_SECRET em backend/.env. Escolha as credenciais do administrador e do banco. Não publique seus arquivos .env.

Preparar MySQL instalado
Entre no cliente MySQL como administrador:

mysql -u root -p
Execute, substituindo SENHA_ESCOLHIDA_LOCALMENTE por uma senha local:

CREATE DATABASE driveflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE driveflow_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'driveflow'@'localhost' IDENTIFIED BY 'SENHA_ESCOLHIDA_LOCALMENTE';
GRANT ALL PRIVILEGES ON driveflow.* TO 'driveflow'@'localhost';
GRANT ALL PRIVILEGES ON driveflow_test.* TO 'driveflow'@'localhost';
Para um banco remoto, adapte host, usuário e permissões. O usuário de aplicação em produção deve ter somente as permissões necessárias; migrations podem usar uma credencial separada.

Alternativa com Docker
Se Docker já estiver instalado, crie um arquivo local .env.mysql, ignorado pelo Git, com valores próprios para MYSQL_ROOT_PASSWORD, MYSQL_DATABASE=driveflow, MYSQL_USER=driveflow e MYSQL_PASSWORD. Execute:

docker run --name driveflow-mysql --env-file .env.mysql -p 127.0.0.1:3306:3306 -v driveflow_mysql:/var/lib/mysql -d mysql:8.4
docker exec -it driveflow-mysql mysql -u root -p
Dentro do MySQL, crie também driveflow_test e conceda acesso ao usuário driveflow do contêiner:

CREATE DATABASE driveflow_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON driveflow_test.* TO 'driveflow'@'%';
Nas próximas execuções: docker start driveflow-mysql.

Variáveis de ambiente
Variável	Local	Descrição
DATABASE_URL	backend	mysql://USUARIO:SENHA@localhost:3306/driveflow
JWT_SECRET	backend	Segredo aleatório de no mínimo 32 caracteres
JWT_EXPIRES_IN_SECONDS	backend	Expiração entre 60 e 86400 segundos; padrão 28800 (8 horas)
PORT	backend	Porta da API, padrão 3333
FRONTEND_URL	backend	Origem autorizada pelo CORS, padrão http://localhost:5173
ADMIN_NAME	backend	Nome do administrador inicial
ADMIN_EMAIL	backend	E-mail escolhido para o seed
ADMIN_PASSWORD	backend	Senha escolhida: mínimo 8 caracteres, máximo 72 bytes UTF-8
SEED_DEMO	backend	true para inserir seis veículos de demonstração; padrão false
TEST_DATABASE_URL	backend	URL de banco isolado cujo nome termine em _test
NODE_ENV	backend	development, production ou test
VITE_API_URL	frontend	/api em desenvolvimento; URL pública da API quando hospedada separadamente
Codifique caracteres especiais da senha na URL com percent-encoding. Variáveis VITE_* são públicas; nunca coloque senhas ou JWT_SECRET nelas.

Gerar cliente, aplicar migrations e seed
Depois de configurar backend/.env e iniciar MySQL:

npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
Frontend: http://localhost:5173
API: http://localhost:3333/api
Verificação HTTP: http://localhost:3333/api/health
O Vite encaminha /api para a porta 3333. Use localhost no navegador para corresponder à origem configurada. Caso altere a porta da API, atualize o proxy em frontend/vite.config.ts.

O backend verifica a configuração e tenta conectar ao MySQL antes de abrir a porta. A rota de saúde indica que o processo HTTP está ativo; não é um monitor contínuo da conexão com o banco.

O seed cria o administrador inicial a partir do ambiente. É idempotente: preserva usuários, senhas, veículos e status existentes. Não promove clientes existentes a administrador. Para mostrar o catálogo, defina SEED_DEMO=true antes de executá-lo. As placas DEM1A01 a DEM1A06 identificam os exemplos. Cadastre um cliente e faça locações pela interface para gerar o histórico da apresentação.

Não há credenciais administrativas padrão. Se o seed falhar por variáveis ausentes, preencha-as antes de repetir o comando.

Para desenvolver novas alterações de schema, use npm exec -w backend -- prisma migrate dev --name nome_da_alteracao, com as permissões necessárias para o shadow database. Para instalar o projeto, db:migrate usa migrate deploy, que não exige shadow database.

Regras de negócio
Diárias e dinheiro
A aplicação oferece retirada imediata, sem agendamento de reservas. O formulário mostra o início e o atualiza na confirmação. O servidor aceita a intenção de início com tolerância de cinco minutos e registra seu próprio horário como início efetivo. A devolução prevista deve ser futura e estar em até 365 dias.

Diárias previstas = ceil((devolução prevista − início efetivo) / 24 horas).
Total previsto = diárias previstas × diária contratada.
Na devolução, diárias efetivas = max(1, ceil((horário do servidor − início) / 24 horas)).
Valor final = diárias efetivas × diária contratada. Devolução antecipada usa o tempo efetivo; atraso acrescenta diárias inteiras, sem multa adicional.
Exemplo: diária R$ 149,90 por 24 horas custa R$ 149,90; por 24 horas e um minuto, R$ 299,80.
A diária é copiada do veículo para contractedDailyRate na transação. Edições posteriores do veículo não alteram contratos existentes.
O banco usa DECIMAL, e a API calcula com Prisma.Decimal. Preços são strings na API. A estimativa da interface multiplica centavos com BigInt; a API continua sendo a fonte definitiva do valor. Datas trafegam em ISO 8601, são armazenadas em UTC e aparecem no fuso local do navegador. O cálculo usa duração de 24 horas, não mudança de dia do calendário.

Concorrência e integridade
Na locação, uma transação executa updateMany com as condições id e status=AVAILABLE. O InnoDB bloqueia a linha durante a escrita. Uma única solicitação consegue alterar o status para RENTED; uma concorrente encontra zero linhas disponíveis e recebe HTTP 409. Criação do contrato e alteração do veículo confirmam ou revertem juntas.

Na devolução, a mesma estratégia condiciona a atualização a status=ACTIVE. Apenas a solicitação vencedora encerra o contrato e libera o veículo. O horário e o preço final são calculados no servidor. Conflitos transacionais do Prisma também são traduzidos para 409.

A edição administrativa não aceita RENTED como status manual. Alterações para AVAILABLE ou MAINTENANCE exigem que o veículo ainda não esteja alugado. É permitido ajustar dados e diária de veículo alugado omitindo status, preservando o preço do contrato atual.

Chaves estrangeiras RESTRICT protegem o histórico, inclusive em disputas entre exclusão e locação. Veículos com qualquer histórico não podem ser excluídos. E-mail e placa são únicos.

Autorização e sessão
Operação	CLIENTE	ADMIN
Consultar catálogo/detalhes	Sim	Sim
Cadastrar/editar/excluir veículo	Não	Sim
Criar locação	Para si	Não
Consultar/devolver locações	Somente próprias	Todas
Dashboard	Frota pública e locações próprias	Indicadores gerais
Para clientes, total de veículos e disponíveis descrevem o catálogo; veículos alugados, locações ativas/concluídas e histórico pertencem ao cliente autenticado.

O token JWT usa HS256, expiração, emissor e audiência. O middleware busca o usuário atual no banco, sem confiar no perfil enviado pelo navegador. Hashes nunca são selecionados para respostas. O cadastro público rejeita campos adicionais, como role.

O frontend guarda o token em sessionStorage, válido somente naquela aba, envia Authorization: Bearer e limpa a sessão em respostas 401 e no logout. Um erro temporário de conexão oferece nova tentativa. Logout remove o token do navegador; um token já copiado permanece válido até expirar. Para um produto com revogação imediata, seria necessário implementar uma estratégia de revogação. Use HTTPS em uma implantação pública.

API REST
Sucesso: { "data": ... }. Listagens: { "data": [], "meta": { "page": 1, "limit": 12, "total": 0, "pages": 0 } }. Erro: { "error": { "message": "...", "details": ... } }, com details apenas quando há validação.

Método	Rota	Acesso / descrição
GET	/api/health	Saúde HTTP, público
POST	/api/auth/register	Cadastro público CLIENTE
POST	/api/auth/login	Login público
GET	/api/auth/me	Usuário autenticado
GET	/api/vehicles	Catálogo autenticado, filtros e paginação
GET	/api/vehicles/:id	Detalhes autenticados
POST	/api/vehicles	Cadastro ADMIN
PUT	/api/vehicles/:id	Edição ADMIN
DELETE	/api/vehicles/:id	Exclusão ADMIN sem histórico
POST	/api/rentals	Nova locação CLIENTE
GET	/api/rentals	Histórico conforme perfil
GET	/api/rentals/:id	Detalhe conforme propriedade/perfil
PATCH	/api/rentals/:id/return	Devolução conforme propriedade/perfil
GET	/api/dashboard/stats	Indicadores conforme perfil
HTTP: 200 sucesso, 201 criação, 400 validação, 401 sessão/credenciais inválidas, 403 permissão insuficiente, 404 recurso inexistente ou locação de outro cliente, 409 conflito/integridade, 429 limite de tentativas, 500 falha interna.

Exemplos para Postman, Insomnia ou curl: docs/API.md.

Verificações e testes
npm run typecheck
npm run lint
npm run build
npm test
npm test executa os testes unitários de cobrança e validação sem banco. Os testes de API usam Supertest + Prisma + MySQL reais; não simulam o mecanismo de concorrência.

Para preparar o banco isolado, na raiz, após configurar TEST_DATABASE_URL em backend/.env:

npm run db:test:migrate
npm run test:integration
A suíte exige sufixo _test, cria registros identificáveis por execução e remove apenas seus próprios registros ao terminar. Nunca aponte para um banco de produção. Ela cobre cadastro, login válido/inválido, autenticação, permissões, placas duplicadas, locação, indisponibilidade, duas locações simultâneas, devolução, duas devoluções simultâneas, preço contratado, propriedade e exclusão com histórico.

Resultados e limites de validação desta entrega: docs/VALIDACAO.md.

Build e execução separados
npm run dev -w backend
npm run dev -w frontend
Após npm run build, execute npm run start -w backend para o backend compilado. frontend/dist contém os arquivos estáticos; o servidor de hospedagem precisa encaminhar rotas React para index.html. Para pré-visualizar localmente o build com a API em execução, use npm run preview -w frontend -- --port 5173 e configure VITE_API_URL=http://localhost:3333/api antes do build, ou um proxy equivalente. A porta 5173 precisa estar livre. Não use vite preview como servidor de produção.

Demonstração e materiais acadêmicos
Configure MySQL e ambiente, aplique migrations e seed com SEED_DEMO=true.
Inicie API e frontend, entre como administrador e confira a frota.
Cadastre um veículo e edite seu valor.
Saia, crie uma conta de cliente e registre uma locação real.
Confira a mudança de disponibilidade e o histórico.
Registre a devolução e observe o valor final e a liberação do veículo.
Consulte as locações como administrador e tente excluir um veículo com histórico.
Roteiro completo e dez perguntas técnicas
Diagrama de casos de uso
Diagrama de entidades
Os diagramas são propostas iniciais para adaptação às orientações do professor. Nenhuma questão da entrega individual foi inventada como se tivesse sido fornecida pela disciplina.

Publicação no GitHub
O projeto está preparado para versionamento: dependências e arquivos .env são ignorados, exemplos não incluem credenciais reais e o lockfile deve ser versionado. Crie seu repositório e envie o código após preencher os integrantes. Nenhum repositório remoto foi criado automaticamente.

Integrantes
Nome	Matrícula	Responsabilidades
Preencher	Preencher	Preencher
Preencher	Preencher	Preencher
Preencher	Preencher	Preencher
Professor(a): preencher. Turma/semestre: preencher.
