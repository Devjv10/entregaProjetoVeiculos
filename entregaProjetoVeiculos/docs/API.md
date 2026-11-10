# Referência prática da API

Base local: `http://localhost:3333/api`. Use `Content-Type: application/json` e, nas rotas privadas, `Authorization: Bearer SEU_TOKEN`. Os exemplos usam marcadores; substitua-os pelos dados retornados pela API. Senhas abaixo são indicações de preenchimento, não credenciais existentes.

## Cadastro e login

`POST /auth/register`:

```json
{
  "name": "Seu Nome",
  "email": "seu.email@example.com",
  "password": "SENHA_ESCOLHIDA_POR_VOCE"
}
```

Retorna HTTP 201 e `{ "data": { "user": { "id": "UUID", "name": "Seu Nome", "email": "seu.email@example.com", "role": "CLIENTE", "createdAt": "ISO_DATE" }, "token": "JWT" } }`.

`POST /auth/login` recebe somente `email` e `password` e retorna a mesma estrutura de sessão com HTTP 200. `GET /auth/me` retorna `{ "data": { "id": "UUID", "name": "...", "email": "...", "role": "CLIENTE", "createdAt": "ISO_DATE" } }`.

Para usar curl sem salvar a senha no histórico, crie um arquivo temporário local ignorado chamado `backend/.env.login.json`, com `email` e `password`, e execute:

```bash
curl -i http://localhost:3333/api/auth/login -H 'Content-Type: application/json' --data-binary @backend/.env.login.json
```

Apague o arquivo local após a demonstração. Também é possível usar variáveis locais do Postman/Insomnia sem exportar seus valores.

## Veículos

`GET /vehicles?search=Toyota&category=SEDAN&status=AVAILABLE&page=1&limit=9`.

Parâmetros opcionais: `search`, `category`, `status`, `page` e `limit`. Página inicial 1; limite padrão 12, máximo 50. `search` procura por marca ou modelo. Categorias: ECONOMY, SEDAN, SUV, HATCH, PICKUP, LUXURY. Status: AVAILABLE, RENTED, MAINTENANCE.

`POST /vehicles` como ADMIN:

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2025,
  "plate": "ABC1D23",
  "color": "Prata",
  "category": "SEDAN",
  "dailyRate": "229.90",
  "status": "AVAILABLE",
  "imageUrl": null
}
```

`dailyRate` é string decimal com até duas casas; `year` é número inteiro. Aceita placas tradicionais e Mercosul, normalizadas para maiúsculas sem hífen. Imagens são opcionais, por URL HTTP/HTTPS. Sem imagem, a interface mostra um ícone de veículo identificado, sem substituir a foto por um modelo diferente.

`GET /vehicles/UUID` consulta um veículo. `PUT /vehicles/UUID` recebe todos os campos de cadastro; `status` e `imageUrl` são opcionais. Em veículo alugado, omita `status` para editar outros campos. `DELETE /vehicles/UUID` retorna `{ "data": { "message": "Veículo excluído." } }` ou 409 se houver histórico.

```bash
curl -i 'http://localhost:3333/api/vehicles?status=AVAILABLE&page=1&limit=9' -H 'Authorization: Bearer SEU_TOKEN'
```

## Locações

`POST /rentals` como CLIENTE:

```json
{
  "vehicleId": "UUID_DO_VEICULO",
  "startDate": "HORARIO_ATUAL_EM_ISO_8601",
  "expectedReturnDate": "HORARIO_FUTURO_EM_ISO_8601"
}
```

Use horários reais no momento da chamada. Exemplo de formato: `2026-11-03T22:00:00.000Z`. O horário de início enviado deve estar a até cinco minutos do servidor; o servidor registra o horário efetivo. Não envie `userId`, preços ou totais. O usuário vem do token e o preço vem do banco.

Resposta 201: `{ "data": { "id": "UUID", "userId": "UUID", "vehicleId": "UUID", "startDate": "ISO_DATE", "expectedReturnDate": "ISO_DATE", "actualReturnDate": null, "contractedDailyRate": "229.9", "estimatedTotal": "229.9", "finalTotal": null, "status": "ACTIVE", "vehicle": {}, "user": { "id": "UUID", "name": "...", "email": "..." } } }`. Datas de criação/atualização também são retornadas. Decimais podem vir sem zeros finais; continuam sendo strings exatas.

`GET /rentals?status=ACTIVE&page=1&limit=10`: histórico paginado. `GET /rentals/UUID`: contrato individual. Cliente vê somente suas próprias locações; ADMIN vê todas.

`PATCH /rentals/UUID/return`: sem corpo. Retorna o contrato atualizado com status COMPLETED, data efetiva e valor final. Devolução repetida retorna 409. Um cliente acessando contrato alheio recebe 404, evitando revelar sua existência.

```bash
curl -i -X PATCH http://localhost:3333/api/rentals/UUID/return -H 'Authorization: Bearer SEU_TOKEN'
```

## Dashboard

`GET /dashboard/stats`:

```json
{
  "data": {
    "totalVehicles": 0,
    "availableVehicles": 0,
    "rentedVehicles": 0,
    "activeRentals": 0,
    "completedRentals": 0,
    "recentRentals": [],
    "availableVehiclesList": []
  }
}
```

Os valores acima ilustram uma base vazia. Na aplicação, todos vêm das consultas ao MySQL. Para clientes, `rentedVehicles` é a quantidade de seus veículos em uso e os indicadores de locação são restritos ao próprio usuário.

## Erros

```json
{
  "error": {
    "message": "Veículo indisponível para locação."
  }
}
```

Validações retornam `details` com erros de formulário e de campos. Erros internos não expõem stack traces, URLs de conexão ou hashes. Cadastro/login permitem 30 tentativas por IP em 15 minutos; esse limitador é desligado somente no ambiente de testes.
