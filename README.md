# Desafio 8 — Revisão de vídeo e peças exigidas

Modelo de entrega com campanhas definindo dados `required_pieces` (qualquer subconjunto sem duplicação de `script`, `video`, `cover`, `caption`), versões independentes de cada peça, aprovação da versão **atual**, comentários atrelados à versão de vídeo e segundo. Cada versão nova invalida a aprovação geral anterior, registrada em `approval_history`. `missing_required` informa quais peças faltam e `approved` só é true após uma aprovação geral explícita.

```bash
npm test && npm run typecheck
npm start
curl -X POST http://localhost:3008/campaigns -H 'content-type: application/json' -d '{"required_pieces":["video","caption"]}'
# response: {"id":"cmp_1","required_pieces":["video","caption"]}
curl -X POST http://localhost:3008/deliveries -H 'content-type: application/json' -d '{"campaign_id":"cmp_1"}'
curl -X POST http://localhost:3008/deliveries/delivery_1/pieces/video/versions -H 'content-type: application/json' -d '{"asset_url":"fake://v1","duration_seconds":42}'
curl -X POST http://localhost:3008/deliveries/delivery_1/pieces/video/versions/1/comments -H 'content-type: application/json' -d '{"second":15,"text":"Rever CTA"}'
curl -X POST http://localhost:3008/deliveries/delivery_1/pieces/video/approve
curl -X POST http://localhost:3008/deliveries/delivery_1/approve
# error (409): {"error":"Peças obrigatórias pendentes: caption"}
```

Para testar o fluxo completo, adicione/ aprove também a versão `caption` e repita `/deliveries/delivery_1/approve`. Armazenamento em memória, URLs fictícias; vídeo/upload reais, autenticação e concorrência não implementados.

## Planejamento, execução e revisão

Planejamento e execução utilizando Codex GPT Sol 6.1. As implementações iniciais tiveram assistência de ChatGPT. O Codex realizou a revisão técnica e a análise dos requisitos, inspecionou o código e executou a validação automatizada registrada nesta entrega.

O autor realizou a revisão pessoal dos nove desafios, conforme declarado nesta execução. Os pontos abaixo documentam os critérios de análise da estrutura, da geração de testes e da qualidade do código.

| Área | Pontos de análise e revisão |
|---|---|
| Geração da estrutura | Obter as peças obrigatórias de campaign.required_pieces; manter versões, aprovações e comentários dentro de cada peça. |
| Geração e revisão dos testes | Cobrir peças ausentes, campanha só com vídeo, versão nova após aprovação e comentários ancorados na versão original; verificar também o fluxo completo pelas rotas HTTP. |
| Qualidade estrutural | Conferir aprovação da versão atual de todas as peças exigidas e invalidação da aprovação geral após substituição. |

**Ponto identificado na revisão pessoal e verificado:** o fluxo completo foi executado pela API HTTP: criar campanha e entrega, aprovar vídeo e legenda, aprovar a entrega, substituir o vídeo e tentar aprovar novamente. A substituição invalida a aprovação geral, a tentativa prematura retorna 409 e a nova aprovação só é aceita após aprovar o vídeo atual. A legenda continua aprovada e os comentários permanecem na versão original. O cenário está em `test/http-review.test.js`; a suíte passou em 5 testes, além de `npm run typecheck` (checagem sintática).
