# Proposta inicial — diagrama de casos de uso

Adapte esta proposta caso o professor tenha solicitado outra notação ou outros diagramas. Para desenhar à mão, use folha A4 em paisagem, uma caixa central chamada **DriveFlow**, CLIENTE à esquerda e ADMIN à direita. Desenhe os casos como elipses e os atores como figuras humanas. Linhas simples indicam associação, sem direção obrigatória.

```mermaid
flowchart LR
    C["«ator» CLIENTE"]
    A["«ator» ADMIN"]
    subgraph S[DriveFlow]
      U1([Criar conta de cliente])
      U2([Autenticar-se])
      U3([Consultar veículos e detalhes])
      U4([Registrar locação])
      U5([Consultar histórico próprio])
      U6([Devolver veículo de locação própria])
      U7([Consultar painel])
      U8([Cadastrar / editar veículo])
      U9([Excluir veículo sem histórico])
      U10([Consultar todas as locações])
      U11([Registrar qualquer devolução])
    end
    C --- U1
    C --- U2
    C --- U3
    C --- U4
    C --- U5
    C --- U6
    C --- U7
    A --- U2
    A --- U3
    A --- U7
    A --- U8
    A --- U9
    A --- U10
    A --- U11
```

O Mermaid é uma representação legível para consulta; no papel, substitua os retângulos dos atores pelos símbolos UML. Não é necessário usar uma relação de herança entre ADMIN e CLIENTE, pois o administrador não registra locações no sistema.

## Notas para a folha

- Criar conta é público e gera CLIENTE. O ADMIN inicial é criado pelo seed, fora do fluxo público.
- As demais operações exigem autenticação, exceto o próprio login.
- A locação exige veículo disponível e período válido.
- A devolução encerra a locação e libera o veículo.
- Exclusão exige ausência de histórico.
- Painel do cliente apresenta locações próprias; painel do administrador apresenta a operação geral.

Para caber em A4, posicione autenticação, consulta de veículos e painel na coluna central. Coloque operações exclusivas de cliente à esquerda dentro do sistema e operações administrativas à direita. Evite cruzar linhas e use rótulos curtos. Essas regras são notas do diagrama, não perguntas da entrega individual.
